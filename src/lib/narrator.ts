/**
 * Narrador del museo.
 *
 * 1. Voz grabada (preferida): cada frase está pregenerada como MP3 en
 *    public/voz con una voz neuronal boliviana (es-BO-MarceloNeural). Suena
 *    igual en cualquier navegador y no depende de las voces instaladas.
 * 2. Respaldo: Web Speech API (speechSynthesis) para frases sin grabación.
 *    Elige la mejor voz en español disponible y divide el texto en frases para
 *    evitar el corte de ~15 s de Chrome.
 * 3. Sin sonido: muestra los subtítulos con la duración estimada de lectura.
 */
import { audio } from './audio/engine';
import { normalizeForSpeech, splitSentences, voiceKey } from './speechText';

export { normalizeForSpeech, splitSentences } from './speechText';

export type NarrationEvent =
  | { type: 'start'; id: string }
  | { type: 'line'; id: string; text: string; index: number; total: number }
  | { type: 'end'; id: string; cancelled: boolean };

type Listener = (e: NarrationEvent) => void;

const PREFERRED_LANGS = ['es-BO', 'es-PE', 'es-419', 'es-MX', 'es-US', 'es-AR', 'es-CL', 'es-CO', 'es-ES'];
const VOICE_DIR = `${import.meta.env.BASE_URL}voz/`;

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
  if (name.includes('marcelo')) s += 120;
  if (name.includes('sofia') || name.includes('sofía')) s += 60;
  if (v.localService) s += 5;
  return s;
}

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

class Narrator {
  readonly supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  voices: SpeechSynthesisVoice[] = [];
  voice: SpeechSynthesisVoice | null = null;
  rate = 1;
  pitch = 0.98;
  /** Usar las grabaciones pregeneradas cuando existan. */
  useRecorded = true;
  /** Claves de las frases grabadas disponibles. */
  recorded = new Set<string>();
  recordedLabel = '';
  private manifest: Promise<void> | null = null;
  private preferredURI: string | null = null;
  private listeners = new Set<Listener>();
  private voiceListeners = new Set<() => void>();
  private token = 0;
  private currentId: string | null = null;
  private keepAlive: number | null = null;
  private silentTimer: number | null = null;
  private pendingResolve: ((ok: boolean) => void) | null = null;

  constructor() {
    if (typeof window === 'undefined') return;
    void this.loadManifest();
    if (!this.supported) return;
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      this.voices = all.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('es')).sort((a, b) => scoreVoice(b) - scoreVoice(a));
      this.pick();
      this.notifyVoices();
    };
    load();
    window.speechSynthesis.addEventListener?.('voiceschanged', load);
  }

  /** Carga la lista de frases grabadas (public/voz/manifest.json). */
  loadManifest(): Promise<void> {
    if (this.manifest) return this.manifest;
    this.manifest = fetch(`${VOICE_DIR}manifest.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((m: { files?: Record<string, number>; voiceLabel?: string } | null) => {
        if (!m?.files) return;
        this.recorded = new Set(Object.keys(m.files));
        this.recordedLabel = m.voiceLabel ?? '';
        this.notifyVoices();
      })
      .catch(() => undefined);
    return this.manifest;
  }

  get hasRecordings() {
    return this.recorded.size > 0;
  }

  private notifyVoices() {
    this.voiceListeners.forEach((l) => l());
  }

  private pick() {
    const preferred = this.preferredURI ? this.voices.find((v) => v.voiceURI === this.preferredURI) : null;
    this.voice = preferred ?? this.voices[0] ?? null;
  }

  setPreferredVoice(uri: string | null) {
    this.preferredURI = uri;
    this.pick();
    this.notifyVoices();
  }

  setUseRecorded(v: boolean) {
    this.useRecorded = v;
    this.notifyVoices();
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
    audio.stopVoice();
    if (this.supported) window.speechSynthesis.cancel();
  }

  private clearTimers() {
    if (this.keepAlive) window.clearInterval(this.keepAlive);
    if (this.silentTimer) window.clearTimeout(this.silentTimer);
    this.keepAlive = null;
    this.silentTimer = null;
  }

  /** Lee una frase con la Web Speech API. Resuelve al terminar. */
  private speakLine(line: string, token: number): Promise<void> {
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(normalizeForSpeech(line));
      u.lang = this.voice?.lang ?? 'es-419';
      if (this.voice) u.voice = this.voice;
      u.rate = this.rate;
      u.pitch = this.pitch;
      let done = false;
      const go = () => {
        if (done) return;
        done = true;
        resolve();
      };
      u.onend = go;
      u.onerror = go;
      const words = line.split(/\s+/).length;
      // salvaguarda: si el motor no dispara onend
      window.setTimeout(() => {
        if (!done && token === this.token && !window.speechSynthesis.speaking) go();
      }, Math.max(4000, words * 700));
      if (!this.keepAlive) {
        // Chrome pausa síntesis largas: un "resume" periódico la mantiene viva
        this.keepAlive = window.setInterval(() => {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 9000);
      }
      window.speechSynthesis.speak(u);
    });
  }

  /**
   * Narra un texto. `voiced=false` reproduce solo los subtítulos con la
   * duración estimada de lectura (modo silencioso).
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
      const alive = () => token === this.token;

      const run = async () => {
        await this.loadManifest();
        for (let i = 0; i < lines.length; i++) {
          if (!alive()) return resolve(false);
          const line = lines[i];
          this.emit({ type: 'line', id, text: line, index: i, total: lines.length });

          if (!voiced) {
            const words = line.split(/\s+/).length;
            await new Promise<void>((r) => (this.silentTimer = window.setTimeout(r, Math.max(1600, words * 360))));
            continue;
          }

          const key = voiceKey(normalizeForSpeech(line));
          if (this.useRecorded && this.recorded.has(key)) {
            // precarga de la frase siguiente para que no haya pausas
            const nextLine = lines[i + 1];
            if (nextLine) audio.preloadVoice(`${VOICE_DIR}${voiceKey(normalizeForSpeech(nextLine))}.mp3`);
            const ok = await audio.playVoice(`${VOICE_DIR}${key}.mp3`, this.rate);
            if (!alive()) return resolve(false);
            if (ok) {
              await wait(140);
              continue;
            }
            // si el archivo falla, se lee con la voz del navegador
          }

          if (this.supported) await this.speakLine(line, token);
          else await wait(Math.max(1600, line.split(/\s+/).length * 360));
        }
        if (!alive()) return resolve(false);
        this.clearTimers();
        this.currentId = null;
        this.pendingResolve = null;
        this.emit({ type: 'end', id, cancelled: false });
        resolve(true);
      };
      void run();
    });
  }
}

export const narrator = new Narrator();
