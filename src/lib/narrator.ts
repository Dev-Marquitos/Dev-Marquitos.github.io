/**
 * Narrador del museo basado en la Web Speech API (speechSynthesis).
 *
 * - Elige automáticamente la mejor voz en español disponible (prioriza voces
 *   neuronales de Bolivia / Latinoamérica: p. ej. "Microsoft Marcelo Online
 *   (Natural) - Spanish (Bolivia)" en Microsoft Edge).
 * - Divide el texto en frases para evitar el corte de ~15 s de Chrome y para
 *   sincronizar los subtítulos.
 * - Si la síntesis de voz no está disponible, simula la duración de lectura
 *   para que los subtítulos y el recorrido guiado sigan funcionando.
 */

export type NarrationEvent =
  | { type: 'start'; id: string }
  | { type: 'line'; id: string; text: string; index: number; total: number }
  | { type: 'end'; id: string; cancelled: boolean };

type Listener = (e: NarrationEvent) => void;

const PREFERRED_LANGS = ['es-BO', 'es-PE', 'es-419', 'es-MX', 'es-US', 'es-AR', 'es-CL', 'es-CO', 'es-ES'];

function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.replace('_', '-');
  if (!lang.toLowerCase().startsWith('es')) return -1;
  let s = 0;
  const li = PREFERRED_LANGS.findIndex((l) => l.toLowerCase() === lang.toLowerCase());
  s += li >= 0 ? (PREFERRED_LANGS.length - li) * 10 : 5;
  if (name.includes('natural')) s += 400;
  else if (name.includes('online')) s += 250;
  if (name.includes('google')) s += 150;
  // voz masculina grave tipo locutor de radio
  if (name.includes('marcelo')) s += 120;
  if (name.includes('sofia') || name.includes('sofía')) s += 60;
  if (name.includes('jorge') || name.includes('alonso') || name.includes('gonzalo') || name.includes('tomas') || name.includes('raul') || name.includes('pablo')) s += 25;
  if (v.localService) s += 5;
  return s;
}

/** Ajusta la pronunciación de siglas y números romanos para la voz sintética. */
export function normalizeForSpeech(text: string) {
  return text
    .replace(/Siglo XX/g, 'Siglo Veinte')
    .replace(/Pío XII/g, 'Pío Doce')
    .replace(/Pio XII/g, 'Pío Doce')
    .replace(/\bXII\b/g, 'Doce')
    .replace(/\bsiglo XX\b/gi, 'siglo veinte')
    .replace(/\bD\.?\s?S\.?\s?21060\b/g, 'Decreto Supremo veintiún mil sesenta')
    .replace(/\b21060\b/g, 'veintiún mil sesenta')
    .replace(/\bFSTMB\b/g, 'Federación Sindical de Trabajadores Mineros de Bolivia')
    .replace(/\bCOMIBOL\b/g, 'Comibol')
    .replace(/\bALER\b/g, 'Aler')
    .replace(/\bERBOL\b/g, 'Erbol')
    .replace(/r\.p\.m\./g, 'revoluciones por minuto')
    .replace(/m s\. n\. m\./g, 'metros sobre el nivel del mar')
    .replace(/\bkHz\b/g, 'kilohercios')
    .replace(/\bMHz\b/g, 'megahercios')
    .replace(/\bOMI\b/g, 'oblato')
    .replace(/–/g, ', ')
    .replace(/[«»“”"]/g, '');
}

export function splitSentences(text: string): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const raw = clean.match(/[^.!?…;:]+[.!?…;:]+["»”)]?\s*|[^.!?…;:]+$/g) ?? [clean];
  const out: string[] = [];
  let buf = '';
  for (const piece of raw) {
    const p = piece.trim();
    if (!p) continue;
    if ((buf + ' ' + p).trim().length < 60) {
      buf = (buf + ' ' + p).trim();
      continue;
    }
    if (buf) out.push(buf);
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
  return out;
}

class Narrator {
  readonly supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  voices: SpeechSynthesisVoice[] = [];
  voice: SpeechSynthesisVoice | null = null;
  rate = 1;
  pitch = 0.98;
  private preferredURI: string | null = null;
  private listeners = new Set<Listener>();
  private voiceListeners = new Set<() => void>();
  private token = 0;
  private currentId: string | null = null;
  private keepAlive: number | null = null;
  private silentTimer: number | null = null;

  constructor() {
    if (!this.supported) return;
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      this.voices = all.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('es')).sort((a, b) => scoreVoice(b) - scoreVoice(a));
      this.pick();
      this.voiceListeners.forEach((l) => l());
    };
    load();
    window.speechSynthesis.addEventListener?.('voiceschanged', load);
  }

  private pick() {
    const preferred = this.preferredURI ? this.voices.find((v) => v.voiceURI === this.preferredURI) : null;
    this.voice = preferred ?? this.voices[0] ?? null;
  }

  setPreferredVoice(uri: string | null) {
    this.preferredURI = uri;
    this.pick();
    this.voiceListeners.forEach((l) => l());
  }

  onVoices(l: () => void): () => void {
    this.voiceListeners.add(l);
    return () => {
      this.voiceListeners.delete(l);
    };
  }

  on(l: Listener): () => void {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  }

  private emit(e: NarrationEvent) {
    this.listeners.forEach((l) => l(e));
  }

  get speakingId() {
    return this.currentId;
  }

  /** Detiene cualquier narración en curso. */
  cancel() {
    if (this.currentId) {
      const id = this.currentId;
      this.currentId = null;
      this.token++;
      this.emit({ type: 'end', id, cancelled: true });
    }
    this.clearTimers();
    const pending = this.pendingResolve;
    this.pendingResolve = null;
    pending?.(false);
    if (this.supported) window.speechSynthesis.cancel();
  }

  private pendingResolve: ((ok: boolean) => void) | null = null;

  private clearTimers() {
    if (this.keepAlive) window.clearInterval(this.keepAlive);
    if (this.silentTimer) window.clearTimeout(this.silentTimer);
    this.keepAlive = null;
    this.silentTimer = null;
  }

  /**
   * Narra un texto. `voiced=false` reproduce solo los subtítulos con la
   * duración estimada de lectura (modo silencioso / sin soporte de voz).
   * Resuelve `true` si terminó, `false` si se canceló.
   */
  speak(text: string, id = 'n' + Date.now(), voiced = true): Promise<boolean> {
    this.cancel();
    const token = ++this.token;
    const lines = splitSentences(text);
    this.currentId = id;
    this.emit({ type: 'start', id });

    return new Promise<boolean>((resolve) => {
      this.pendingResolve = resolve;
      const finish = (ok: boolean) => {
        if (token !== this.token) return resolve(false);
        this.clearTimers();
        this.currentId = null;
        this.pendingResolve = null;
        this.emit({ type: 'end', id, cancelled: !ok });
        resolve(ok);
      };

      const useVoice = voiced && this.supported;
      if (useVoice) {
        // Chrome pausa síntesis largas: un "resume" periódico la mantiene viva
        this.keepAlive = window.setInterval(() => {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 9000);
      }

      const next = (i: number) => {
        if (token !== this.token) return resolve(false);
        if (i >= lines.length) return finish(true);
        const line = lines[i];
        this.emit({ type: 'line', id, text: line, index: i, total: lines.length });
        if (!useVoice) {
          const words = line.split(/\s+/).length;
          this.silentTimer = window.setTimeout(() => next(i + 1), Math.max(1600, words * 360));
          return;
        }
        const u = new SpeechSynthesisUtterance(normalizeForSpeech(line));
        u.lang = this.voice?.lang ?? 'es-419';
        if (this.voice) u.voice = this.voice;
        u.rate = this.rate;
        u.pitch = this.pitch;
        let done = false;
        const go = () => {
          if (done) return;
          done = true;
          next(i + 1);
        };
        u.onend = go;
        u.onerror = (ev) => {
          if (ev.error === 'interrupted' || ev.error === 'canceled') return;
          go();
        };
        // salvaguarda: si el motor no dispara onend
        const words = line.split(/\s+/).length;
        window.setTimeout(() => {
          if (!done && token === this.token && !window.speechSynthesis.speaking) go();
        }, Math.max(4000, words * 700));
        window.speechSynthesis.speak(u);
      };
      next(0);
    });
  }
}

export const narrator = new Narrator();
