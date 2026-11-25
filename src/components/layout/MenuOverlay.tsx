import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, Power } from 'lucide-react';
import { ROUTES } from '../../data/routes';
import { useExperience, sfx } from '../../stores/useExperience';
import { startGuidedTour } from '../experience/tour';
import { setScrollLocked } from '../../lib/smoothScroll';

export function MenuOverlay() {
  const open = useExperience((s) => s.menuOpen);
  const setOpen = useExperience((s) => s.setMenuOpen);
  const setPhase = useExperience((s) => s.setPhase);
  const { pathname } = useLocation();
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    setScrollLocked(open);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  const current = ROUTES.findIndex((r) => r.path === pathname);
  const shown = ROUTES[hover ?? Math.max(0, current)];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[85] bg-ink/95 backdrop-blur-xl overflow-y-auto"
          initial={{ clipPath: 'circle(0% at calc(100% - 60px) 40px)' }}
          animate={{ clipPath: 'circle(150% at calc(100% - 60px) 40px)' }}
          exit={{ clipPath: 'circle(0% at calc(100% - 60px) 40px)' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          data-lenis-prevent
        >
          <div className="absolute inset-0 bg-dial-grid opacity-40 pointer-events-none" />
          <div className="relative min-h-full max-w-[1500px] mx-auto px-5 md:px-12 pt-28 pb-12 grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-20">
            <nav aria-label="Salas">
              <p className="eyebrow mb-6">Salas del museo</p>
              <ul>
                {ROUTES.map((r, i) => (
                  <motion.li
                    key={r.path}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="border-b border-white/10"
                  >
                    <Link
                      to={r.path}
                      onClick={() => {
                        sfx.click();
                        setOpen(false);
                      }}
                      onMouseEnter={() => {
                        setHover(i);
                        sfx.tick();
                      }}
                      onMouseLeave={() => setHover(null)}
                      className="group flex items-baseline gap-5 py-3 md:py-4"
                    >
                      <span className={`font-mono text-xs w-8 ${pathname === r.path ? 'text-amber' : 'text-dust'}`}>{r.number}</span>
                      <span
                        className={`font-display text-4xl md:text-6xl leading-none tracking-tight transition-all duration-500 group-hover:translate-x-3 group-hover:italic ${
                          pathname === r.path ? 'text-amber' : 'text-bone'
                        }`}
                      >
                        {r.label}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <motion.aside className="flex flex-col justify-between gap-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <div className="panel rounded-3xl p-8 relative overflow-hidden min-h-[260px]">
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full border border-amber/20" />
                <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full border border-amber/25" />
                <div className="absolute right-0 top-0 w-32 h-32 rounded-full border border-amber/30" />
                <AnimatePresence mode="wait">
                  <motion.div key={shown.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                    <p className="font-mono text-xs text-amber tracking-[0.3em]">SALA {shown.number}</p>
                    <h3 className="mt-4 font-display text-3xl leading-tight">{shown.title}</h3>
                    <p className="mt-4 text-tin leading-relaxed">{shown.description}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setOpen(false);
                    void startGuidedTour();
                  }}
                  className="group rounded-2xl bg-amber text-ink p-5 text-left hover:bg-amber-hi transition-colors"
                  data-cursor="INICIAR"
                >
                  <Compass className="mb-6" size={22} />
                  <span className="block font-display text-xl">Recorrido guiado</span>
                  <span className="block text-sm opacity-75 mt-1">El museo se presenta solo, con narración.</span>
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    setPhase('outro');
                  }}
                  className="rounded-2xl border border-white/15 p-5 text-left hover:border-ember/60 hover:text-ember transition-colors"
                  data-cursor="APAGAR"
                >
                  <Power className="mb-6" size={22} />
                  <span className="block font-display text-xl">Apagar la radio</span>
                  <span className="block text-sm text-tin mt-1">Créditos y despedida.</span>
                </button>
              </div>
              <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-dust">
                Atajos · <span className="text-tin">M</span> música · <span className="text-tin">N</span> narrador · <span className="text-tin">Esc</span> cerrar
              </p>
            </motion.aside>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
