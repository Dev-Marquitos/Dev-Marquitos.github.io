import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AudioLines, Captions, Music2, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react';
import { useExperience, sfx } from '../../stores/useExperience';
import { narrator } from '../../lib/narrator';
import { toggleNarration } from '../../stores/useNarration';
import { useQuality, type Tier } from '../../stores/useQuality';

function Toggle({ on, onClick, label, children }: { on: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={() => {
        sfx.click();
        onClick();
      }}
      title={label}
      aria-label={label}
      aria-pressed={on}
      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${on ? 'text-amber' : 'text-dust hover:text-tin'}`}
    >
      {children}
      {!on && <span className="absolute w-5 h-[1.5px] bg-current rotate-45 rounded-full" />}
    </button>
  );
}

function useVoices() {
  const [, force] = useState(0);
  useEffect(() => narrator.onVoices(() => force((n) => n + 1)), []);
  return narrator.voices;
}

function QualityPicker() {
  const { tier, auto, gpu, setTier, setAuto } = useQuality();
  const opts: [Tier | 'auto', string][] = [
    ['auto', 'Auto'],
    ['high', 'Alta'],
    ['medium', 'Media'],
    ['low', 'Baja'],
  ];
  return (
    <div className="mt-5 pt-5 border-t border-white/10">
      <p className="eyebrow mb-3">Calidad gráfica</p>
      <div className="grid grid-cols-4 gap-1 rounded-lg bg-ore p-1">
        {opts.map(([k, label]) => {
          const on = k === 'auto' ? auto : !auto && tier === k;
          return (
            <button
              key={k}
              onClick={() => (k === 'auto' ? setAuto() : setTier(k))}
              className={`rounded-md py-1.5 text-[11px] font-mono tracking-[0.1em] uppercase transition-colors ${on ? 'bg-amber text-ink' : 'text-tin hover:text-bone'}`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[10.5px] text-dust leading-snug">
        Nivel actual: <span className="text-tin">{tier === 'high' ? 'alta' : tier === 'medium' ? 'media' : 'baja'}</span>
        {auto ? ' (automático)' : ''} · GPU: {gpu.replace(/^ANGLE \(|\)$/g, '').split(',').slice(0, 2).join(',')}
      </p>
    </div>
  );
}

export function SoundConsole() {
  const s = useExperience();
  const [open, setOpen] = useState(false);
  const voices = useVoices();
  const [rate, setRate] = useState(narrator.rate);

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[75] flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            className="panel rounded-2xl p-5 w-[300px] text-sm"
          >
            <p className="eyebrow mb-4">Narrador</p>
            {narrator.supported ? (
              <>
                <label className="block text-xs text-tin mb-1.5" htmlFor="voice">
                  Voz ({voices.length} en español)
                </label>
                <select
                  id="voice"
                  className="w-full bg-ore border border-white/10 rounded-lg px-3 py-2 text-bone text-xs"
                  value={narrator.voice?.voiceURI ?? ''}
                  onChange={(e) => s.setVoiceURI(e.target.value || null)}
                >
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name.replace('Microsoft ', '').replace(' Online (Natural)', ' ✦')} · {v.lang}
                    </option>
                  ))}
                </select>
                <label className="block text-xs text-tin mt-4 mb-1.5">Velocidad · {rate.toFixed(2)}×</label>
                <input
                  type="range"
                  min={0.8}
                  max={1.25}
                  step={0.05}
                  value={rate}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    narrator.rate = v;
                    setRate(v);
                  }}
                  className="w-full range-amber"
                  style={{ ['--fill' as string]: `${((rate - 0.8) / 0.45) * 100}%` }}
                />
                <button
                  onClick={() => toggleNarration('Hola. Soy la voz del museo virtual de Radio Pío Doce.', 'voice-test')}
                  className="mt-4 w-full rounded-lg border border-amber/40 text-amber py-2 text-xs font-mono tracking-[0.15em] uppercase hover:bg-amber hover:text-ink transition-colors"
                >
                  Probar voz
                </button>
                <p className="mt-3 text-[11px] text-dust leading-relaxed">✦ = voz neuronal. En Microsoft Edge aparecen voces de Bolivia (Marcelo, Sofía).</p>
              </>
            ) : (
              <p className="text-tin text-xs leading-relaxed">Este navegador no ofrece síntesis de voz. Los textos se mostrarán como subtítulos.</p>
            )}
            <QualityPicker />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="panel rounded-full flex items-center p-1 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
        <Toggle on={s.musicOn && s.soundOn} onClick={() => s.setMusicOn(!s.musicOn)} label="Música ambiental (M)">
          <Music2 size={17} />
        </Toggle>
        <Toggle on={s.narratorOn} onClick={() => s.setNarratorOn(!s.narratorOn)} label="Narrador (N)">
          <AudioLines size={17} />
        </Toggle>
        <Toggle on={s.subtitlesOn} onClick={() => s.setSubtitlesOn(!s.subtitlesOn)} label="Subtítulos">
          <Captions size={17} />
        </Toggle>
        <Toggle on={s.soundOn} onClick={() => s.setSoundOn(!s.soundOn)} label="Sonido general">
          {s.soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
        </Toggle>
        <span className="w-px h-6 bg-white/10 mx-0.5" />
        <button
          onClick={() => setOpen(!open)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${open ? 'text-amber' : 'text-tin hover:text-bone'}`}
          aria-label="Ajustes de narración"
          title="Ajustes de narración"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
