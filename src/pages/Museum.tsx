import { lazy, Suspense, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProgress } from '@react-three/drei';
import { ChevronLeft, ChevronRight, Compass, Expand, RotateCw, Square, X } from 'lucide-react';
import { MUSEUM_PIECES, pieceById } from '../data/museum';
import { useMuseumStore } from '../stores/useMuseumStore';
import { narrate, stopNarration } from '../stores/useNarration';
import { NarrateButton } from '../components/ui/Reveal';
import { runMuseumTour } from '../lib/museumTour';
import { NARRATION } from '../data/narration';
import { useExperience, sfx } from '../stores/useExperience';
import { useTour } from '../components/experience/tour';
import { pieceText } from '../lib/narrationTexts';

const MuseumScene = lazy(() => import('../components/three/scenes/MuseumScene'));

function Loader() {
  const { progress, active } = useProgress();
  return (
    <AnimatePresence>
      {active && (
        <motion.div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ink" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          <p className="font-mono text-xs tracking-[0.35em] uppercase text-amber">Montando la sala</p>
          <div className="mt-5 w-64 h-px bg-white/10 overflow-hidden">
            <div className="h-full bg-amber transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 font-mono text-[11px] text-dust">{Math.round(progress)}%</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function step(dir: 1 | -1) {
  const { selected, select } = useMuseumStore.getState();
  const i = MUSEUM_PIECES.findIndex((p) => p.id === selected);
  const next = i < 0 ? (dir === 1 ? 0 : MUSEUM_PIECES.length - 1) : (i + dir + MUSEUM_PIECES.length) % MUSEUM_PIECES.length;
  sfx.tick();
  select(MUSEUM_PIECES[next].id);
}

function InfoPanel() {
  const selected = useMuseumStore((s) => s.selected);
  const inspect = useMuseumStore((s) => s.inspect);
  const setInspect = useMuseumStore((s) => s.setInspect);
  const select = useMuseumStore((s) => s.select);
  const touring = useMuseumStore((s) => s.touring);
  const piece = pieceById(selected);
  return (
    <AnimatePresence mode="wait">
      {piece && (
        <motion.aside
          key={piece.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute z-10 panel rounded-3xl overflow-hidden
            left-3 right-3 bottom-36 max-h-[44vh]
            md:left-auto md:right-6 md:top-24 md:bottom-28 md:w-[420px] md:max-h-none"
          data-lenis-prevent
        >
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${piece.accent}, transparent)` }} />
          <div className="p-6 md:p-8 overflow-y-auto h-full">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-amber">
                  Pieza {piece.number} / {String(MUSEUM_PIECES.length).padStart(2, '0')}
                </p>
                <p className="mt-1 font-mono text-[11px] tracking-[0.2em] uppercase text-dust">{piece.era}</p>
              </div>
              <button onClick={() => select(null)} className="w-9 h-9 rounded-full flex items-center justify-center text-tin hover:text-bone hover:bg-white/10" aria-label="Cerrar ficha">
                <X size={16} />
              </button>
            </div>
            <h2 className="mt-5 font-display text-3xl md:text-4xl leading-[1.02] tracking-tight">{piece.title}</h2>
            <p className="mt-3 font-display-soft italic text-lg text-amber/90">{piece.kicker}</p>
            <p className="mt-5 text-[15px] text-bone/90 leading-relaxed">{piece.description}</p>
            <p className="mt-4 text-[15px] text-tin leading-relaxed">{piece.context}</p>
            <dl className="mt-6 divide-y divide-white/10 border-y border-white/10">
              {piece.facts.map(([k, v]) => (
                <div key={k} className="flex gap-4 py-2.5 text-sm">
                  <dt className="w-32 shrink-0 font-mono text-[11px] tracking-[0.15em] uppercase text-dust pt-0.5">{k}</dt>
                  <dd className="text-bone/90">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              <NarrateButton text={pieceText(piece, true)} id={'piece-' + piece.id} />
              <button
                onClick={() => setInspect(!inspect)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors ${
                  inspect ? 'border-amber text-amber' : 'border-white/15 text-tin hover:text-amber hover:border-amber/50'
                }`}
              >
                <RotateCw size={13} /> {inspect ? 'Girando' : 'Girar pieza'}
              </button>
            </div>
            {!touring && (
              <div className="mt-6 flex items-center justify-between">
                <button onClick={() => step(-1)} className="inline-flex items-center gap-1 text-sm text-tin hover:text-amber">
                  <ChevronLeft size={16} /> Anterior
                </button>
                <button onClick={() => step(1)} className="inline-flex items-center gap-1 text-sm text-tin hover:text-amber">
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            )}
            <p className="mt-6 text-[11px] text-dust leading-relaxed">Reconstrucción digital representativa del tipo de objeto y de la época; no es el objeto original de la emisora.</p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default function Museum() {
  const selected = useMuseumStore((s) => s.selected);
  const touring = useMuseumStore((s) => s.touring);
  const select = useMuseumStore((s) => s.select);
  const setTouring = useMuseumStore((s) => s.setTouring);
  const globalTour = useTour((s) => s.active);

  // narración breve automática al elegir una pieza (si el narrador está activo)
  useEffect(() => {
    if (!selected || touring || globalTour) return;
    const p = pieceById(selected);
    if (!p || !useExperience.getState().narratorOn) return;
    const t = window.setTimeout(() => void narrate(pieceText(p), 'piece-' + p.id), 900);
    return () => window.clearTimeout(t);
  }, [selected, touring, globalTour]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'Escape') select(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      useMuseumStore.getState().select(null);
      useMuseumStore.getState().setTouring(false);
    };
  }, [select]);

  const toggleTour = () => {
    if (touring) {
      setTouring(false);
      stopNarration();
      select(null);
      return;
    }
    void (async () => {
      await narrate(NARRATION.museum, 'museum-intro', { force: true });
      await runMuseumTour();
    })();
  };

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <MuseumScene />
        </Suspense>
      </div>
      <Loader />

      {/* encabezado */}
      <AnimatePresence>
        {!selected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-24 md:top-28 left-5 md:left-12 z-10 max-w-md pointer-events-none"
          >
            <p className="eyebrow">Sala 03 · Museo 3D</p>
            <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[0.95] tracking-tight">
              Sala de <span className="italic text-amber">objetos</span>
            </h1>
            <p className="mt-4 text-tin leading-relaxed">Siete piezas reconstruidas por código cuentan cómo se hacía radio en un campamento minero. Toca una pieza para acercarte.</p>
            <p className="mt-4 font-mono text-[10px] tracking-[0.2em] uppercase text-dust">Arrastrar: girar · Rueda: acercar · ← → : piezas</p>
          </motion.div>
        )}
      </AnimatePresence>

      <InfoPanel />

      {/* selector inferior */}
      <div className="absolute bottom-[84px] md:bottom-6 left-3 right-3 md:left-[292px] md:right-[300px] z-10 flex items-center gap-2">
        <button onClick={() => step(-1)} className="hidden sm:flex w-11 h-11 rounded-full panel items-center justify-center hover:text-amber" aria-label="Pieza anterior">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 overflow-x-auto no-scrollbar" data-lenis-prevent>
          <div className="flex gap-2 w-max">
            {MUSEUM_PIECES.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  sfx.click();
                  select(selected === p.id ? null : p.id);
                }}
                className={`rounded-full px-4 py-2.5 text-[13px] whitespace-nowrap border transition-colors ${
                  selected === p.id ? 'bg-amber text-ink border-amber' : 'panel text-tin hover:text-bone'
                }`}
              >
                <span className="font-mono text-[10px] mr-2 opacity-70">{p.number}</span>
                {p.title}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => step(1)} className="hidden sm:flex w-11 h-11 rounded-full panel items-center justify-center hover:text-amber" aria-label="Pieza siguiente">
          <ChevronRight size={18} />
        </button>
        <button
          onClick={toggleTour}
          className={`inline-flex items-center gap-2 rounded-full px-4 h-11 font-mono text-[11px] tracking-[0.18em] uppercase whitespace-nowrap transition-colors ${
            touring ? 'bg-ember text-ink' : 'bg-amber text-ink hover:bg-amber-hi'
          }`}
          data-cursor={touring ? 'DETENER' : 'INICIAR'}
        >
          {touring ? <Square size={13} fill="currentColor" /> : <Compass size={15} />}
          <span className="hidden md:inline">{touring ? 'Detener' : 'Recorrido'}</span>
        </button>
        {selected && (
          <button onClick={() => select(null)} className="w-11 h-11 rounded-full panel flex items-center justify-center hover:text-amber" aria-label="Vista general" title="Vista general">
            <Expand size={16} />
          </button>
        )}
      </div>
    </section>
  );
}
