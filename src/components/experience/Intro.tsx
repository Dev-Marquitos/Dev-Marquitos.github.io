import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Headphones, Power, SkipForward, VolumeX } from 'lucide-react';
import { useExperience } from '../../stores/useExperience';
import { audio, type Tuner } from '../../lib/audio/engine';
import { narrate } from '../../stores/useNarration';
import { NARRATION } from '../../data/narration';

type Step = 'gate' | 'tuning' | 'title' | 'leaving';

const STATION_X = 0.43;
const CITIES = ['La Paz', 'Oruro', 'Huanuni', 'Catavi', 'Potosí', 'Sucre', 'Cochabamba'];

function gauss(x: number, mu: number, s: number) {
  return Math.exp(-((x - mu) ** 2) / (2 * s * s));
}

/** Carga previa de lo pesado mientras el visitante lee la portada. */
function usePreload() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let done = 0;
    const tasks: Promise<unknown>[] = [
      document.fonts?.ready ?? Promise.resolve(),
      import('../../pages/Home'),
      import('../three/scenes/HeroScene'),
      import('../../pages/Museum'),
      new Promise((r) => window.setTimeout(r, 900)),
    ];
    tasks.forEach((t) =>
      t
        .catch(() => undefined)
        .finally(() => {
          done++;
          setProgress(done / tasks.length);
        }),
    );
  }, []);
  return progress;
}

function Dial({ needle, locked }: { needle: number; locked: boolean }) {
  const x0 = 60, x1 = 940;
  const nx = x0 + (x1 - x0) * needle;
  return (
    <svg viewBox="0 0 1000 250" className="w-full h-auto" aria-hidden>
      <defs>
        <linearGradient id="dialface" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a2606" />
          <stop offset="0.5" stopColor="#f6c46a" />
          <stop offset="1" stopColor="#4a2606" />
        </linearGradient>
        <radialGradient id="dialglow" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor="rgba(255,236,190,0.55)" />
          <stop offset="1" stopColor="rgba(60,20,0,0.35)" />
        </radialGradient>
        <filter id="needleglow" filterUnits="userSpaceOnUse" x="0" y="0" width="1000" height="250">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="0" y="0" width="1000" height="250" rx="18" fill="url(#dialface)" />
      <rect x="0" y="0" width="1000" height="250" rx="18" fill="url(#dialglow)" />
      <g stroke="#2a1404" fill="#2a1404" fontFamily="JetBrains Mono Variable, monospace">
        <line x1={x0} y1="120" x2={x1} y2="120" strokeWidth="2" />
        {Array.from({ length: 89 }).map((_, i) => {
          const x = x0 + ((x1 - x0) * i) / 88;
          const big = i % 8 === 0;
          return <line key={i} x1={x} y1={120 - (big ? 18 : 8)} x2={x} y2="120" strokeWidth={big ? 2 : 1} />;
        })}
        {['5.80', '5.85', '5.90', '5.95', '6.00', '6.05', '6.10', '6.15', '6.20', '6.25', '6.30', '6.35'].map((m, i) => (
          <text key={m} x={x0 + ((x1 - x0) * i) / 11} y="88" fontSize="20" fontWeight="700" textAnchor="middle" stroke="none">
            {m}
          </text>
        ))}
        <text x={x0} y="150" fontSize="13" stroke="none" fontWeight="600" letterSpacing="2">ONDA CORTA · BANDA DE 49 METROS · Mc</text>
        {CITIES.map((c, i) => (
          <text key={c} x={x0 + 40 + ((x1 - x0 - 80) * i) / (CITIES.length - 1)} y="200" fontSize="22" fontStyle="italic" stroke="none" fontFamily="Fraunces Variable, serif" textAnchor="middle">
            {c}
          </text>
        ))}
        <g transform={`translate(${x0 + (x1 - x0) * STATION_X} 0)`}>
          <path d="M0 160 L-9 176 L9 176 Z" fill="#9c1d0a" stroke="none" />
          <text y="236" fontSize="19" fontWeight="800" textAnchor="middle" stroke="none" fontFamily="Fraunces Variable, serif" fill={locked ? '#7a0f02' : '#2a1404'}>
            PÍO XII
          </text>
        </g>
      </g>
      <g filter="url(#needleglow)">
        <rect x={nx - 1.75} y="18" width="3.5" height="214" fill="#ff2a10" />
      </g>
    </svg>
  );
}

export default function Intro() {
  const phase = useExperience((s) => s.phase);
  const setPhase = useExperience((s) => s.setPhase);
  const unlockAudio = useExperience((s) => s.unlockAudio);
  const setSoundOn = useExperience((s) => s.setSoundOn);
  const progress = usePreload();
  const [step, setStep] = useState<Step>('gate');
  const [needle, setNeedle] = useState(0.05);
  const [locked, setLocked] = useState(false);
  const [readout, setReadout] = useState('5.800');
  const [lines, setLines] = useState(0);
  const tuner = useRef<Tuner | null>(null);
  const raf = useRef(0);
  const timers = useRef<number[]>([]);
  const ready = progress >= 1;

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const leave = useCallback(() => {
    // se cancelan los pasos pendientes; si la bienvenida ya suena, continúa sobre el sitio
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setStep('leaving');
    tuner.current?.dispose();
    tuner.current = null;
    cancelAnimationFrame(raf.current);
    window.setTimeout(() => {
      if (useExperience.getState().phase === 'intro') setPhase('site');
    }, 1100);
  }, [setPhase]);

  useEffect(() => () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    cancelAnimationFrame(raf.current);
    tuner.current?.dispose();
  }, []);

  // Esc para saltar
  useEffect(() => {
    if (phase !== 'intro') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'gate') leave();
      if ((e.key === 'Enter' || e.key === ' ') && step === 'gate' && ready) start(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const runTitle = () => {
    setStep('title');
    later(() => {
      void narrate(NARRATION.welcome, 'intro-welcome').then((ok) => {
        if (ok && useExperience.getState().phase === 'intro') later(() => leave(), 1400);
      });
    }, 900);
  };

  const start = (withSound: boolean) => {
    if (!ready || step !== 'gate') return;
    if (withSound) {
      unlockAudio();
      setSoundOn(true);
      audio.powerOn();
      audio.morse('PIO XII', { gain: 0.035, wpm: 22 });
      tuner.current = audio.createTuner();
    } else {
      setSoundOn(false);
    }
    setStep('tuning');
    // recorrido "humano" de la aguja: barrido, se pasa, vuelve y ajusta
    const keys: [number, number][] = [
      [0, 0.05], [1400, 0.2], [2300, 0.7], [3300, 0.36], [4000, 0.455], [4500, 0.425], [4900, STATION_X],
    ];
    const t0 = performance.now();
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const loop = () => {
      const t = performance.now() - t0;
      let k = 0;
      while (k < keys.length - 2 && t > keys[k + 1][0]) k++;
      const [ta, va] = keys[k];
      const [tb, vb] = keys[k + 1];
      const u = Math.min(1, Math.max(0, (t - ta) / (tb - ta)));
      const jitter = t < 4900 ? Math.sin(t / 37) * 0.002 : 0;
      const v = va + (vb - va) * ease(u) + jitter;
      setNeedle(v);
      setReadout((5.8 + v * 0.55).toFixed(3));
      const signal = Math.max(gauss(v, STATION_X, 0.012), 0.55 * gauss(v, 0.2, 0.02), 0.5 * gauss(v, 0.68, 0.02));
      tuner.current?.setSignal(signal);
      if (t < 5000) raf.current = requestAnimationFrame(loop);
      else {
        setLocked(true);
        tuner.current?.setSignal(1);
        window.setTimeout(() => {
          tuner.current?.dispose();
          tuner.current = null;
        }, 400);
        audio.clank(undefined, 0.04);
        later(runTitle, 1300);
      }
    };
    raf.current = requestAnimationFrame(loop);
    later(() => setLines(1), 900);
    later(() => setLines(2), 2600);
    later(() => setLines(3), 4200);
  };

  if (phase !== 'intro') return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-ink text-bone overflow-hidden"
      animate={step === 'leaving' ? { opacity: 0, scale: 1.04, filter: 'blur(8px)' } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* resplandor de fondo */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(242,165,65,0.16), transparent 60%)' }} />
      <div className="absolute inset-0 pointer-events-none scanlines opacity-40" />

      {/* esquinas informativas */}
      <div className="absolute top-6 left-6 md:top-8 md:left-10 font-mono text-[10px] md:text-xs tracking-[0.3em] text-tin uppercase">
        Museo virtual · Radio Pío XII
      </div>
      <div className="absolute top-6 right-6 md:top-8 md:right-10 font-mono text-[10px] md:text-xs tracking-[0.3em] text-tin uppercase text-right">
        Llallagua · Potosí · Bolivia
      </div>

      {step !== 'gate' && step !== 'leaving' && (
        <button
          onClick={leave}
          className="absolute bottom-6 right-6 md:bottom-8 md:right-10 z-10 flex items-center gap-2 font-mono text-xs tracking-[0.2em] uppercase text-tin hover:text-amber transition-colors"
        >
          Saltar introducción <SkipForward size={14} />
        </button>
      )}

      <AnimatePresence mode="wait">
        {step === 'gate' && (
          <motion.div
            key="gate"
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
            exit={{ opacity: 0, scaleY: 0.01, filter: 'brightness(3)' }}
            transition={{ duration: 0.45, ease: 'easeIn' }}
          >
            <motion.p className="eyebrow mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              1959 · Distrito minero Siglo XX – Catavi
            </motion.p>
            <motion.h1
              className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              Una radio
              <br />
              <span className="italic text-amber glow-amber">que no se apagó</span>
            </motion.h1>

            <motion.button
              onClick={() => start(true)}
              disabled={!ready}
              className="group relative mt-14 w-36 h-36 rounded-full flex items-center justify-center disabled:opacity-60"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              aria-label="Encender la radio"
              data-cursor="ENCENDER"
            >
              {ready && <span className="absolute inset-0 rounded-full border border-amber/60 pulse-ring" />}
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(237,229,211,0.12)" strokeWidth="2" />
                <circle
                  cx="50"
                  cy="50"
                  r="47"
                  fill="none"
                  stroke="var(--color-amber)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={Math.PI * 94}
                  strokeDashoffset={Math.PI * 94 * (1 - progress)}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <span className="relative w-28 h-28 rounded-full bg-gradient-to-b from-[#2b241c] to-[#0f0c09] border border-line shadow-[inset_0_2px_10px_rgba(255,255,255,0.06),0_20px_50px_rgba(0,0,0,0.6)] flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-active:scale-95">
                <Power className={ready ? 'text-amber drop-shadow-[0_0_12px_rgba(242,165,65,0.8)]' : 'text-dust'} size={40} strokeWidth={1.6} />
              </span>
            </motion.button>
            <p className="mt-6 font-mono text-xs tracking-[0.3em] uppercase text-tin h-5">
              {ready ? 'Encender la radio' : `Calentando válvulas… ${Math.round(progress * 100)}%`}
            </p>

            <motion.div className="absolute bottom-8 left-0 right-0 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-8 px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
              <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase text-dust">
                <Headphones size={14} /> Experiencia sonora: usa parlantes o audífonos
              </span>
              <button
                onClick={() => start(false)}
                disabled={!ready}
                className="flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase text-tin hover:text-amber link-underline disabled:opacity-40"
              >
                <VolumeX size={14} /> Entrar sin sonido
              </button>
            </motion.div>
          </motion.div>
        )}

        {step === 'tuning' && (
          <motion.div
            key="tuning"
            className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-16"
            initial={{ opacity: 0, scaleY: 0.004, filter: 'brightness(4)' }}
            animate={{ opacity: 1, scaleY: 1, filter: 'brightness(1)' }}
            exit={{ opacity: 0, scale: 1.08, filter: 'blur(6px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-full max-w-5xl">
              <div className="flex items-end justify-between mb-4 font-mono text-xs tracking-[0.25em] uppercase">
                <span className="text-tin">Sintonizando</span>
                <span className={locked ? 'text-signal' : 'text-amber'}>
                  {locked ? '● Señal encontrada' : `${readout} Mc`}
                </span>
              </div>
              <div className="rounded-[20px] p-2 bg-gradient-to-b from-[#3b2a17] to-[#150f09] shadow-[0_30px_120px_rgba(242,165,65,0.25)] border border-[#5a4128]">
                <Dial needle={needle} locked={locked} />
              </div>
              <div className="mt-10 space-y-3 font-mono text-sm md:text-base text-tin min-h-[96px]">
                <AnimatePresence>
                  {lines >= 1 && (
                    <motion.p key="l1" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
                      <span className="text-amber">›</span> Llallagua, norte de Potosí — a unos 3 900 metros de altura
                    </motion.p>
                  )}
                  {lines >= 2 && (
                    <motion.p key="l2" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
                      <span className="text-amber">›</span> Distrito minero Siglo XX – Catavi · el estaño de Bolivia
                    </motion.p>
                  )}
                  {lines >= 3 && (
                    <motion.p key="l3" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
                      <span className="text-amber">›</span> Buscando la voz de la mina…
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {(step === 'title' || step === 'leaving') && (
          <motion.div
            key="title"
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.p className="eyebrow mb-8" initial={{ opacity: 0, letterSpacing: '0.8em' }} animate={{ opacity: 1, letterSpacing: '0.3em' }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}>
              Museo virtual interactivo
            </motion.p>
            <h1 className="font-display text-[17vw] md:text-[11vw] leading-[0.85] tracking-tight" aria-label="Radio Pío XII">
              {'Radio Pío XII'.split('').map((ch, i) => (
                <motion.span
                  key={i}
                  className={'inline-block ' + (i >= 6 ? 'text-amber glow-amber italic' : '')}
                  initial={{ opacity: 0, y: '0.4em', filter: 'blur(12px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                >
                  {ch === ' ' ? ' ' : ch}
                </motion.span>
              ))}
            </h1>
            <motion.p className="mt-8 max-w-xl text-tin text-base md:text-lg leading-relaxed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 1 }}>
              La voz del distrito minero Siglo XX – Catavi. Un recorrido en 3D por su historia, sus objetos y las personas que hicieron de la palabra un acto de coraje.
            </motion.p>
            <motion.button
              onClick={leave}
              className="mt-12 group inline-flex items-center gap-3 rounded-full bg-amber text-ink px-8 py-4 font-mono text-sm tracking-[0.2em] uppercase shadow-[0_0_40px_rgba(242,165,65,0.35)] hover:bg-amber-hi transition-colors"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9, duration: 0.8 }}
              data-cursor="ENTRAR"
            >
              Entrar al museo
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
