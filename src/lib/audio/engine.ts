/**
 * Motor de audio del museo (Web Audio API).
 *
 * Grafo:
 *   musicBus ─┐
 *   sfxBus ───┼─> master ─> compressor ─> analyser ─> destination
 *   streamBus ┘ (streamBus pasa antes por streamAnalyser)
 *   reverbSend ─> convolver ─> master
 *
 * Todo el sonido ambiental es procedural (sin archivos): no hay problemas de
 * derechos de autor y el sitio funciona sin conexión.
 */

type StreamStatus = 'idle' | 'connecting' | 'playing' | 'error';
type StreamListener = (status: StreamStatus, info?: { analysable: boolean; error?: string }) => void;

const A4 = 440;
const midiToHz = (m: number) => A4 * Math.pow(2, (m - 69) / 12);

function makeNoiseBuffer(ctx: AudioContext, seconds: number, color: 'white' | 'pink' | 'brown') {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    if (color === 'white') {
      data[i] = white;
    } else if (color === 'pink') {
      // Paul Kellet
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    } else {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  }
  return buffer;
}

function makeImpulse(ctx: AudioContext, seconds = 3.2, decay = 2.6) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const ch = impulse.getChannelData(c);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      // pequeñas reflexiones tempranas + cola difusa
      const early = i < ctx.sampleRate * 0.08 && Math.random() < 0.004 ? (Math.random() * 2 - 1) * 0.8 : 0;
      ch[i] = ((Math.random() * 2 - 1) * Math.pow(1 - t, decay)) + early;
    }
  }
  return impulse;
}

/* ------------------------------------------------------------------------ */
/* Compositor ambiental: pad andino en pentatónica menor + quena + viento    */
/* ------------------------------------------------------------------------ */

const PROGRESSIONS: number[][][] = [
  // La menor – Fa – Do – Sol
  [[45, 57, 60, 64], [41, 57, 60, 65], [48, 55, 60, 64], [43, 55, 59, 62]],
  // La menor – Re menor – Mi menor – La menor
  [[45, 57, 60, 64], [50, 57, 62, 65], [52, 55, 59, 64], [45, 57, 64, 69]],
];
const PENTATONIC = [69, 72, 74, 76, 79, 81, 84]; // La menor pentatónica (A4…C6)

class AmbientComposer {
  private ctx: AudioContext;
  private out: GainNode;
  private send: GainNode;
  private engine: AudioEngine;
  private timer: number | null = null;
  private nextChordTime = 0;
  private chordIndex = 0;
  private progression = 0;
  private nextPhraseTime = 0;
  private nextClankTime = 0;
  private windSource: AudioBufferSourceNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;
  private droneNodes: AudioScheduledSourceNode[] = [];
  private live: AudioScheduledSourceNode[] = [];
  private running = false;
  private intensity = 1;

  constructor(engine: AudioEngine, out: GainNode, send: GainNode) {
    this.engine = engine;
    this.ctx = engine.ctx!;
    this.out = out;
    this.send = send;
  }

  setIntensity(v: number) {
    this.intensity = Math.max(0.2, Math.min(1.4, v));
  }

  start() {
    if (this.running) return;
    this.running = true;
    const t = this.ctx.currentTime + 0.1;
    this.nextChordTime = t;
    this.nextPhraseTime = t + 6;
    this.nextClankTime = t + 14;
    this.startWind();
    this.startDrone();
    this.timer = window.setInterval(() => this.tick(), 250);
  }

  stop() {
    this.running = false;
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    const t = this.ctx.currentTime;
    [...this.droneNodes, ...this.live].forEach((n) => {
      try { n.stop(t + 3); } catch { /* ya detenido */ }
    });
    this.droneNodes = [];
    this.live = [];
    if (this.windSource) {
      try { this.windSource.stop(t + 3); } catch { /* */ }
      this.windSource = null;
    }
  }

  private track(node: AudioScheduledSourceNode) {
    this.live.push(node);
    node.onended = () => {
      this.live = this.live.filter((n) => n !== node);
    };
  }

  private tick() {
    if (!this.running) return;
    const now = this.ctx.currentTime;
    const ahead = now + 1.2;
    while (this.nextChordTime < ahead) {
      this.playChord(this.nextChordTime);
      this.nextChordTime += 9.5;
    }
    if (this.nextPhraseTime < ahead) {
      this.playPhrase(this.nextPhraseTime);
      this.nextPhraseTime += 14 + Math.random() * 16;
    }
    if (this.nextClankTime < ahead) {
      this.engine.clank(this.nextClankTime, 0.05 * this.intensity);
      this.nextClankTime += 22 + Math.random() * 30;
    }
    // viento: deriva aleatoria lenta
    if (this.windFilter && this.windGain) {
      const f = 260 + Math.random() * 640;
      this.windFilter.frequency.setTargetAtTime(f, now, 2.5);
      this.windGain.gain.setTargetAtTime((0.04 + Math.random() * 0.08) * this.intensity, now, 3);
    }
  }

  private startWind() {
    const src = this.ctx.createBufferSource();
    src.buffer = this.engine.pink;
    src.loop = true;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 500;
    bp.Q.value = 0.9;
    const g = this.ctx.createGain();
    g.gain.value = 0;
    g.gain.setTargetAtTime(0.07, this.ctx.currentTime, 3);
    src.connect(bp).connect(g);
    g.connect(this.out);
    g.connect(this.send);
    src.start();
    this.windSource = src;
    this.windFilter = bp;
    this.windGain = g;
  }

  private startDrone() {
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.gain.value = 0;
    g.gain.setTargetAtTime(0.05, t, 4);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 220;
    g.connect(lp).connect(this.out);
    [33, 45, 52].forEach((m, i) => {
      const o = this.ctx.createOscillator();
      o.type = i === 0 ? 'sine' : 'triangle';
      o.frequency.value = midiToHz(m);
      o.detune.value = (Math.random() - 0.5) * 6;
      o.connect(g);
      o.start(t);
      this.droneNodes.push(o);
    });
  }

  private playChord(t: number) {
    const prog = PROGRESSIONS[this.progression];
    const chord = prog[this.chordIndex];
    this.chordIndex = (this.chordIndex + 1) % prog.length;
    if (this.chordIndex === 0 && Math.random() < 0.5) {
      this.progression = (this.progression + 1) % PROGRESSIONS.length;
    }
    const dur = 11.5;
    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0, t);
    voiceGain.gain.linearRampToValueAtTime(0.06 * this.intensity, t + 3.5);
    voiceGain.gain.setValueAtTime(0.06 * this.intensity, t + dur - 4);
    voiceGain.gain.linearRampToValueAtTime(0, t + dur);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(500, t);
    lp.frequency.linearRampToValueAtTime(1100, t + dur * 0.5);
    lp.frequency.linearRampToValueAtTime(600, t + dur);
    lp.Q.value = 0.6;
    voiceGain.connect(lp);
    lp.connect(this.out);
    lp.connect(this.send);
    chord.forEach((m) => {
      [-7, 7].forEach((cents) => {
        const o = this.ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = midiToHz(m);
        o.detune.value = cents;
        o.connect(voiceGain);
        o.start(t);
        o.stop(t + dur + 0.1);
        this.track(o);
      });
    });
    // bajo suave
    const bass = this.ctx.createOscillator();
    bass.type = 'sine';
    bass.frequency.value = midiToHz(chord[0] - 12 < 28 ? chord[0] : chord[0] - 12);
    const bg = this.ctx.createGain();
    bg.gain.setValueAtTime(0, t);
    bg.gain.linearRampToValueAtTime(0.08 * this.intensity, t + 2);
    bg.gain.linearRampToValueAtTime(0, t + dur);
    bass.connect(bg).connect(this.out);
    bass.start(t);
    bass.stop(t + dur + 0.1);
    this.track(bass);
  }

  /** Frase de "quena": triángulo + seno con vibrato y soplo */
  private playPhrase(t: number) {
    const notes = 3 + Math.floor(Math.random() * 4);
    let idx = Math.floor(Math.random() * 4) + 1;
    let time = t;
    for (let i = 0; i < notes; i++) {
      idx = Math.max(0, Math.min(PENTATONIC.length - 1, idx + (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.7 ? 1 : 2)));
      const last = i === notes - 1;
      const dur = last ? 2.2 + Math.random() : 0.45 + Math.random() * 0.9;
      this.quenaNote(time, PENTATONIC[idx], dur);
      time += dur * (last ? 1 : 0.92);
    }
  }

  private quenaNote(t: number, midi: number, dur: number) {
    const ctx = this.ctx;
    const f = midiToHz(midi);
    const g = ctx.createGain();
    const peak = 0.045 * this.intensity;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.09);
    g.gain.setTargetAtTime(peak * 0.75, t + 0.15, 0.3);
    g.gain.setTargetAtTime(0, t + dur - 0.12, 0.12);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2600;
    g.connect(lp);
    lp.connect(this.out);
    const wet = ctx.createGain();
    wet.gain.value = 1.4;
    lp.connect(wet).connect(this.send);

    const vib = ctx.createOscillator();
    vib.frequency.value = 5.1;
    const vibDepth = ctx.createGain();
    vibDepth.gain.setValueAtTime(0, t);
    vibDepth.gain.linearRampToValueAtTime(9, t + Math.min(0.6, dur * 0.6));

    const o1 = ctx.createOscillator();
    o1.type = 'triangle';
    o1.frequency.setValueAtTime(f * 0.985, t);
    o1.frequency.exponentialRampToValueAtTime(f, t + 0.08);
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = f * 2;
    const o2g = ctx.createGain();
    o2g.gain.value = 0.18;
    vib.connect(vibDepth);
    vibDepth.connect(o1.detune);
    vibDepth.connect(o2.detune);
    o1.connect(g);
    o2.connect(o2g).connect(g);

    // soplo
    const breath = ctx.createBufferSource();
    breath.buffer = this.engine.white;
    const bbp = ctx.createBiquadFilter();
    bbp.type = 'bandpass';
    bbp.frequency.value = f * 2.2;
    bbp.Q.value = 2.5;
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0, t);
    bg.gain.linearRampToValueAtTime(0.025 * this.intensity, t + 0.05);
    bg.gain.setTargetAtTime(0.006 * this.intensity, t + 0.1, 0.2);
    bg.gain.setTargetAtTime(0, t + dur - 0.1, 0.1);
    breath.connect(bbp).connect(bg).connect(lp);

    [vib, o1, o2, breath].forEach((n) => {
      n.start(t);
      n.stop(t + dur + 0.6);
      this.track(n);
    });
  }
}

/* ------------------------------------------------------------------------ */
/* Sintonizador: estática + silbido heterodino que desaparece al sintonizar  */
/* ------------------------------------------------------------------------ */

export interface Tuner {
  setSignal: (s: number) => void;
  dispose: () => void;
}

/* ------------------------------------------------------------------------ */

export class AudioEngine {
  ctx: AudioContext | null = null;
  master!: GainNode;
  compressor!: DynamicsCompressorNode;
  analyser!: AnalyserNode;
  streamAnalyser!: AnalyserNode;
  musicBus!: GainNode;
  sfxBus!: GainNode;
  streamBus!: GainNode;
  reverbSend!: GainNode;
  white!: AudioBuffer;
  pink!: AudioBuffer;
  brown!: AudioBuffer;

  private composer: AmbientComposer | null = null;
  private musicLevel = 0.55;
  private sfxLevel = 0.8;
  private soundOn = true;
  private musicOn = true;
  private sfxOn = true;
  private ducked = false;

  // stream en vivo
  private audioEl: HTMLAudioElement | null = null;
  private fallbackEl: HTMLAudioElement | null = null;
  private streamMode: 'webaudio' | 'element' = 'webaudio';
  private streamVolume = 0.85;
  private streamListeners = new Set<StreamListener>();
  private currentStreamUrl: string | null = null;
  private lastHover = 0;

  get ready() {
    return !!this.ctx;
  }

  /** Debe llamarse desde un gesto del usuario (clic). */
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      const ctx = new Ctx({ latencyHint: 'interactive' });
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = this.soundOn ? 1 : 0;
      this.compressor = ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -16;
      this.compressor.ratio.value = 3;
      this.compressor.attack.value = 0.01;
      this.compressor.release.value = 0.25;
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      this.streamAnalyser = ctx.createAnalyser();
      this.streamAnalyser.fftSize = 2048;
      this.streamAnalyser.smoothingTimeConstant = 0.75;

      this.musicBus = ctx.createGain();
      this.musicBus.gain.value = 0;
      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = this.sfxOn ? this.sfxLevel : 0;
      this.streamBus = ctx.createGain();
      this.streamBus.gain.value = this.streamVolume;
      this.reverbSend = ctx.createGain();
      this.reverbSend.gain.value = 0.55;
      const convolver = ctx.createConvolver();
      convolver.buffer = makeImpulse(ctx);

      this.musicBus.connect(this.master);
      this.sfxBus.connect(this.master);
      this.streamBus.connect(this.streamAnalyser).connect(this.master);
      this.reverbSend.connect(convolver).connect(this.master);
      this.master.connect(this.compressor).connect(this.analyser).connect(ctx.destination);

      this.white = makeNoiseBuffer(ctx, 2, 'white');
      this.pink = makeNoiseBuffer(ctx, 4, 'pink');
      this.brown = makeNoiseBuffer(ctx, 4, 'brown');
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  /* ----------------------------- preferencias ---------------------------- */

  setSoundOn(on: boolean) {
    this.soundOn = on;
    if (this.audioEl && this.streamMode === 'element') this.applyElementVolume();
    if (this.fallbackEl) this.applyElementVolume();
    if (!this.ctx) return;
    this.master.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.15);
  }

  setMusicOn(on: boolean) {
    this.musicOn = on;
    if (!this.ctx) return;
    if (on) {
      if (!this.composer) {
        this.composer = new AmbientComposer(this, this.musicBus, this.reverbSend);
        this.composer.start();
      }
    }
    this.applyMusicGain(on ? 4 : 1.2);
    if (!on && this.composer) {
      const c = this.composer;
      this.composer = null;
      window.setTimeout(() => c.stop(), 2500);
    }
  }

  setSfxOn(on: boolean) {
    this.sfxOn = on;
    if (!this.ctx) return;
    this.sfxBus.gain.setTargetAtTime(on ? this.sfxLevel : 0, this.ctx.currentTime, 0.05);
  }

  setMusicIntensity(v: number) {
    this.composer?.setIntensity(v);
  }

  /** Baja música y radio mientras habla el narrador. */
  duck(active: boolean) {
    this.ducked = active;
    if (!this.ctx) return;
    this.applyMusicGain(0.6);
    const target = this.streamVolume * (active ? 0.22 : 1);
    this.streamBus.gain.setTargetAtTime(target, this.ctx.currentTime, 0.25);
    this.applyElementVolume();
  }

  private applyMusicGain(timeConstant: number) {
    if (!this.ctx) return;
    const target = this.musicOn ? this.musicLevel * (this.ducked ? 0.3 : 1) * (this.isStreaming ? 0.15 : 1) : 0;
    this.musicBus.gain.setTargetAtTime(target, this.ctx.currentTime, timeConstant / 3);
  }

  /* --------------------------------- sfx --------------------------------- */

  private noiseBurst(t: number, dur: number, opts: { type?: BiquadFilterType; freq?: number; q?: number; gain?: number; dest?: AudioNode }) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.white;
    const f = ctx.createBiquadFilter();
    f.type = opts.type ?? 'bandpass';
    f.frequency.value = opts.freq ?? 2000;
    f.Q.value = opts.q ?? 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(opts.gain ?? 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(opts.dest ?? this.sfxBus);
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.02);
  }

  click() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.noiseBurst(t, 0.035, { type: 'highpass', freq: 2500, gain: 0.25 });
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.setValueAtTime(1900, t);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.04);
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(g).connect(this.sfxBus);
    o.start(t);
    o.stop(t + 0.06);
  }

  hover() {
    if (!this.ctx) return;
    const now = performance.now();
    if (now - this.lastHover < 70) return;
    this.lastHover = now;
    this.noiseBurst(this.ctx.currentTime, 0.02, { type: 'highpass', freq: 5000, gain: 0.05 });
  }

  tick() {
    if (!this.ctx) return;
    this.noiseBurst(this.ctx.currentTime, 0.012, { type: 'bandpass', freq: 3200, q: 3, gain: 0.12 });
  }

  whoosh() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.pink;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(3500, t + 0.35);
    f.frequency.exponentialRampToValueAtTime(800, t + 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    src.connect(f).connect(g).connect(this.sfxBus);
    src.start(t);
    src.stop(t + 0.8);
  }

  /** Ráfaga de estática con chasquidos (cambio de "dial" entre páginas). */
  staticBurst(duration = 0.55, level = 0.22) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.white;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2600;
    bp.Q.value = 0.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(level, t);
    g.gain.setTargetAtTime(0, t + duration * 0.6, duration * 0.25);
    src.connect(bp).connect(g).connect(this.sfxBus);
    src.start(t, Math.random());
    src.stop(t + duration + 0.5);
    for (let i = 0; i < 7; i++) {
      this.noiseBurst(t + Math.random() * duration, 0.01 + Math.random() * 0.02, { type: 'highpass', freq: 1500, gain: 0.3 * level * 4 });
    }
    // silbido corto
    const o = ctx.createOscillator();
    o.type = 'sine';
    const og = ctx.createGain();
    o.frequency.setValueAtTime(2400, t);
    o.frequency.exponentialRampToValueAtTime(600, t + duration);
    og.gain.setValueAtTime(0.025, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    o.connect(og).connect(this.sfxBus);
    o.start(t);
    o.stop(t + duration + 0.05);
  }

  /** Encendido de un receptor a válvulas: golpe + zumbido de red de 50 Hz. */
  powerOn() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const thump = ctx.createOscillator();
    thump.frequency.setValueAtTime(110, t);
    thump.frequency.exponentialRampToValueAtTime(38, t + 0.3);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.6, t);
    tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    thump.connect(tg).connect(this.sfxBus);
    thump.start(t);
    thump.stop(t + 0.5);
    this.noiseBurst(t, 0.06, { type: 'highpass', freq: 1200, gain: 0.35 });

    const hum = ctx.createOscillator();
    hum.type = 'sawtooth';
    hum.frequency.value = 50;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(80, t);
    lp.frequency.linearRampToValueAtTime(420, t + 2.2);
    const hg = ctx.createGain();
    hg.gain.setValueAtTime(0.0001, t);
    hg.gain.exponentialRampToValueAtTime(0.06, t + 1.6);
    hg.gain.exponentialRampToValueAtTime(0.0001, t + 5.5);
    hum.connect(lp).connect(hg).connect(this.sfxBus);
    hum.start(t);
    hum.stop(t + 5.6);
  }

  powerOff() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(1400, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 1.1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.09, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    o.connect(g).connect(this.sfxBus);
    o.start(t);
    o.stop(t + 1.25);
    this.noiseBurst(t, 0.08, { type: 'lowpass', freq: 300, gain: 0.5 });
  }

  /** Golpe metálico lejano (vagonetas, martillos) con mucha reverberación. */
  clank(t?: number, level = 0.05) {
    if (!this.ctx) return;
    const time = t ?? this.ctx.currentTime;
    const freqs = [820 + Math.random() * 300, 1900 + Math.random() * 500, 3600 + Math.random() * 700];
    freqs.forEach((f, i) => {
      this.noiseBurst(time + i * 0.004, 0.6 + Math.random() * 0.8, { type: 'bandpass', freq: f, q: 18, gain: level * (1.6 - i * 0.4), dest: this.reverbSend });
    });
  }

  /** Código morse. */
  morse(text: string, opts: { wpm?: number; freq?: number; gain?: number } = {}) {
    if (!this.ctx) return 0;
    const table: Record<string, string> = {
      A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
      M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
      Y: '-.--', Z: '--..', '1': '.----', '2': '..---', '9': '----.', '5': '.....', '0': '-----',
    };
    const unit = 1.2 / (opts.wpm ?? 20);
    const ctx = this.ctx;
    let t = ctx.currentTime + 0.05;
    const o = ctx.createOscillator();
    o.frequency.value = opts.freq ?? 720;
    const g = ctx.createGain();
    g.gain.value = 0;
    o.connect(g).connect(this.sfxBus);
    const peak = opts.gain ?? 0.05;
    for (const ch of text.toUpperCase()) {
      if (ch === ' ') { t += unit * 4; continue; }
      const code = table[ch];
      if (!code) continue;
      for (const sym of code) {
        const len = sym === '.' ? unit : unit * 3;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(peak, t + 0.005);
        g.gain.setValueAtTime(peak, t + len - 0.005);
        g.gain.linearRampToValueAtTime(0, t + len);
        t += len + unit;
      }
      t += unit * 2;
    }
    o.start(ctx.currentTime);
    o.stop(t + 0.1);
    return t - ctx.currentTime;
  }

  /** Sintonizador continuo para diales interactivos. */
  createTuner(): Tuner {
    if (!this.ctx) return { setSignal: () => {}, dispose: () => {} };
    const ctx = this.ctx;
    const noise = ctx.createBufferSource();
    noise.buffer = this.white;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2200;
    bp.Q.value = 0.45;
    const ng = ctx.createGain();
    ng.gain.value = 0;
    noise.connect(bp).connect(ng).connect(this.sfxBus);
    const whistle = ctx.createOscillator();
    whistle.type = 'sine';
    const wg = ctx.createGain();
    wg.gain.value = 0;
    whistle.connect(wg).connect(this.sfxBus);
    noise.start();
    whistle.start();
    let disposed = false;
    return {
      setSignal: (s: number) => {
        if (disposed) return;
        const now = ctx.currentTime;
        const clamped = Math.max(0, Math.min(1, s));
        ng.gain.setTargetAtTime((1 - clamped) * 0.16, now, 0.05);
        const off = 1 - clamped;
        whistle.frequency.setTargetAtTime(120 + off * 2600, now, 0.04);
        wg.gain.setTargetAtTime(clamped > 0.97 ? 0 : off * 0.03 + (clamped > 0.6 ? 0.012 : 0), now, 0.05);
      },
      dispose: () => {
        if (disposed) return;
        disposed = true;
        const now = ctx.currentTime;
        ng.gain.setTargetAtTime(0, now, 0.08);
        wg.gain.setTargetAtTime(0, now, 0.05);
        noise.stop(now + 0.5);
        whistle.stop(now + 0.5);
      },
    };
  }

  /* --------------------------- voz grabada ---------------------------- */

  private voiceEl: HTMLAudioElement | null = null;
  private voiceResolve: ((ok: boolean) => void) | null = null;
  private preloaded = new Set<string>();

  private ensureVoiceElement() {
    if (this.voiceEl) return this.voiceEl;
    const el = new Audio();
    el.preload = 'auto';
    if (this.ctx) {
      // la voz pasa por el bus maestro: respeta el volumen general y el compresor
      const src = this.ctx.createMediaElementSource(el);
      const gain = this.ctx.createGain();
      gain.gain.value = 1.15;
      src.connect(gain).connect(this.master);
    }
    this.voiceEl = el;
    return el;
  }

  /** Reproduce una frase grabada. Resuelve `true` al terminar, `false` si falla o se detiene. */
  playVoice(url: string, rate = 1): Promise<boolean> {
    this.unlock();
    const el = this.ensureVoiceElement();
    this.stopVoice();
    return new Promise<boolean>((resolve) => {
      this.voiceResolve = resolve;
      const done = (ok: boolean) => {
        el.onended = null;
        el.onerror = null;
        if (this.voiceResolve === resolve) {
          this.voiceResolve = null;
          resolve(ok);
        }
      };
      el.onended = () => done(true);
      el.onerror = () => done(false);
      el.src = url;
      el.playbackRate = rate;
      el.preservesPitch = true;
      if (!this.ctx) el.volume = this.soundOn ? 1 : 0;
      el.play().catch(() => done(false));
    });
  }

  stopVoice() {
    if (this.voiceEl && !this.voiceEl.paused) this.voiceEl.pause();
    const r = this.voiceResolve;
    this.voiceResolve = null;
    r?.(false);
  }

  /** Calienta la caché HTTP con la siguiente frase. */
  preloadVoice(url: string) {
    if (this.preloaded.has(url)) return;
    this.preloaded.add(url);
    void fetch(url).catch(() => this.preloaded.delete(url));
  }

  /* ------------------------------ stream ------------------------------- */

  onStream(listener: StreamListener): () => void {
    this.streamListeners.add(listener);
    return () => {
      this.streamListeners.delete(listener);
    };
  }

  private emit(status: StreamStatus, info?: { analysable: boolean; error?: string }) {
    this.streamListeners.forEach((l) => l(status, info));
  }

  get isStreaming() {
    const el = this.streamMode === 'webaudio' ? this.audioEl : this.fallbackEl;
    return !!el && !el.paused;
  }

  get streamAnalysable() {
    return this.streamMode === 'webaudio';
  }

  setStreamVolume(v: number) {
    this.streamVolume = v;
    if (this.ctx) this.streamBus.gain.setTargetAtTime(v * (this.ducked ? 0.22 : 1), this.ctx.currentTime, 0.05);
    this.applyElementVolume();
  }

  private applyElementVolume() {
    const v = this.soundOn ? this.streamVolume * (this.ducked ? 0.22 : 1) : 0;
    if (this.fallbackEl) this.fallbackEl.volume = Math.max(0, Math.min(1, v));
  }

  private ensureAudioElement() {
    if (this.audioEl || !this.ctx) return;
    const el = new Audio();
    el.crossOrigin = 'anonymous';
    el.preload = 'none';
    const src = this.ctx.createMediaElementSource(el);
    src.connect(this.streamBus);
    this.audioEl = el;
    el.addEventListener('playing', () => { this.emit('playing', { analysable: true }); this.applyMusicGain(1); });
    el.addEventListener('waiting', () => this.emit('connecting', { analysable: true }));
    el.addEventListener('error', () => {
      if (!this.currentStreamUrl) return;
      // CORS u otro fallo: reintentar con un elemento simple (sin análisis espectral)
      void this.playFallback(this.currentStreamUrl);
    });
  }

  private async playFallback(url: string) {
    this.streamMode = 'element';
    if (!this.fallbackEl) {
      this.fallbackEl = new Audio();
      this.fallbackEl.preload = 'none';
      this.fallbackEl.addEventListener('playing', () => { this.emit('playing', { analysable: false }); this.applyMusicGain(1); });
      this.fallbackEl.addEventListener('waiting', () => this.emit('connecting', { analysable: false }));
      this.fallbackEl.addEventListener('error', () => this.emit('error', { analysable: false, error: 'No se pudo conectar con la señal en vivo.' }));
    }
    this.applyElementVolume();
    this.fallbackEl.src = url;
    try {
      await this.fallbackEl.play();
    } catch {
      this.emit('error', { analysable: false, error: 'El navegador bloqueó la reproducción o la señal no está disponible.' });
    }
  }

  async playStream(url: string) {
    this.unlock();
    this.stopStream(false);
    // cada intento vuelve a probar primero la ruta con análisis espectral (CORS)
    this.streamMode = 'webaudio';
    this.currentStreamUrl = url;
    this.emit('connecting', { analysable: true });
    const busted = url + (url.includes('?') ? '&' : '?') + 'museo=' + Date.now();
    this.ensureAudioElement();
    if (!this.audioEl) return;
    this.audioEl.src = busted;
    try {
      await this.audioEl.play();
    } catch (e) {
      const err = e as DOMException;
      if (err?.name === 'NotAllowedError') {
        this.emit('error', { analysable: true, error: 'Toca de nuevo para permitir el audio.' });
      }
      // los errores de red los maneja el listener 'error'
    }
  }

  stopStream(emit = true) {
    this.currentStreamUrl = null;
    [this.audioEl, this.fallbackEl].forEach((el) => {
      if (!el) return;
      el.pause();
      el.removeAttribute('src');
      el.load();
    });
    this.applyMusicGain(2);
    if (emit) this.emit('idle', { analysable: this.streamMode === 'webaudio' });
  }

  /* ---------------------------- análisis -------------------------------- */

  /** Nivel RMS 0..1 de la salida general o solo del stream. */
  level(source: 'master' | 'stream' = 'master', buf?: Uint8Array<ArrayBuffer>) {
    if (!this.ctx) return 0;
    const an = source === 'master' ? this.analyser : this.streamAnalyser;
    const data = buf ?? new Uint8Array(an.fftSize);
    an.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    return Math.min(1, Math.sqrt(sum / data.length) * 2.4);
  }
}

export const audio = new AudioEngine();
