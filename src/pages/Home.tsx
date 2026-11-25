import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Boxes, Clock3, Map, Mic2, Radio, Image as ImageIcon, BookOpen, ChevronDown } from 'lucide-react';
import { ROUTES } from '../data/routes';
import { QUOTES } from '../data/people';
import { NARRATION } from '../data/narration';
import { Footer } from '../components/layout/Footer';
import { Counter, NarrateButton, Reveal, SplitTitle } from '../components/ui/Reveal';
import { useRadio } from '../stores/useRadio';
import { useExperience } from '../stores/useExperience';

gsap.registerPlugin(ScrollTrigger);

const HeroScene = lazy(() => import('../components/three/scenes/HeroScene'));

const ICONS: Record<string, typeof Radio> = {
  '/historia': Clock3,
  '/museo': Boxes,
  '/red-minera': Map,
  '/voces': Mic2,
  '/archivo': ImageIcon,
  '/en-vivo': Radio,
  '/creditos': BookOpen,
};

const DIAL_MARKS = ['1959', '1961', '1965', '1967', '1971', '1977', '1980', '1986', 'HOY'];

function Hero() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const indicator = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(true);
  const phase = useExperience((s) => s.phase);
  const play = useRadio((s) => s.play);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '100px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          progress.current = self.progress;
          if (indicator.current) indicator.current.style.left = `${self.progress * 100}%`;
          if (readout.current) readout.current.textContent = (5.8 + self.progress * 0.55).toFixed(3) + ' Mc';
        },
      });
      const chapters = gsap.utils.toArray<HTMLElement>('.hero-chapter');
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.8 } });
      chapters.forEach((el, i) => {
        const at = i * 1;
        if (i > 0) tl.fromTo(el, { autoAlpha: 0, y: 70, filter: 'blur(10px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.35, ease: 'power2.out' }, at - 0.1);
        if (i < chapters.length - 1) tl.to(el, { autoAlpha: 0, y: -70, filter: 'blur(10px)', duration: 0.3, ease: 'power2.in' }, at + 0.62);
      });
      tl.to('.hero-hint', { autoAlpha: 0, duration: 0.2 }, 0.05);
    },
    { scope: root },
  );

  return (
    <section ref={root} id="hero" className="relative h-[460vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0">
          <Suspense fallback={<div className="absolute inset-0 bg-ink" />}>
            <HeroScene progress={progress} active={inView && phase !== 'outro'} />
          </Suspense>
        </div>
        {/* degradados para legibilidad */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-ink/90 via-ink/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-56 pointer-events-none bg-gradient-to-t from-ink via-ink/60 to-transparent" />

        {/* capítulos */}
        <div className="absolute inset-0 flex items-center px-5 md:px-12 2xl:px-24 pointer-events-none">
          <div className="relative w-full max-w-3xl h-[70vh]">
            <div className="hero-chapter absolute inset-0 flex flex-col justify-center pointer-events-auto">
              <p className="eyebrow mb-6">Museo virtual interactivo · 1959 – hoy</p>
              <h1 className="font-display text-[19vw] sm:text-[15vw] lg:text-[10.5vw] leading-[0.82] tracking-[-0.03em]">
                Radio
                <br />
                <span className="italic text-amber glow-amber">Pío XII</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg md:text-xl text-tin leading-relaxed">
                La voz del distrito minero <span className="text-bone">Siglo XX – Catavi</span>, en Llallagua, Potosí. Una emisora que nació para evangelizar y terminó siendo, por decisión de su pueblo, una mina de coraje.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link to="/museo" className="group inline-flex items-center gap-3 rounded-full bg-amber text-ink px-7 py-4 font-mono text-xs tracking-[0.2em] uppercase hover:bg-amber-hi transition-colors" data-cursor="ENTRAR">
                  Explorar el museo 3D <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <button onClick={() => play()} className="inline-flex items-center gap-3 rounded-full panel px-7 py-4 font-mono text-xs tracking-[0.2em] uppercase hover:border-signal/60 hover:text-signal transition-colors" data-cursor="ESCUCHAR">
                  <span className="w-2 h-2 rounded-full bg-ember blink-soft" /> Escuchar en vivo
                </button>
              </div>
            </div>

            <div className="hero-chapter absolute inset-0 flex flex-col justify-center invisible">
              <p className="eyebrow mb-6">1 de mayo de 1959</p>
              <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
                Una antena sobre
                <br />
                <span className="italic text-amber">el campamento</span>
              </h2>
              <p className="mt-8 max-w-xl text-lg text-tin leading-relaxed">
                A casi 3 900 metros de altura, el oblato canadiense Lino Grenier inaugura <span className="text-bone">Emisoras Pío XII</span> con un lema: “decir la verdad y hacer el bien”. Al comienzo, su línea anticomunista la enfrentó con los sindicatos.
              </p>
            </div>

            <div className="hero-chapter absolute inset-0 flex flex-col justify-center invisible">
              <p className="eyebrow mb-6 !text-ember">1961 · 1969 · 1975 · 1980</p>
              <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
                La radio que
                <br />
                <span className="italic text-amber">no pudieron callar</span>
              </h2>
              <p className="mt-8 max-w-xl text-lg text-tin leading-relaxed">
                Recibió dinamita de los mineros en 1961 y, después, de los militares. Fue intervenida, saqueada y silenciada en 1980. Cada vez, el campamento la hizo volver: <span className="text-bone">“la convirtieron los mineros, las señoras, los campesinos”</span>.
              </p>
            </div>

            <div className="hero-chapter absolute inset-0 flex flex-col justify-center invisible pointer-events-auto">
              <p className="eyebrow mb-6 !text-signal">● Señal en vivo</p>
              <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
                Más de 65 años
                <br />
                <span className="italic text-amber">y sigue al aire</span>
              </h2>
              <p className="mt-8 max-w-xl text-lg text-tin leading-relaxed">
                La Red Pío XII transmite hoy desde Siglo XX, Oruro y Cochabamba, en castellano y quechua. Su señal llega a este museo en tiempo real.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link to="/en-vivo" className="inline-flex items-center gap-3 rounded-full bg-amber text-ink px-7 py-4 font-mono text-xs tracking-[0.2em] uppercase hover:bg-amber-hi transition-colors">
                  Sintonizar ahora <ArrowRight size={16} />
                </Link>
                <Link to="/historia" className="inline-flex items-center gap-3 rounded-full panel px-7 py-4 font-mono text-xs tracking-[0.2em] uppercase hover:text-amber transition-colors">
                  Recorrer la historia
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* dial de progreso */}
        <div className="hidden md:block absolute bottom-[104px] left-12 right-12 pointer-events-none">
          <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] text-dust mb-2">
            <span>ONDA CORTA · 49 m</span>
            <span ref={readout} className="text-amber">5.800 Mc</span>
          </div>
          <div className="relative h-8">
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
            {Array.from({ length: 49 }).map((_, i) => (
              <div key={i} className="absolute top-1/2 w-px bg-white/25" style={{ left: `${(i / 48) * 100}%`, height: i % 6 === 0 ? 14 : 6, transform: 'translateY(-50%)' }} />
            ))}
            <div ref={indicator} className="absolute top-0 bottom-0 w-[2px] bg-ember shadow-[0_0_12px_rgba(224,80,47,0.9)]" style={{ left: '0%' }} />
          </div>
          <div className="relative h-4 mt-1">
            {DIAL_MARKS.map((m, i) => (
              <span key={m} className="absolute font-mono text-[10px] text-tin -translate-x-1/2" style={{ left: `${(i / (DIAL_MARKS.length - 1)) * 100}%` }}>
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-hint hidden md:flex absolute bottom-48 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-tin pointer-events-none">
          <span className="font-mono text-[10px] tracking-[0.35em] uppercase">Desliza para sintonizar</span>
          <ChevronDown size={18} className="animate-bounce" />
        </div>
      </div>
    </section>
  );
}

function Rooms() {
  const rooms = ROUTES.filter((r) => r.path !== '/');
  return (
    <section className="relative px-5 md:px-12 py-28 md:py-40 max-w-[1500px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <Reveal>
            <p className="eyebrow mb-5">Siete salas</p>
          </Reveal>
          <SplitTitle text="Recorre el museo a tu manera" accentFrom={3} className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight max-w-3xl" />
        </div>
        <Reveal delay={0.2}>
          <p className="max-w-sm text-tin leading-relaxed">Cada sala es una frecuencia distinta del mismo dial: la historia, los objetos, la red de radios, las voces, el archivo y la señal de hoy.</p>
        </Reveal>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((r, i) => {
          const Icon = ICONS[r.path] ?? Radio;
          return (
            <Reveal key={r.path} delay={(i % 3) * 0.08}>
              <Link
                to={r.path}
                className={`group relative block h-full min-h-[260px] rounded-3xl border border-white/10 bg-shaft/60 p-7 overflow-hidden transition-colors duration-500 hover:border-amber/50 ${i === 0 ? 'lg:col-span-2' : ''}`}
                data-cursor="ENTRAR"
              >
                <div className="absolute -right-24 -bottom-24 w-72 h-72 rounded-full border border-amber/0 group-hover:border-amber/20 transition-all duration-700 group-hover:scale-110" />
                <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full border border-amber/0 group-hover:border-amber/30 transition-all duration-700 delay-75 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'radial-gradient(circle at 85% 90%, rgba(242,165,65,0.14), transparent 55%)' }} />
                <div className="relative flex items-start justify-between">
                  <span className="font-mono text-xs text-amber tracking-[0.3em]">SALA {r.number}</span>
                  <Icon size={22} className="text-tin group-hover:text-amber transition-colors" />
                </div>
                <h3 className="relative mt-16 font-display text-3xl md:text-4xl leading-tight group-hover:italic transition-all">{r.label}</h3>
                <p className="relative mt-3 text-tin leading-relaxed max-w-md">{r.description}</p>
                <ArrowRight className="absolute bottom-7 right-7 text-amber opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" size={20} />
              </Link>
            </Reveal>
          );
        })}
        <Reveal delay={0.16}>
          <div className="h-full min-h-[260px] rounded-3xl bg-amber text-ink p-7 flex flex-col justify-between">
            <span className="font-mono text-xs tracking-[0.3em]">MODO PRESENTACIÓN</span>
            <div>
              <h3 className="font-display text-3xl leading-tight">Recorrido guiado automático</h3>
              <p className="mt-3 opacity-80 leading-relaxed">El museo se presenta solo, sala por sala, con narración y subtítulos.</p>
              <button
                onClick={() => import('../components/experience/tour').then((m) => m.startGuidedTour())}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink text-amber px-5 py-3 font-mono text-xs tracking-[0.2em] uppercase hover:bg-coal transition-colors"
                data-cursor="INICIAR"
              >
                Iniciar recorrido <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Numbers() {
  const items = [
    { n: 1959, label: 'Año de fundación', note: '1 de mayo, campamento Siglo XX', format: false },
    { n: 65, suffix: '+', label: 'Años al aire', note: 'Silenciada solo por la fuerza' },
    { n: 15, label: 'Emisoras en cadena', note: 'Cadena de la Democracia, julio de 1980' },
    { n: 23, label: 'Días de huelga de hambre', note: 'Que arrancaron la amnistía en 1978' },
    { n: 3895, label: 'Metros de altura', note: 'Llallagua, norte de Potosí' },
  ];
  return (
    <section className="relative border-y border-white/10 bg-coal/80">
      <div className="max-w-[1500px] mx-auto grid grid-cols-2 lg:grid-cols-5">
        {items.map((it, i) => (
          <Reveal key={it.label} delay={i * 0.06} className={`p-8 md:p-10 ${i > 0 ? 'lg:border-l' : ''} ${i % 2 === 1 ? 'border-l lg:border-l' : ''} border-white/10 ${i > 1 ? 'border-t lg:border-t-0' : ''}`}>
            <p className="font-display text-5xl md:text-6xl text-amber tabular-nums">
              <Counter to={it.n} suffix={it.suffix} format={it.format !== false} />
            </p>
            <p className="mt-4 font-mono text-[11px] tracking-[0.22em] uppercase text-bone">{it.label}</p>
            <p className="mt-2 text-sm text-dust leading-snug">{it.note}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Quotes() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((v) => (v + 1) % QUOTES.length), 9000);
    return () => window.clearInterval(t);
  }, []);
  const q = QUOTES[i];
  return (
    <section className="relative px-5 md:px-12 py-32 md:py-44 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(242,165,65,0.08), transparent 60%)' }} />
      <div className="relative max-w-5xl mx-auto text-center">
        <p className="eyebrow mb-10">Palabras que quedaron grabadas</p>
        <div className="min-h-[300px] md:min-h-[260px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.figure key={i} initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }} transition={{ duration: 0.8 }}>
              <blockquote className="font-display-soft italic text-3xl md:text-5xl leading-[1.15] text-bone">“{q.text}”</blockquote>
              <figcaption className="mt-8 font-mono text-xs tracking-[0.25em] uppercase">
                <span className="text-amber">{q.author}</span>
                <span className="text-dust"> · {q.context}</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
        <div className="mt-12 flex items-center justify-center gap-6">
          <div className="flex gap-2">
            {QUOTES.map((_, k) => (
              <button key={k} onClick={() => setI(k)} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-10 bg-amber' : 'w-4 bg-white/20 hover:bg-white/40'}`} aria-label={`Cita ${k + 1}`} />
            ))}
          </div>
          <NarrateButton text={`${q.text} ${q.author}.`} id={'quote-' + i} />
        </div>
        <p className="mt-8 text-xs text-dust">Citas literales de López Vigil, J. I. (1985). Una mina de coraje. ALER – Pío XII.</p>
      </div>
    </section>
  );
}

function MemoryTeaser() {
  return (
    <section className="px-5 md:px-12 pb-32">
      <Reveal>
        <Link to="/en-vivo" className="group relative block max-w-[1500px] mx-auto rounded-[2rem] overflow-hidden border border-white/10 bg-gradient-to-br from-[#2a1a0c] via-shaft to-ink p-10 md:p-16" data-cursor="SINTONIZAR">
          <div className="absolute inset-0 bg-dial-grid opacity-30" />
          <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-amber/10" />
          <div className="absolute right-[-2%] top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-amber/20" />
          <div className="absolute right-[6%] top-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-amber/40 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative max-w-2xl">
            <p className="eyebrow mb-5">Sala 07 · Frecuencia memoria</p>
            <h2 className="font-display text-4xl md:text-6xl leading-[1] tracking-tight">
              Gira el dial y <span className="italic text-amber">escucha el pasado</span>
            </h2>
            <p className="mt-6 text-tin text-lg leading-relaxed">Seis estaciones del tiempo, de 1959 a hoy, narradas como boletines radiales. Y al lado, la señal real de Radio Pío XII, en vivo desde Siglo XX.</p>
            <span className="mt-10 inline-flex items-center gap-3 font-mono text-xs tracking-[0.2em] uppercase text-amber">
              Ir a la sala en vivo <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </Reveal>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <div className="relative bg-ink">
        <div className="px-5 md:px-12 pt-24 max-w-[1500px] mx-auto flex flex-wrap items-center gap-4 justify-between">
          <Reveal>
            <p className="max-w-2xl font-display-soft italic text-2xl md:text-3xl text-tin leading-snug">
              “El pueblo boliviano es <span className="text-amber not-italic font-display">una mina de coraje</span>.” <span className="font-mono not-italic text-xs tracking-[0.2em] text-dust">— P. Roberto Durette, 1984</span>
            </p>
          </Reveal>
          <NarrateButton text={NARRATION.welcome} id="home-welcome" label="Escuchar la bienvenida" />
        </div>
        <Rooms />
        <Numbers />
        <Quotes />
        <MemoryTeaser />
      </div>
      <Footer />
    </>
  );
}
