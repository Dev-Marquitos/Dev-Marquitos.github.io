import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { ROUTES } from '../../data/routes';
import { PROJECT } from '../../data/credits';
import { PowerOffButton } from '../experience/Outro';
import { useRadio } from '../../stores/useRadio';
import { Logo } from './Logo';

export function Footer() {
  const play = useRadio((s) => s.play);
  return (
    <footer className="relative border-t border-white/10 bg-coal overflow-hidden">
      <div className="absolute inset-0 bg-dial-grid opacity-30 pointer-events-none" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(242,165,65,0.12), transparent 60%)' }} />
      <div className="relative max-w-[1400px] mx-auto px-5 md:px-12 pt-24 pb-10">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-16">
          <div>
            <p className="eyebrow mb-6">Fin de la sala · la señal continúa</p>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
              ¿Seguimos
              <br />
              <span className="italic text-amber glow-amber">al aire?</span>
            </h2>
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                onClick={() => play()}
                className="inline-flex items-center gap-2 rounded-full bg-amber text-ink px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase hover:bg-amber-hi transition-colors"
                data-cursor="ESCUCHAR"
              >
                ● Escuchar en vivo
              </button>
              <PowerOffButton className="rounded-full border border-white/15 px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase text-tin hover:text-ember hover:border-ember/50 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 content-start">
            {ROUTES.map((r) => (
              <Link key={r.path} to={r.path} className="group flex items-baseline gap-3 py-2 border-b border-white/5 hover:border-amber/40 transition-colors">
                <span className="font-mono text-[10px] text-dust">{r.number}</span>
                <span className="text-bone group-hover:text-amber transition-colors">{r.label}</span>
                <ArrowUpRight size={14} className="ml-auto text-dust opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size={36} />
            <div className="text-sm text-tin leading-relaxed">
              <p className="text-bone">{PROJECT.title}</p>
              <p>
                {PROJECT.university} · {PROJECT.area}
              </p>
            </div>
          </div>
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-dust">
            {PROJECT.author} · {PROJECT.year} · v{PROJECT.version}
          </p>
        </div>
      </div>
    </footer>
  );
}
