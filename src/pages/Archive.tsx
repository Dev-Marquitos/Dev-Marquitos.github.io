import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import { IMAGE_LIST, type ArchiveImage } from '../data/images';
import { Footer } from '../components/layout/Footer';
import { Reveal, SplitTitle } from '../components/ui/Reveal';
import { sfx } from '../stores/useExperience';
import { setScrollLocked } from '../lib/smoothScroll';

const TAGS = ['Todos', 'Distrito minero', 'Interior mina', 'Personas', 'Altiplano', 'Radio'] as const;

function FilmStrip() {
  const list = [...IMAGE_LIST, ...IMAGE_LIST];
  return (
    <div className="relative overflow-hidden py-6 border-y border-white/10 bg-black">
      <div className="absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-black to-transparent" />
      <div className="absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-black to-transparent" />
      <div className="flex w-max gap-3 marquee-track">
        {list.map((im, i) => (
          <div key={i} className="relative h-40 md:h-52 shrink-0 rounded-md overflow-hidden border-y-[10px] border-black" style={{ aspectRatio: `${im.w}/${im.h}` }}>
            <img src={im.src} alt="" loading="lazy" className="archival w-full h-full object-cover" />
            <div className="absolute inset-x-0 -top-[10px] h-[10px] flex justify-around">
              {Array.from({ length: 8 }).map((_, k) => (
                <span key={k} className="w-2 h-1.5 mt-[2px] rounded-sm bg-white/25" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Lightbox({ list, index, onClose, onMove }: { list: ArchiveImage[]; index: number | null; onClose: () => void; onMove: (d: 1 | -1) => void }) {
  useEffect(() => {
    if (index === null) return;
    setScrollLocked(true);
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onMove(1);
      if (e.key === 'ArrowLeft') onMove(-1);
    };
    window.addEventListener('keydown', k);
    return () => {
      window.removeEventListener('keydown', k);
      setScrollLocked(false);
    };
  }, [index, onClose, onMove]);
  const im = index !== null ? list[index] : null;
  return (
    <AnimatePresence>
      {im && (
        <motion.div className="fixed inset-0 z-[82] bg-black/92 backdrop-blur-sm flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <div className="flex items-center justify-between px-5 md:px-8 h-16 md:h-20 shrink-0">
            <span className="font-mono text-xs tracking-[0.25em] text-tin">
              {String(index! + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}
            </span>
            <button onClick={onClose} className="w-10 h-10 rounded-full panel flex items-center justify-center" aria-label="Cerrar">
              <X size={18} />
            </button>
          </div>
          <div className="relative flex-1 flex items-center justify-center px-4 md:px-24 min-h-0" onClick={(e) => e.stopPropagation()}>
            <AnimatePresence mode="wait">
              <motion.img
                key={im.src}
                src={im.src}
                alt={im.alt}
                className="max-h-full max-w-full object-contain rounded-lg shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35 }}
              />
            </AnimatePresence>
            <button onClick={() => onMove(-1)} className="absolute left-3 md:left-8 w-12 h-12 rounded-full panel flex items-center justify-center hover:text-amber" aria-label="Anterior">
              <ChevronLeft />
            </button>
            <button onClick={() => onMove(1)} className="absolute right-3 md:right-8 w-12 h-12 rounded-full panel flex items-center justify-center hover:text-amber" aria-label="Siguiente">
              <ChevronRight />
            </button>
          </div>
          <div className="shrink-0 px-5 md:px-8 py-5 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-3" onClick={(e) => e.stopPropagation()}>
            <div>
              <p className="font-display text-xl md:text-2xl">{im.caption}</p>
              <p className="mt-1 text-sm text-tin">
                {im.credit} · {im.license}
              </p>
            </div>
            <a href={im.page} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-amber link-underline">
              Ver en Wikimedia Commons <ExternalLink size={14} />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Archive() {
  const [tag, setTag] = useState<(typeof TAGS)[number]>('Todos');
  const [open, setOpen] = useState<number | null>(null);
  const list = useMemo(() => (tag === 'Todos' ? IMAGE_LIST : IMAGE_LIST.filter((i) => i.tag === tag)), [tag]);
  const move = useCallback((d: 1 | -1) => setOpen((v) => (v === null ? v : (v + d + list.length) % list.length)), [list.length]);
  const close = useCallback(() => setOpen(null), []);

  return (
    <>
      <header className="relative px-5 md:px-12 pt-36 pb-14 max-w-[1500px] mx-auto">
        <Reveal>
          <p className="eyebrow mb-6">Sala 06 · Archivo</p>
        </Reveal>
        <SplitTitle as="h1" text="Archivo fotográfico" accentFrom={1} className="font-display text-7xl md:text-[9vw] leading-[0.88] tracking-tight" />
        <Reveal delay={0.15}>
          <p className="mt-10 max-w-2xl text-lg text-tin leading-relaxed">
            El campamento, la mina, el altiplano y su gente. Fotografías históricas de dominio público y fotografías actuales con licencia Creative Commons, con su autoría y su licencia en cada imagen.
          </p>
        </Reveal>
      </header>

      <FilmStrip />

      <section className="px-5 md:px-12 py-16 max-w-[1500px] mx-auto">
        <div className="flex flex-wrap gap-2 mb-10">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => {
                sfx.tick();
                setTag(t);
              }}
              className={`rounded-full px-4 py-2 text-sm border transition-colors ${t === tag ? 'bg-amber text-ink border-amber' : 'border-white/15 text-tin hover:text-bone'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-5 [&>*]:mb-5">
          <AnimatePresence>
            {list.map((im, i) => (
              <motion.button
                layout
                key={im.src}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => {
                  sfx.click();
                  setOpen(i);
                }}
                className="group relative block w-full break-inside-avoid rounded-[1.25rem] overflow-hidden border border-white/10 text-left"
                data-cursor="VER"
              >
                <img src={im.src} alt={im.alt} loading="lazy" className="archival w-full h-auto block" style={{ aspectRatio: `${im.w}/${im.h}` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform">
                  <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-amber">{im.tag}</p>
                  <p className="mt-1 font-display text-lg leading-snug">{im.caption}</p>
                  <p className="mt-1 text-[11px] text-tin opacity-0 group-hover:opacity-100 transition-opacity">
                    {im.credit} · {im.license}
                  </p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
        <p className="mt-8 text-xs text-dust max-w-3xl">
          No existen fotografías de Radio Pío XII con licencia libre; las imágenes de radios y micrófonos son referenciales. Las imágenes se redimensionaron y se muestran con un filtro de color; las obras CC BY-SA conservan su licencia.
        </p>
      </section>
      <Lightbox list={list} index={open} onClose={close} onMove={move} />
      <Footer />
    </>
  );
}
