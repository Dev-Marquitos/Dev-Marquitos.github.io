import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Power, Radio as RadioIcon, Users, Activity, Clock, Signal } from 'lucide-react';
import { STATIONS } from '../data/stations';
import { MEMORY, type MemoryStation } from '../data/memory';
import { NARRATION } from '../data/narration';
import { useRadio } from '../stores/useRadio';
import { narrate, stopNarration, useNarration } from '../stores/useNarration';
import { useExperience, sfx } from '../stores/useExperience';
import { audio, type Tuner } from '../lib/audio/engine';
import { Footer } from '../components/layout/Footer';
import { NarrateButton, Reveal, SplitTitle } from '../components/ui/Reveal';

const LiveRadioScene = lazy(() => import('../components/three/scenes/LiveRadioScene'));

/* ------------------------------ visualizador ------------------------------ */

function Spectrum() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    const freq = new Uint8Array(1024);
    const wave = new Uint8Array(2048);
    let raf = 0;
    const bars = 72;
    const smooth = new Float32Array(bars);
    const draw = (t: number) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = c.clientWidth * dpr, H = c.clientHeight * dpr;
      if (c.width !== W || c.height !== H) {
        c.width = W;
        c.height = H;
      }
      ctx.clearRect(0, 0, W, H);
      const r = useRadio.getState();
      const playing = r.status === 'playing';
      const real = playing && r.analysable && audio.ready;
      if (real) {
        audio.streamAnalyser.getByteFrequencyData(freq);
        audio.streamAnalyser.getByteTimeDomainData(wave);
      }
      // cuadrícula
      ctx.strokeStyle = 'rgba(237,229,211,0.06)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 5; i++) {
        const y = (H * i) / 5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      const bw = W / bars;
      for (let i = 0; i < bars; i++) {
        // escala logarítmica 40 Hz – 16 kHz
        const f0 = 40 * Math.pow(16000 / 40, i / bars);
        const f1 = 40 * Math.pow(16000 / 40, (i + 1) / bars);
        const nyq = 22050;
        const b0 = Math.floor((f0 / nyq) * 1024);
        const b1 = Math.max(b0 + 1, Math.floor((f1 / nyq) * 1024));
        let v = 0;
        if (real) {
          for (let b = b0; b < b1; b++) v = Math.max(v, freq[b] ?? 0);
          v /= 255;
        } else if (playing) {
          v = 0.25 + 0.35 * Math.abs(Math.sin(t / 300 + i * 0.4)) * (1 - i / bars) + Math.random() * 0.1;
        } else {
          v = 0.03 + Math.random() * 0.02;
        }
        smooth[i] += (v - smooth[i]) * 0.35;
        const h = smooth[i] * H * 0.92;
        const g = ctx.createLinearGradient(0, H, 0, H - h);
        g.addColorStop(0, 'rgba(184,116,31,0.9)');
        g.addColorStop(0.7, 'rgba(242,165,65,0.95)');
        g.addColorStop(1, smooth[i] > 0.78 ? 'rgba(224,80,47,1)' : 'rgba(255,201,119,1)');
        ctx.fillStyle = g;
        ctx.fillRect(i * bw + bw * 0.18, H - h, bw * 0.64, h);
      }
      // osciloscopio
      ctx.strokeStyle = 'rgba(123,224,123,0.85)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.shadowColor = 'rgba(123,224,123,0.8)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let x = 0; x < W; x += 2) {
        const idx = Math.floor((x / W) * wave.length);
        const v = real ? (wave[idx] - 128) / 128 : playing ? Math.sin(x / 18 + t / 90) * 0.15 * Math.sin(t / 400) : 0;
        const y = H * 0.3 + v * H * 0.22;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="w-full h-full block" />;
}

function VuMeter({ label }: { label: string }) {
  const needle = useRef<SVGGElement>(null);
  useEffect(() => {
    const buf = new Uint8Array(2048);
    let v = 0, raf = 0;
    const loop = () => {
      const r = useRadio.getState();
      const raw = r.status === 'playing' ? (r.analysable && audio.ready ? audio.level('stream', buf) : 0.4 + Math.random() * 0.2) : 0;
      v += (raw - v) * 0.2;
      if (needle.current) needle.current.setAttribute('transform', `rotate(${-48 + v * 96} 60 64)`);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <svg viewBox="0 0 120 74" className="w-full h-auto">
      <rect x="1" y="1" width="118" height="72" rx="8" fill="#efe4c6" stroke="#3a3229" strokeWidth="2" />
      <path d="M 18 52 A 48 48 0 0 1 102 52" fill="none" stroke="#2a1e10" strokeWidth="1.5" />
      <path d="M 84 31 A 48 48 0 0 1 102 52" fill="none" stroke="#b3260f" strokeWidth="4" />
      {Array.from({ length: 11 }).map((_, i) => {
        const a = (-138 + i * 9.6) * (Math.PI / 180);
        const x0 = 60 + Math.cos(a) * 44, y0 = 64 + Math.sin(a) * 44;
        const x1 = 60 + Math.cos(a) * 50, y1 = 64 + Math.sin(a) * 50;
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#2a1e10" strokeWidth={i % 5 === 0 ? 1.6 : 0.8} />;
      })}
      <text x="60" y="44" textAnchor="middle" fontSize="9" fontWeight="700" fill="#2a1e10" fontFamily="JetBrains Mono Variable, monospace">
        VU
      </text>
      <text x="10" y="13" fontSize="6" fill="#2a1e10" fontFamily="JetBrains Mono Variable, monospace" letterSpacing="1">
        {label}
      </text>
      <g ref={needle} transform="rotate(-48 60 64)">
        <line x1="60" y1="64" x2="60" y2="14" stroke="#1a1208" strokeWidth="1.3" />
      </g>
      <circle cx="60" cy="64" r="3.5" fill="#1a1208" />
    </svg>
  );
}

function Knob({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const start = useRef<{ y: number; v: number } | null>(null);
  const angle = -135 + value * 270;
  return (
    <div
      ref={ref}
      role="slider"
      aria-label="Volumen"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      tabIndex={0}
      className="relative w-24 h-24 rounded-full select-none touch-none cursor-grab active:cursor-grabbing"
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        start.current = { y: e.clientY, v: value };
      }}
      onPointerMove={(e) => {
        if (!start.current) return;
        const nv = Math.max(0, Math.min(1, start.current.v + (start.current.y - e.clientY) / 160));
        if (Math.abs(nv - value) > 0.02) sfx.tick();
        onChange(nv);
      }}
      onPointerUp={() => (start.current = null)}
      onWheel={(e) => onChange(Math.max(0, Math.min(1, value - e.deltaY / 1200)))}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') onChange(Math.min(1, value + 0.05));
        if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') onChange(Math.max(0, value - 0.05));
      }}
      data-lenis-prevent
      data-cursor="GIRAR"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0">
        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(237,229,211,0.1)" strokeWidth="3" strokeDasharray="217 300" transform="rotate(135 50 50)" />
        <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-amber)" strokeWidth="3" strokeDasharray={`${217 * value} 300`} transform="rotate(135 50 50)" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-3 rounded-full bg-gradient-to-b from-[#3a2f24] to-[#120e0a] border border-white/10 shadow-[inset_0_2px_6px_rgba(255,255,255,0.08),0_10px_25px_rgba(0,0,0,0.6)]" style={{ transform: `rotate(${angle}deg)` }}>
        <span className="absolute left-1/2 top-2 -translate-x-1/2 w-1 h-4 rounded-full bg-amber" />
      </div>
    </div>
  );
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

function Player() {
  const r = useRadio();
  const now = useClock();
  const station = STATIONS.find((s) => s.id === r.stationId) ?? STATIONS[0];
  const on = r.status === 'playing';
  const connecting = r.status === 'connecting';

  useEffect(() => {
    void useRadio.getState().refreshStats();
    const t = window.setInterval(() => void useRadio.getState().refreshStats(), 30000);
    return () => window.clearInterval(t);
  }, [r.stationId]);

  const time = now.toLocaleTimeString('es-BO', { timeZone: 'America/La_Paz', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const since = r.onAirSince ? new Date(r.onAirSince).toLocaleTimeString('es-BO', { timeZone: 'America/La_Paz', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <section className="px-3 md:px-12 pb-16 max-w-[1500px] mx-auto">
      <div className="grid lg:grid-cols-[1.05fr_1fr] gap-4">
        <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-ink aspect-[4/3] lg:aspect-auto lg:min-h-[640px]">
          <Suspense fallback={null}>
            <LiveRadioScene />
          </Suspense>
          <div className="absolute top-5 left-5 flex items-center gap-3 rounded-full panel px-4 py-2">
            <span className={`w-2.5 h-2.5 rounded-full ${on ? 'bg-signal' : connecting ? 'bg-amber blink-soft' : 'bg-ember'}`} />
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase">{on ? 'Al aire' : connecting ? 'Conectando…' : 'Receptor apagado'}</span>
          </div>
          <p className="absolute bottom-5 left-5 right-5 text-center font-mono text-[10px] tracking-[0.2em] uppercase text-dust">Arrastra para girar el receptor · el dial brilla con la señal real</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#1d1712] to-[#0f0c09] p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-amber">Red Pío XII · streaming ALER</p>
              <h2 className="mt-2 font-display text-3xl md:text-4xl leading-tight">{station.name}</h2>
              <p className="text-tin text-sm mt-1">{station.city}</p>
            </div>
            <button
              onClick={() => {
                sfx.click();
                if (on || connecting) r.stop();
                else {
                  audio.powerOn();
                  r.play();
                }
              }}
              className={`shrink-0 w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all ${
                on ? 'border-signal text-signal shadow-[0_0_30px_rgba(123,224,123,0.35)]' : 'border-amber text-amber shadow-[0_0_30px_rgba(242,165,65,0.25)] hover:scale-105'
              }`}
              aria-label={on ? 'Apagar la señal en vivo' : 'Encender la señal en vivo'}
              data-cursor={on ? 'APAGAR' : 'ENCENDER'}
            >
              <Power size={30} />
            </button>
          </div>

          <div className="relative h-44 md:h-52 rounded-2xl bg-black/60 border border-white/10 overflow-hidden scanlines">
            <Spectrum />
            <div className="absolute top-3 left-3 font-mono text-[10px] tracking-[0.2em] text-signal/80">{r.analysable ? 'ESPECTRO REAL · WEB AUDIO API' : 'ESPECTRO SIMULADO'}</div>
            <div className="absolute bottom-2 left-3 right-3 flex justify-between font-mono text-[9px] text-dust">
              <span>40 Hz</span>
              <span>400 Hz</span>
              <span>4 kHz</span>
              <span>16 kHz</span>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center">
            <VuMeter label="SEÑAL" />
            <VuMeter label="AUDIO" />
            <div className="flex flex-col items-center gap-2">
              <Knob value={r.volume} onChange={r.setVolume} />
              <span className="font-mono text-[10px] tracking-[0.2em] text-dust">VOL {Math.round(r.volume * 100)}</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-2">
            {STATIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  sfx.static(0.35, 0.12);
                  r.play(s.id);
                }}
                className={`rounded-xl px-4 py-3 text-left border transition-colors ${s.id === r.stationId ? 'border-amber bg-amber/10' : 'border-white/10 hover:border-white/25'}`}
              >
                <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-amber">{s.id === 'siglo' ? 'Histórica' : 'Filial'}</span>
                <span className="block text-sm mt-1">{s.city}</span>
              </button>
            ))}
          </div>

          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Users, k: 'Oyentes ahora', v: r.listeners ?? '—' },
              { icon: Activity, k: 'Pico del día', v: r.peak ?? '—' },
              { icon: Signal, k: 'Calidad', v: r.bitrate ? `${r.bitrate} kbps` : '—' },
              { icon: Clock, k: 'Hora en Llallagua', v: time },
            ].map(({ icon: Icon, k, v }) => (
              <div key={k} className="rounded-xl border border-white/10 p-3">
                <dt className="flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.15em] uppercase text-dust">
                  <Icon size={11} /> {k}
                </dt>
                <dd className="mt-1.5 font-display text-xl tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[11px] text-dust leading-relaxed">
            Señal transmitida desde {since !== '—' ? `las ${since} (hora de Bolivia)` : 'el servidor de ALER'}. {r.error ? <span className="text-ember">{r.error}</span> : 'Los datos de oyentes provienen del servidor Icecast de ALER y se actualizan cada 30 segundos.'}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ frecuencia memoria ------------------------------ */

function gauss(x: number, mu: number, s: number) {
  return Math.exp(-((x - mu) ** 2) / (2 * s * s));
}

function MemoryDial() {
  const [pos, setPos] = useState(0.0);
  const [locked, setLocked] = useState<MemoryStation | null>(null);
  const tuner = useRef<Tuner | null>(null);
  const dial = useRef<HTMLDivElement>(null);
  const lockTimer = useRef<number | null>(null);
  const dragging = useRef(false);
  const activeId = useNarration((s) => s.activeId);

  const nearest = (p: number) => MEMORY.reduce((a, b) => (Math.abs(b.pos - p) < Math.abs(a.pos - p) ? b : a));

  useEffect(
    () => () => {
      tuner.current?.dispose();
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
    },
    [],
  );

  const ensureTuner = () => {
    const exp = useExperience.getState();
    if (!exp.audioUnlocked) exp.unlockAudio();
    if (!tuner.current) tuner.current = audio.createTuner();
    if (useRadio.getState().status !== 'idle') useRadio.getState().stop();
  };

  const update = (p: number) => {
    const clamped = Math.max(0, Math.min(1, p));
    setPos(clamped);
    const n = nearest(clamped);
    const signal = gauss(clamped, n.pos, 0.018);
    tuner.current?.setSignal(signal);
    if (lockTimer.current) window.clearTimeout(lockTimer.current);
    if (locked && Math.abs(clamped - locked.pos) > 0.03) {
      setLocked(null);
      stopNarration();
    }
    if (signal > 0.6 && locked?.id !== n.id) {
      lockTimer.current = window.setTimeout(() => lock(n), 450);
    }
  };

  const lock = (st: MemoryStation) => {
    setLocked(st);
    setPos(st.pos);
    tuner.current?.setSignal(1);
    audio.clank(undefined, 0.02);
    void narrate(st.text, 'memory-' + st.id, { force: true });
  };

  const fromEvent = (clientX: number) => {
    const rect = dial.current!.getBoundingClientRect();
    return (clientX - rect.left) / rect.width;
  };

  return (
    <section className="px-5 md:px-12 py-28 max-w-[1500px] mx-auto">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-10 items-end mb-12">
        <div>
          <Reveal>
            <p className="eyebrow mb-5">Frecuencia memoria</p>
          </Reveal>
          <SplitTitle text="Gira el dial hacia el pasado" accentFrom={3} className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight" />
        </div>
        <Reveal delay={0.15}>
          <p className="text-lg text-tin leading-relaxed">
            Arrastra la aguja. Entre la estática aparecen seis estaciones del tiempo: al sintonizarlas, el narrador lee un boletín. Son recreaciones a partir de hechos documentados; las frases entre comillas son citas literales.
          </p>
        </Reveal>
      </div>

      <div className="rounded-[2rem] p-3 bg-gradient-to-b from-[#3b2a17] to-[#150f09] border border-[#5a4128] shadow-[0_30px_120px_rgba(242,165,65,0.18)]">
        <div
          ref={dial}
          className="relative h-44 md:h-56 rounded-[1.5rem] overflow-hidden cursor-ew-resize touch-none select-none"
          style={{ background: 'linear-gradient(180deg,#4a2606 0%,#f6c46a 50%,#4a2606 100%)' }}
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            dragging.current = true;
            ensureTuner();
            update(fromEvent(e.clientX));
          }}
          onPointerMove={(e) => dragging.current && update(fromEvent(e.clientX))}
          onPointerUp={() => (dragging.current = false)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
              ensureTuner();
              update(pos + (e.key === 'ArrowRight' ? 0.01 : -0.01));
            }
          }}
          tabIndex={0}
          role="slider"
          aria-label="Dial de la frecuencia memoria"
          aria-valuenow={Math.round(pos * 100)}
          data-lenis-prevent
          data-cursor="SINTONIZAR"
        >
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,236,190,0.5), rgba(60,20,0,0.35))' }} />
          <div className="absolute left-[4%] right-[4%] top-[42%] h-px bg-[#2a1404]" />
          {Array.from({ length: 101 }).map((_, i) => (
            <div key={i} className="absolute bg-[#2a1404]" style={{ left: `${4 + i * 0.92}%`, top: '42%', width: 1, height: i % 10 === 0 ? 18 : 8, transform: 'translateY(-100%)' }} />
          ))}
          {MEMORY.map((m) => (
            <button
              key={m.id}
              className="absolute -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${4 + m.pos * 92}%`, top: '50%' }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                ensureTuner();
                lock(m);
              }}
            >
              <span className={`font-display text-2xl md:text-4xl ${locked?.id === m.id ? 'text-[#7a0f02]' : 'text-[#2a1404]'}`}>{m.year}</span>
              <span className="font-mono text-[9px] md:text-[10px] tracking-[0.15em] uppercase text-[#2a1404]/80 hidden sm:block">{m.title}</span>
            </button>
          ))}
          <div className="absolute top-2 bottom-2 w-[3px] bg-[#ff2a10] shadow-[0_0_14px_rgba(255,42,16,0.9)] pointer-events-none" style={{ left: `calc(${4 + pos * 92}% - 1.5px)` }} />
        </div>
      </div>

      <div className="mt-8 min-h-[220px]">
        <AnimatePresence mode="wait">
          {locked ? (
            <motion.article key={locked.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="grid md:grid-cols-[220px_1fr] gap-8 rounded-[2rem] border border-white/10 bg-shaft/60 p-8 md:p-10">
              <div>
                <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-amber flex items-center gap-2">
                  <RadioIcon size={13} /> Sintonizado
                </p>
                <p className="mt-3 font-display text-6xl text-amber">{locked.year}</p>
                <p className="mt-1 text-sm text-dust">{locked.date}</p>
              </div>
              <div>
                <h3 className="font-display text-3xl">{locked.title}</h3>
                <p className="mt-4 text-lg text-bone/90 leading-relaxed">{locked.text.replace('Boletín de la memoria. ', '')}</p>
                <p className="mt-5 text-[11px] text-dust">
                  {activeId === 'memory-' + locked.id ? '● Transmitiendo boletín… ' : ''}Recreación narrada basada en López Vigil (1985) y Tórrez Miranda (2009).
                </p>
              </div>
            </motion.article>
          ) : (
            <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center font-mono text-xs tracking-[0.3em] uppercase text-dust pt-10">
              Solo estática… sigue girando el dial
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default function Live() {
  return (
    <>
      <header className="relative px-5 md:px-12 pt-36 pb-12 max-w-[1500px] mx-auto">
        <Reveal>
          <p className="eyebrow mb-6 !text-signal">● Sala 07 · En vivo</p>
        </Reveal>
        <SplitTitle as="h1" text="Señal en vivo" accentFrom={1} className="font-display text-7xl md:text-[9vw] leading-[0.88] tracking-tight" />
        <div className="mt-10 grid md:grid-cols-[1fr_auto] gap-8 items-end">
          <Reveal delay={0.15}>
            <p className="max-w-2xl text-lg text-tin leading-relaxed">
              Radio Pío XII sigue al aire. Enciende el receptor y escucha la emisora de Siglo XX en tiempo real; el espectro y los vúmetros se calculan con la señal que llega a tu navegador.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <NarrateButton text={NARRATION.live} id="live-intro" />
          </Reveal>
        </div>
      </header>
      <Player />
      <MemoryDial />
      <Footer />
    </>
  );
}
