import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Power, RotateCcw } from 'lucide-react';
import { useExperience } from '../../stores/useExperience';
import { useRadio } from '../../stores/useRadio';
import { audio } from '../../lib/audio/engine';
import { narrate, stopNarration } from '../../stores/useNarration';
import { NARRATION } from '../../data/narration';
import { CREDITS } from '../../data/credits';
import { siteUrl, useQr } from '../../lib/qr';

/** Botón que dispara la secuencia de despedida. */
export function PowerOffButton({ className = '', label = 'Apagar la radio' }: { className?: string; label?: string }) {
  const setPhase = useExperience((s) => s.setPhase);
  return (
    <button onClick={() => setPhase('outro')} className={'inline-flex items-center gap-2 ' + className} data-cursor="APAGAR">
      <Power size={16} /> {label}
    </button>
  );
}

export default function Outro() {
  const phase = useExperience((s) => s.phase);
  const setPhase = useExperience((s) => s.setPhase);
  const [stage, setStage] = useState<'collapse' | 'credits'>('collapse');
  const qr = useQr(siteUrl());

  useEffect(() => {
    if (phase !== 'outro') return;
    setStage('collapse');
    stopNarration();
    useRadio.getState().stop();
    audio.powerOff();
    const root = document.getElementById('site-shell');
    root?.classList.add('crt-off');
    const prevMusic = useExperience.getState().musicOn;
    audio.setMusicIntensity(0.5);
    const t1 = window.setTimeout(() => {
      setStage('credits');
      void narrate(NARRATION.farewell, 'farewell');
    }, 1300);
    return () => {
      window.clearTimeout(t1);
      root?.classList.remove('crt-off');
      audio.setMusicIntensity(1);
      if (prevMusic) audio.setMusicOn(true);
    };
  }, [phase]);

  const restart = () => {
    stopNarration();
    setPhase('site');
    window.location.hash = '#/';
  };

  return (
    <AnimatePresence>
      {phase === 'outro' && (
        <motion.div
          key="outro"
          className="fixed inset-0 z-[95] bg-black text-bone overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
        >
          {stage === 'collapse' && (
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bone rounded-full"
              initial={{ width: '100vw', height: 2, opacity: 1 }}
              animate={{ width: 4, height: 4, opacity: [1, 1, 0] }}
              transition={{ duration: 1.1, delay: 0.55, ease: 'easeIn' }}
              style={{ boxShadow: '0 0 30px 8px rgba(255,240,210,0.8)' }}
            />
          )}

          {stage === 'credits' && (
            <motion.div className="absolute inset-0 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
              {/* créditos que suben */}
              <div className="relative flex-1 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent z-10" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />
                <div className="credits-roll absolute inset-x-0 top-full text-center px-6">
                  <p className="eyebrow mb-6">Fin de la transmisión</p>
                  <h2 className="font-display text-6xl md:text-8xl leading-none">
                    Radio <span className="italic text-amber glow-amber">Pío XII</span>
                  </h2>
                  <p className="mt-6 font-display-soft italic text-2xl text-tin">La voz de la mina</p>
                  <div className="mt-24 space-y-16">
                    {CREDITS.map((block) => (
                      <div key={block.title}>
                        <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-amber mb-4">{block.title}</p>
                        {block.lines.map((l) => (
                          <p key={l} className="text-lg md:text-xl text-bone/90 leading-relaxed">
                            {l}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p className="mt-28 font-display italic text-3xl md:text-4xl text-bone/90 max-w-2xl mx-auto leading-snug">
                    “Que esta voz no se apague nunca.”
                  </p>
                  <div className="h-[60vh]" />
                </div>
              </div>

              {/* lateral fijo: QR y reencendido */}
              <div className="hidden md:flex w-[360px] border-l border-white/10 flex-col items-center justify-center gap-8 p-10 bg-gradient-to-b from-black to-[#0d0a07]">
                <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-tin text-center">Lleva el museo en tu teléfono</p>
                {qr && <img src={qr} alt="Código QR del museo virtual" className="w-52 h-52 rounded-xl" />}
                <p className="font-mono text-[10px] text-dust text-center break-all">{siteUrl()}</p>
                <button
                  onClick={restart}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber/50 text-amber px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase hover:bg-amber hover:text-ink transition-colors"
                  data-cursor="ENCENDER"
                >
                  <RotateCcw size={14} /> Volver a encender
                </button>
              </div>
              <button
                onClick={restart}
                className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-2 rounded-full border border-amber/50 text-amber px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase"
              >
                <RotateCcw size={14} /> Volver a encender
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
