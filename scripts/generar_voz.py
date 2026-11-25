"""
Genera las narraciones del museo como archivos MP3 en public/voz/.

Uso (desde la carpeta del proyecto):
    npm run voz            # exporta las frases y genera el audio que falte

Proveedor por defecto: voz neuronal de Microsoft es-BO-MarceloNeural (acento
boliviano) mediante edge-tts (pip install edge-tts mutagen).

Para usar ElevenLabs en su lugar, definir antes la variable de entorno
ELEVENLABS_API_KEY (y opcionalmente ELEVENLABS_VOICE_ID) y borrar public/voz
para regenerar todo:
    set ELEVENLABS_API_KEY=xxxxxxxx
    npm run voz -- --rehacer

La clave de API nunca se guarda en el repositorio ni en el sitio.
"""
import asyncio
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LISTA = ROOT / 'scripts' / 'narraciones.json'
OUT = ROOT / 'public' / 'voz'
MANIFEST = OUT / 'manifest.json'

EDGE_VOICE = os.environ.get('VOZ_EDGE', 'es-BO-MarceloNeural')
EDGE_RATE = os.environ.get('VOZ_VELOCIDAD', '-6%')
EDGE_PITCH = os.environ.get('VOZ_TONO', '-2Hz')
ELEVEN_KEY = os.environ.get('ELEVENLABS_API_KEY', '').strip()
ELEVEN_VOICE = os.environ.get('ELEVENLABS_VOICE_ID', 'pNInz6obpgDQGcFmaJgB')  # «Adam», multilingüe
CONCURRENCIA = 6


def duracion_ms(path: Path) -> int:
    try:
        from mutagen.mp3 import MP3
        return int(MP3(str(path)).info.length * 1000)
    except Exception:
        return int(path.stat().st_size * 8 / 48)  # 48 kbps


async def con_edge(texto: str, destino: Path):
    import edge_tts
    com = edge_tts.Communicate(texto, EDGE_VOICE, rate=EDGE_RATE, pitch=EDGE_PITCH)
    await com.save(str(destino))


def con_elevenlabs(texto: str, destino: Path):
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{ELEVEN_VOICE}?output_format=mp3_44100_64'
    body = json.dumps({
        'text': texto,
        'model_id': 'eleven_multilingual_v2',
        'voice_settings': {'stability': 0.5, 'similarity_boost': 0.8, 'style': 0.2, 'use_speaker_boost': True},
    }).encode('utf-8')
    req = urllib.request.Request(url, data=body, method='POST', headers={
        'xi-api-key': ELEVEN_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    with urllib.request.urlopen(req, timeout=120) as r:
        destino.write_bytes(r.read())


async def generar(frase: dict, sem: asyncio.Semaphore, estado: dict):
    destino = OUT / f"{frase['key']}.mp3"
    if destino.exists() and destino.stat().st_size > 1000:
        return
    async with sem:
        for intento in range(4):
            try:
                tmp = destino.with_suffix('.tmp')
                if ELEVEN_KEY:
                    await asyncio.to_thread(con_elevenlabs, frase['speech'], tmp)
                else:
                    await con_edge(frase['speech'], tmp)
                if tmp.stat().st_size < 1000:
                    raise RuntimeError('audio vacío')
                tmp.replace(destino)
                estado['nuevas'] += 1
                if estado['nuevas'] % 25 == 0:
                    print(f"  {estado['nuevas']} frases generadas…", flush=True)
                return
            except Exception as e:  # reintento con espera creciente
                if intento == 3:
                    print('  ERROR', frase['key'], frase['speech'][:60], e, flush=True)
                    estado['errores'] += 1
                    return
                await asyncio.sleep(2 * (intento + 1))


async def main():
    rehacer = '--rehacer' in sys.argv
    frases = json.loads(LISTA.read_text(encoding='utf-8'))
    OUT.mkdir(parents=True, exist_ok=True)
    if rehacer:
        for f in OUT.glob('*.mp3'):
            f.unlink()
    claves = {f['key'] for f in frases}
    # elimina grabaciones que ya no corresponden a ningún texto
    for f in OUT.glob('*.mp3'):
        if f.stem not in claves:
            f.unlink()
    estado = {'nuevas': 0, 'errores': 0}
    t0 = time.time()
    sem = asyncio.Semaphore(2 if ELEVEN_KEY else CONCURRENCIA)
    await asyncio.gather(*(generar(f, sem, estado) for f in frases))
    files = {}
    for f in frases:
        p = OUT / f"{f['key']}.mp3"
        if p.exists():
            files[f['key']] = duracion_ms(p)
    proveedor = 'ElevenLabs (eleven_multilingual_v2)' if ELEVEN_KEY else f'Microsoft {EDGE_VOICE} (edge-tts)'
    etiqueta = 'Voz grabada · ElevenLabs' if ELEVEN_KEY else 'Marcelo (Bolivia) · voz neuronal'
    MANIFEST.write_text(json.dumps({
        'provider': proveedor,
        'voice': ELEVEN_VOICE if ELEVEN_KEY else EDGE_VOICE,
        'voiceLabel': etiqueta,
        'generated': time.strftime('%Y-%m-%d'),
        'files': files,
    }, ensure_ascii=False), encoding='utf-8')
    total = sum(files.values()) / 1000
    peso = sum((OUT / f'{k}.mp3').stat().st_size for k in files) / 1024 / 1024
    print(f'{len(files)}/{len(frases)} frases · {estado["nuevas"]} nuevas · {estado["errores"]} errores · '
          f'{total / 60:.1f} min de audio · {peso:.1f} MB · {time.time() - t0:.0f} s · {proveedor}')
    if estado['errores']:
        sys.exit(1)


if __name__ == '__main__':
    asyncio.run(main())
