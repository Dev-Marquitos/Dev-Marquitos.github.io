/** Utilidades de texto compartidas por el narrador y por el generador de voz. */

/** Ajusta la pronunciación de siglas y números romanos para la voz sintética. */
export function normalizeForSpeech(text: string) {
  return text
    .replace(/\[(…|⋯)\]/g, '')
    .replace(/\(Fuente:[^)]*\)/g, '')
    .replace(/\[[A-Z0-9]+\]/g, '')
    .replace(/,?\s*Ph\.D\.,?/g, ',')
    .replace(/\bPP\.\s/g, 'padres ')
    .replace(/\bP\.\s(?=[A-ZÁÉÍÓÚ])/g, 'Padre ')
    .replace(/\bc\.\s(?=\d)/g, 'hacia ')
    .replace(/Simón I\. Patiño/g, 'Simón Iturri Patiño')
    .replace(/(\d+)\s*–\s*(\d+)/g, '$1 a $2')
    .replace(/Siglo XX/g, 'Siglo Veinte')
    .replace(/Pío XII/g, 'Pío Doce')
    .replace(/Pio XII/g, 'Pío Doce')
    .replace(/\bXII\b/g, 'Doce')
    .replace(/\bsiglo XX\b/gi, 'siglo veinte')
    .replace(/\bD\.?\s?S\.?\s?21060\b/g, 'Decreto Supremo veintiún mil sesenta')
    .replace(/\b21060\b/g, 'veintiún mil sesenta')
    .replace(/\bFSTMB\b/g, 'Federación Sindical de Trabajadores Mineros de Bolivia')
    .replace(/\bCOMIBOL\b/g, 'Comibol')
    .replace(/\bCOB\b/g, 'Central Obrera Boliviana')
    .replace(/\bALER\b/g, 'Aler')
    .replace(/\bERBOL\b/g, 'Erbol')
    .replace(/r\.p\.m\./g, 'revoluciones por minuto')
    .replace(/m s\. n\. m\./g, 'metros sobre el nivel del mar')
    .replace(/\bkHz\b/g, 'kilohercios')
    .replace(/\bMHz\b/g, 'megahercios')
    .replace(/\bOMI\b/g, 'oblato')
    .replace(/\s*–\s*/g, ', ')
    .replace(/[«»“”"]/g, '')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Abreviaturas e iniciales que no cierran una frase (se protegen al dividir). */
const ABBR = /\b(Ph\.D|Dra|Dr|Sra|Sr|Mons|Lic|Ing|etc|núm|vol|pp|Eds|Ed|eds|ed|[A-Za-zÁÉÍÓÚÑáéíóúñ])\.(?=[\s,;:)]|$|[A-Za-z])/g;
const DOT = '․';

/** Divide un texto en frases de lectura (una línea de subtítulo cada una). */
export function splitSentences(text: string): string[] {
  const clean = text
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\[…\]/g, '[⋯]')
    .replace(ABBR, (m) => m.replace(/\./g, DOT));
  if (!clean) return [];
  const raw = clean.match(/[^.!?…;:]+[.!?…;:]+["»”)]?\s*|[^.!?…;:]+$/g) ?? [clean];
  const out: string[] = [];
  let buf = '';
  for (const piece of raw) {
    const p = piece.trim();
    if (!p) continue;
    // fragmentos cortos se unen a la frase siguiente
    if (!buf || buf.length < 30 || (buf + ' ' + p).length < 60) {
      buf = (buf + ' ' + p).trim();
      continue;
    }
    out.push(buf);
    buf = p;
    // fragmentos muy largos: cortar en comas
    while (buf.length > 220) {
      const cut = buf.lastIndexOf(',', 200);
      if (cut < 60) break;
      out.push(buf.slice(0, cut + 1).trim());
      buf = buf.slice(cut + 1).trim();
    }
  }
  if (buf) out.push(buf);
  return out.map((l) => l.replace(/․/g, '.').replace(/\[⋯\]/g, '[…]'));
}

/** Clave estable de una frase hablada (FNV-1a + djb2): nombre del archivo de audio. */
export function voiceKey(speech: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 5381;
  for (let i = 0; i < speech.length; i++) {
    const c = speech.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = (Math.imul(h2, 33) + c) >>> 0;
  }
  return h1.toString(36).padStart(7, '0') + h2.toString(36).padStart(7, '0');
}
