import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { PEOPLE, QUOTES, type Person } from '../data/people';
import { IMAGES } from '../data/images';
import { NARRATION } from '../data/narration';
import { Footer } from '../components/layout/Footer';
import { NarrateButton, Reveal, SplitTitle } from '../components/ui/Reveal';
import { sfx } from '../stores/useExperience';
import { setScrollLocked } from '../lib/smoothScroll';

const PORTRAIT: Record<string, keyof typeof IMAGES> = {
  domitila: 'domitila',
  lechin: 'lechin',
};

function Monogram({ initials }: { initials: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#241a11] to-[#0f0c09]">
      {[1, 0.75, 0.5].map((s) => (
        <span key={s} className="absolute rounded-full border border-amber/20" style={{ width: `${s * 80}%`, aspectRatio: '1' }} />
      ))}
      <span className="relative font-display italic text-6xl text-amber/90">{initials}</span>
    </div>
  );
}

function PersonCard({ p, onOpen, i }: { p: Person; onOpen: () => void; i: number }) {
  const img = PORTRAIT[p.id] ? IMAGES[PORTRAIT[p.id]] : null;
  return (
    <Reveal delay={(i % 4) * 0.07}>
      <button onClick={onOpen} className="group text-left w-full" data-cursor="LEER">
        <div className="relative aspect-[4/5] rounded-[1.6rem] overflow-hidden border border-white/10">
          {img ? <img src={img.src} alt={img.alt} loading="lazy" className="archival absolute inset-0 w-full h-full object-cover object-top" /> : <Monogram initials={p.initials} />}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-amber">{p.life}</p>
            <h3 className="mt-2 font-display text-2xl leading-tight group-hover:italic transition-all">{p.name}</h3>
          </div>
        </div>
        <p className="mt-3 text-sm text-tin leading-snug">{p.role}</p>
      </button>
    </Reveal>
  );
}

function PersonModal({ p, onClose }: { p: Person | null; onClose: () => void }) {
  useEffect(() => {
    setScrollLocked(!!p);
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => {
      window.removeEventListener('keydown', k);
      setScrollLocked(false);
    };
  }, [p, onClose]);
  const img = p && PORTRAIT[p.id] ? IMAGES[PORTRAIT[p.id]] : null;
  return (
    <AnimatePresence>
      {p && (
        <motion.div className="fixed inset-0 z-[82] bg-ink/80 backdrop-blur-md flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="relative panel rounded-[2rem] max-w-4xl w-full grid md:grid-cols-[0.9fr_1.1fr] overflow-hidden max-h-[90vh]"
            initial={{ y: 40, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, scale: 0.97 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
          >
            <div className="relative min-h-[260px]">
              {img ? <img src={img.src} alt={img.alt} className="absolute inset-0 w-full h-full object-cover object-top" /> : <Monogram initials={p.initials} />}
            </div>
            <div className="p-8 md:p-10 overflow-y-auto">
              <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center hover:bg-white/10" aria-label="Cerrar">
                <X size={18} />
              </button>
              <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-amber">{p.life}</p>
              <h2 className="mt-3 font-display text-4xl leading-tight">{p.name}</h2>
              <p className="mt-2 font-display-soft italic text-lg text-tin">{p.role}</p>
              <p className="mt-6 text-bone/90 leading-relaxed">{p.bio}</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <NarrateButton text={`${p.name}. ${p.role}. ${p.bio}`} id={'person-' + p.id} />
                <span className="text-[11px] text-dust">Fuente: {p.source}</span>
              </div>
              {img && (
                <p className="mt-6 text-[10px] text-dust">
                  Imagen: {img.caption} · {img.credit} · {img.license}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const PROGRAMS = [
  { name: 'Ríase en quechua', note: 'Humor y vida cotidiana en la lengua del norte de Potosí.' },
  { name: 'Golpes sobre el Yunque', note: 'Programa de Mauricio Aira.' },
  { name: 'Olla de Grillos', note: 'Programa de Jorge Mansilla, “Coco Manto”.' },
  { name: 'Rumi Tambo', note: 'Radionovela producida por la emisora.' },
  { name: 'Takiy Tinkuy', note: 'Festival de música organizado desde 1986.' },
];

const WORKS = [
  { year: '1971', title: 'El coraje del pueblo', who: 'Jorge Sanjinés (cine)', note: 'Recrea la masacre de San Juan con sus protagonistas reales, entre ellos Domitila.' },
  { year: '1977', title: '“Si me permiten hablar…”', who: 'Moema Viezzer (libro)', note: 'El testimonio de Domitila Barrios de Chungara.' },
  { year: '1985', title: 'Una mina de coraje', who: 'José Ignacio López Vigil (libro)', note: 'La historia de la Pío XII contada por sus protagonistas.' },
  { year: '1989', title: 'Las radios mineras de Bolivia', who: 'A. Gumucio Dagron y L. Cajías (eds.)', note: 'Estudio de referencia publicado con apoyo de la UNESCO.' },
  { year: '1996', title: 'Tierra adentro', who: 'Verónica Córdova (cine)', note: 'Mediometraje rodado en Toledo y Siglo XX; Cóndor de Plata.' },
];

export default function Voices() {
  const [open, setOpen] = useState<Person | null>(null);
  return (
    <>
      <header className="relative px-5 md:px-12 pt-36 pb-16 max-w-[1500px] mx-auto">
        <Reveal>
          <p className="eyebrow mb-6">Sala 05 · Voces</p>
        </Reveal>
        <SplitTitle as="h1" text="Voces de la mina" accentFrom={2} className="font-display text-7xl md:text-[9vw] leading-[0.88] tracking-tight" />
        <div className="mt-10 grid md:grid-cols-[1fr_auto] gap-8 items-end">
          <Reveal delay={0.15}>
            <p className="max-w-2xl text-lg text-tin leading-relaxed">
              Una radio es lo que dicen sus voces. Mujeres del Comité de Amas de Casa, dirigentes sindicales, sacerdotes que cambiaron de bando y locutores que se jugaron la vida ante el micrófono.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <NarrateButton text={NARRATION.voices} id="voices-intro" />
          </Reveal>
        </div>
      </header>

      {/* Destacado: la huelga */}
      <section className="px-5 md:px-12 pb-24 max-w-[1500px] mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10 items-center rounded-[2rem] border border-white/10 bg-shaft/50 p-6 md:p-12 overflow-hidden relative">
          <div className="absolute -left-32 -bottom-32 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(242,165,65,0.12), transparent 60%)' }} />
          <Reveal>
            <figure className="relative">
              <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-bone">
                <img src={IMAGES.domitila.src} alt={IMAGES.domitila.alt} className="absolute inset-0 w-full h-full object-cover mix-blend-multiply" loading="lazy" />
              </div>
              <figcaption className="mt-3 text-[11px] text-dust">
                {IMAGES.domitila.caption} · {IMAGES.domitila.credit} · {IMAGES.domitila.license}
              </figcaption>
            </figure>
          </Reveal>
          <div className="relative">
            <p className="eyebrow mb-5">28 de diciembre de 1977 – enero de 1978</p>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.98] tracking-tight">
              Cuatro mujeres contra <span className="italic text-amber">una dictadura</span>
            </h2>
            <p className="mt-6 text-lg text-tin leading-relaxed">
              Cuatro esposas de mineros de Siglo XX —de apellidos Paniagua, Lora, Flores y Pimentel— y catorce niños comenzaron una huelga de hambre en el Arzobispado de La Paz. La decisión se había tomado en el salón de la Pío XII. Se sumaron Domitila Barrios de Chungara y más de mil personas. A los 23 días, el régimen de Banzer concedió la amnistía.
            </p>
            <blockquote className="mt-8 border-l-2 border-amber pl-6 font-display-soft italic text-2xl leading-snug text-bone">
              “Nosotros, oigan bien, nosotros y no los padres ni nadie hemos ordenado que la Pío XII siga transmitiendo.”
              <footer className="mt-3 font-mono not-italic text-[11px] tracking-[0.2em] uppercase text-dust">Dirigentes mineros, al aire · 16 de enero de 1978</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Personajes */}
      <section className="px-5 md:px-12 pb-28 max-w-[1500px] mx-auto">
        <div className="flex items-end justify-between gap-6 mb-10">
          <SplitTitle text="Quiénes hicieron la historia" accentFrom={2} className="font-display text-4xl md:text-6xl leading-[0.98] tracking-tight" />
          <p className="hidden md:block text-sm text-dust max-w-xs">Toca una tarjeta para leer la biografía y escucharla.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {PEOPLE.map((p, i) => (
            <PersonCard
              key={p.id}
              p={p}
              i={i}
              onOpen={() => {
                sfx.click();
                setOpen(p);
              }}
            />
          ))}
        </div>
      </section>

      {/* Muro de citas */}
      <section className="px-5 md:px-12 py-24 bg-coal border-y border-white/10">
        <div className="max-w-[1500px] mx-auto">
          <p className="eyebrow mb-10">Palabras grabadas · citas literales</p>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-5 [&>*]:mb-5">
            {QUOTES.map((q, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <figure className="break-inside-avoid rounded-[1.5rem] border border-white/10 bg-shaft/60 p-7">
                  <blockquote className="font-display-soft italic text-xl md:text-2xl leading-snug">“{q.text}”</blockquote>
                  <figcaption className="mt-5 flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] tracking-[0.18em] uppercase">
                      <span className="text-amber">{q.author}</span>
                      <span className="text-dust"> · {q.context}</span>
                    </span>
                    <NarrateButton text={`${q.text} ${q.author}.`} id={'wall-' + i} label="Oír" />
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-xs text-dust">Fuente de las citas: López Vigil, J. I. (1985). Una mina de coraje: Radios mineras de Bolivia. ALER; Pío XII (CC BY-NC-SA 3.0).</p>
        </div>
      </section>

      {/* Programas y obras */}
      <section className="px-5 md:px-12 py-28 max-w-[1500px] mx-auto grid lg:grid-cols-2 gap-16">
        <div>
          <p className="eyebrow mb-6">En el aire</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight">Programas que hicieron historia</h2>
          <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {PROGRAMS.map((p) => (
              <li key={p.name} className="py-5 flex items-baseline justify-between gap-6">
                <span className="font-display text-2xl">{p.name}</span>
                <span className="text-sm text-tin text-right">{p.note}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] text-dust">Fuentes: López Vigil (1985); radiopio12.com.bo.</p>
        </div>
        <div>
          <p className="eyebrow mb-6">Para seguir escuchando</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight">Libros y películas</h2>
          <ul className="mt-10 space-y-4">
            {WORKS.map((w) => (
              <li key={w.title} className="grid grid-cols-[64px_1fr] gap-5 rounded-2xl border border-white/10 p-5 hover:border-amber/40 transition-colors">
                <span className="font-display text-2xl text-amber">{w.year}</span>
                <span>
                  <span className="block font-display text-xl">{w.title}</span>
                  <span className="block text-xs font-mono tracking-[0.15em] uppercase text-dust mt-1">{w.who}</span>
                  <span className="block text-sm text-tin mt-2">{w.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PersonModal p={open} onClose={() => setOpen(null)} />
      <Footer />
    </>
  );
}
