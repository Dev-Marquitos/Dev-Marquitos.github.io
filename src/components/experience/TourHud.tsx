import { AnimatePresence, motion } from 'framer-motion';
import { Square } from 'lucide-react';
import { stopGuidedTour, useTour } from './tour';

/** Indicador del recorrido guiado automático (modo presentación). */
export function TourHud() {
  const { active, step, total, label } = useTour();
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-[72] panel rounded-full pl-5 pr-2 py-2 flex items-center gap-4"
        >
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-amber">Recorrido guiado</span>
          <span className="text-sm text-bone">{label}</span>
          <span className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className={`h-1 w-5 rounded-full ${i < step ? 'bg-amber' : i === step ? 'bg-amber/70 blink-soft' : 'bg-white/15'}`} />
            ))}
          </span>
          <button onClick={stopGuidedTour} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-ember hover:text-ink transition-colors" aria-label="Detener recorrido">
            <Square size={12} fill="currentColor" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
