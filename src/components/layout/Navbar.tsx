import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ROUTES } from '../../data/routes';
import { useExperience, sfx } from '../../stores/useExperience';
import { useRadio } from '../../stores/useRadio';
import { Logo } from './Logo';

function LivePill() {
  const status = useRadio((s) => s.status);
  const toggle = useRadio((s) => s.toggle);
  const on = status === 'playing';
  const connecting = status === 'connecting';
  return (
    <button
      onClick={() => {
        sfx.click();
        toggle();
      }}
      className={`hidden sm:inline-flex items-center gap-2.5 rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase border transition-colors ${
        on ? 'border-signal/50 text-signal bg-signal/10' : 'border-white/10 text-tin hover:text-bone hover:border-white/25 panel'
      }`}
      data-cursor={on ? 'DETENER' : 'ESCUCHAR'}
      aria-label={on ? 'Detener la señal en vivo' : 'Escuchar Radio Pío XII en vivo'}
    >
      <span className="relative flex h-2 w-2">
        {(on || connecting) && <span className="absolute inline-flex h-full w-full rounded-full bg-signal opacity-70 pulse-ring" />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${on ? 'bg-signal' : connecting ? 'bg-amber' : 'bg-ember'}`} />
      </span>
      {on ? 'Al aire' : connecting ? 'Conectando…' : 'En vivo'}
      {on && (
        <span className="flex items-end gap-[2px] h-3" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="w-[2px] bg-signal rounded-full" style={{ height: '100%', animation: `eq 0.${6 + i}s ease-in-out ${i * 0.1}s infinite alternate` }} />
          ))}
        </span>
      )}
    </button>
  );
}

export function Navbar() {
  const { pathname } = useLocation();
  const menuOpen = useExperience((s) => s.menuOpen);
  const setMenuOpen = useExperience((s) => s.setMenuOpen);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 200);
        last = y;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setHidden(false), [pathname]);

  return (
    <header
      className="fixed top-0 inset-x-0 z-[88] transition-transform duration-500"
      style={{ transform: hidden && !menuOpen ? 'translateY(-110%)' : 'translateY(0)', transitionTimingFunction: 'var(--ease-radio)' }}
    >
      <div
        className={`absolute inset-0 transition-opacity duration-500 bg-gradient-to-b from-ink/90 via-ink/60 to-transparent ${scrolled ? 'opacity-100' : 'opacity-70'}`}
        aria-hidden
      />
      <div className="relative mx-auto flex items-center justify-between h-16 md:h-20 px-4 md:px-8 2xl:px-12">
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setMenuOpen(false)} data-cursor="INICIO">
          <Logo size={38} className="transition-transform duration-500 group-hover:rotate-[-8deg]" />
          <span className="leading-none">
            <span className="block font-display text-[19px] tracking-tight">Radio Pío XII</span>
            <span className="block font-mono text-[9.5px] tracking-[0.28em] uppercase text-tin mt-1">Museo virtual · Siglo XX</span>
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-0.5 rounded-full panel px-1.5 py-1.5" aria-label="Salas del museo">
          {ROUTES.map((r) => {
            const active = pathname === r.path;
            return (
              <Link
                key={r.path}
                to={r.path}
                onMouseEnter={() => sfx.hover()}
                onClick={() => sfx.click()}
                className={`relative rounded-full px-3.5 py-2 text-[13px] transition-colors ${active ? 'text-ink' : 'text-tin hover:text-bone'}`}
              >
                {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-amber" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className="relative">{r.short}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LivePill />
          <button
            onClick={() => {
              sfx.whoosh();
              setMenuOpen(!menuOpen);
            }}
            className="inline-flex items-center gap-2 rounded-full panel px-4 py-2.5 text-[13px] hover:border-amber/50 transition-colors"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            data-cursor={menuOpen ? 'CERRAR' : 'MENÚ'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={menuOpen ? 'x' : 'm'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                {menuOpen ? <X size={16} /> : <Menu size={16} />}
              </motion.span>
            </AnimatePresence>
            <span className="hidden md:inline font-mono text-[11px] tracking-[0.2em] uppercase">{menuOpen ? 'Cerrar' : 'Salas'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
