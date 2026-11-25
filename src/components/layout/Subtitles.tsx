import { AnimatePresence, motion } from 'framer-motion';
import { Square } from 'lucide-react';
import { useNarration, stopNarration } from '../../stores/useNarration';
import { useExperience } from '../../stores/useExperience';

/** Subtítulos cinematográficos sincronizados con el narrador. */
export function Subtitles() {
  const line = useNarration((s) => s.line);
  const index = useNarration((s) => s.index);
  const total = useNarration((s) => s.total);
  const active = useNarration((s) => s.activeId);
  const on = useExperience((s) => s.subtitlesOn);

  return (
    <div className="fixed inset-x-0 bottom-20 md:bottom-24 z-[76] flex justify-center pointer-events-none px-4">
      <AnimatePresence mode="wait">
        {active && line && on && (
          <motion.div
            key={line}
            initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto max-w-3xl rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 px-6 py-4 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-center gap-3 mb-1.5">
              <span className="font-mono text-[10px] tracking-[0.3em] text-amber uppercase">Narrador</span>
              {total > 1 && (
                <span className="flex gap-1">
                  {Array.from({ length: total }).map((_, i) => (
                    <span key={i} className={`h-[3px] w-3 rounded-full ${i <= index ? 'bg-amber' : 'bg-white/15'}`} />
                  ))}
                </span>
              )}
              <button onClick={stopNarration} className="text-dust hover:text-bone" aria-label="Detener narración" title="Detener narración">
                <Square size={11} fill="currentColor" />
              </button>
            </div>
            <p className="font-display-soft italic text-lg md:text-[22px] leading-snug text-bone">{line}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
