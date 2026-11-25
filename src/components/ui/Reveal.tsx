import { motion, useInView, animate } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pause, Volume2 } from 'lucide-react';
import { toggleNarration, useNarration } from '../../stores/useNarration';

/** Aparición suave al entrar en pantalla. */
export function Reveal({ children, delay = 0, y = 28, className = '' }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Título con revelado por palabras. */
export function SplitTitle({ text, className = '', accentFrom = -1, as = 'h2' }: { text: string; className?: string; accentFrom?: number; as?: 'h1' | 'h2' | 'h3' }) {
  const words = text.split(' ');
  const Tag = motion[as];
  return (
    <Tag className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10% 0px' }} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.08em] mr-[0.22em]">
          <motion.span
            className={'inline-block ' + (accentFrom >= 0 && i >= accentFrom ? 'italic text-amber' : '')}
            variants={{ hidden: { y: '110%', rotate: 4 }, show: { y: 0, rotate: 0 } }}
            transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Contador animado. */
export function Counter({ to, suffix = '', duration = 2.2, format = true }: { to: number; suffix?: string; duration?: number; format?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (x) => setV(x) });
    return () => c.stop();
  }, [inView, to, duration]);
  const n = Math.round(v);
  return (
    <span ref={ref}>
      {format ? n.toLocaleString('es-BO') : n}
      {suffix}
    </span>
  );
}

/** Botón “Escuchar” que narra un texto con la voz del museo. */
export function NarrateButton({ text, id, label = 'Escuchar', className = '' }: { text: string; id: string; label?: string; className?: string }) {
  const active = useNarration((s) => s.activeId === id);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleNarration(text, id);
      }}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors ${
        active ? 'border-amber bg-amber text-ink' : 'border-white/15 text-tin hover:text-amber hover:border-amber/50'
      } ${className}`}
      data-cursor={active ? 'PAUSA' : 'ESCUCHAR'}
      aria-pressed={active}
    >
      {active ? <Pause size={13} /> : <Volume2 size={13} />}
      {active ? 'Narrando…' : label}
      {active && (
        <span className="flex items-end gap-[2px] h-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-[2px] bg-ink rounded-full" style={{ height: '100%', animation: `eq 0.${5 + i}s ease-in-out ${i * 0.12}s infinite alternate` }} />
          ))}
        </span>
      )}
    </button>
  );
}
