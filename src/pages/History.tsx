import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';
import { ALL_EVENTS, ERAS, type TimelineEvent, type Tone } from '../data/timeline';

const ALL_COUNT = ALL_EVENTS.length;
import { IMAGES } from '../data/images';
import { NARRATION } from '../data/narration';
import { Footer } from '../components/layout/Footer';
import { NarrateButton, Reveal, SplitTitle } from '../components/ui/Reveal';

gsap.registerPlugin(ScrollTrigger);

const TONE: Record<Tone, { color: string; label: string }> = {
  mine: { color: 'var(--color-tin)', label: 'Minería' },
  radio: { color: 'var(--color-amber)', label: 'Radio' },
  tragedy: { color: 'var(--color-ember)', label: 'Represión' },
  people: { color: 'var(--color-amber-hi)', label: 'Pueblo' },
  today: { color: 'var(--color-signal)', label: 'Hoy' },
};

const EVENT_IMAGE: Record<string, keyof typeof IMAGES> = {
  'La veta de La Salvadora': 'sigloEntrance',
  'Masacre de Catavi': 'catavi1930',
  'La Voz del Minero': 'siglo1940',
  'Nacionalización de las minas': 'revolutionRelief',
  'Nace Emisoras Pío XII': 'tubeRadio',
  'La masacre de septiembre': 'minersNorte',
  'La huelga de las cuatro mujeres': 'domitila',
  'Asalto a cuatro radios': 'ribbonMic',
  'Decreto 21060': 'cataviOverview',
  'Marcha por la Vida': 'minerCart',
  'Cincuenta años': 'sigloBuildings',
  'Sigue al aire': 'llallaguaDawn',
};

function EventPanel({ ev, index }: { ev: TimelineEvent; index: number }) {
  const tone = TONE[ev.tone];
  const imgKey = EVENT_IMAGE[ev.title];
  const img = imgKey ? IMAGES[imgKey] : null;
  return (
    <article className="tl-panel relative shrink-0 w-full md:w-[min(64vw,980px)] md:h-full flex items-center px-5 md:px-12 py-14 md:py-0" data-year={ev.year}>
      <div className={`relative grid gap-8 md:gap-12 items-center w-full ${img ? 'md:grid-cols-[1.05fr_0.95fr]' : ''}`}>
        <div className="relative">
          <span className="tl-year block font-display leading-[0.8] tracking-[-0.04em] text-[24vw] md:text-[12vw] select-none" style={{ color: 'transparent', WebkitTextStroke: `1.5px ${tone.color}` }}>
            {ev.year}
          </span>
          <div className="relative -mt-[0.3em] md:-mt-[0.6em]">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10" style={{ background: tone.color }} />
              <span className="font-mono text-[11px] tracking-[0.25em] uppercase" style={{ color: tone.color }}>
                {tone.label}
              </span>
              {ev.date && <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-dust">· {ev.date}</span>}
            </div>
            <h3 className="font-display text-4xl md:text-5xl leading-[1] tracking-tight">{ev.title}</h3>
            <p className="mt-5 text-[17px] text-tin leading-relaxed max-w-xl">{ev.text}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <NarrateButton text={`${ev.date ?? ev.year}. ${ev.title}. ${ev.text}`} id={`ev-${index}`} />
              <span className="text-[11px] text-dust max-w-xs leading-snug">Fuente: {ev.source}</span>
            </div>
          </div>
        </div>
        {img && (
          <figure className="group relative hidden md:block">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 aspect-[4/3] bg-shaft">
              <img src={img.src} alt={img.alt} loading="lazy" className="archival absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <div className="absolute inset-0 scanlines opacity-30 mix-blend-overlay" />
            </div>
            <figcaption className="mt-3 text-[11px] text-dust leading-snug">
              {img.caption} · {img.credit}
            </figcaption>
          </figure>
        )}
      </div>
    </article>
  );
}

function EraPanel({ era, n }: { era: (typeof ERAS)[number]; n: number }) {
  return (
    <section className="tl-panel relative shrink-0 w-full md:w-[min(56vw,820px)] md:h-full flex items-center px-5 md:px-16 py-16 md:py-0 md:border-l border-white/10" data-year={era.range.split(' ')[0]}>
      <div>
        <p className="font-mono text-xs tracking-[0.35em] text-amber">ERA {['I', 'II', 'III', 'IV', 'V'][n]}</p>
        <p className="mt-6 font-mono text-sm tracking-[0.2em] text-dust">{era.range}</p>
        <h2 className="mt-3 font-display text-6xl md:text-8xl leading-[0.9] tracking-tight">
          {era.name.split(' ').slice(0, -1).join(' ')} <span className="italic text-amber">{era.name.split(' ').slice(-1)}</span>
        </h2>
        <p className="mt-8 text-lg text-tin leading-relaxed max-w-lg">{era.intro}</p>
      </div>
    </section>
  );
}

export default function History() {
  const root = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const needle = useRef<HTMLDivElement>(null);
  const yearLabel = useRef<HTMLSpanElement>(null);
  const [ticks, setTicks] = useState<{ year: string; frac: number }[]>([]);
  const ticksRef = useRef<{ year: string; frac: number }[]>([]);

  const measure = () => {
    const t = track.current;
    if (!t || window.innerWidth < 768) return;
    const dist = t.scrollWidth - window.innerWidth;
    if (dist <= 0) return;
    const out: { year: string; frac: number }[] = [];
    t.querySelectorAll<HTMLElement>('article.tl-panel').forEach((el) => {
      const center = el.offsetLeft + el.offsetWidth / 2;
      out.push({ year: el.dataset.year ?? '', frac: Math.min(1, Math.max(0, (center - window.innerWidth / 2) / dist)) });
    });
    ticksRef.current = out;
    setTicks(out);
  };

  useLayoutEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        const t = track.current!;
        const dist = () => t.scrollWidth - window.innerWidth;
        const tween = gsap.to(t, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin.current,
            pin: true,
            scrub: 0.9,
            end: () => '+=' + dist(),
            invalidateOnRefresh: true,
            onRefresh: measure,
            onUpdate: (self) => {
              if (needle.current) needle.current.style.left = `${self.progress * 100}%`;
              const list = ticksRef.current;
              if (list.length && yearLabel.current) {
                let best = list[0];
                for (const k of list) if (Math.abs(k.frac - self.progress) < Math.abs(best.frac - self.progress)) best = k;
                yearLabel.current.textContent = best.year;
              }
            },
          },
        });
        gsap.utils.toArray<HTMLElement>('.tl-year').forEach((el) => {
          gsap.fromTo(el, { xPercent: 18 }, { xPercent: -18, ease: 'none', scrollTrigger: { trigger: el, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
        });
        gsap.utils.toArray<HTMLElement>('.tl-panel figure').forEach((el) => {
          gsap.fromTo(el, { yPercent: 8, rotate: 1.5 }, { yPercent: -8, rotate: -1.5, ease: 'none', scrollTrigger: { trigger: el, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <header className="relative min-h-[92vh] flex items-end px-5 md:px-12 pb-20 pt-36 overflow-hidden">
        <div className="absolute inset-0 bg-dial-grid opacity-40" />
        <div className="absolute right-[-20vw] top-[10vh] w-[70vw] h-[70vw] rounded-full border border-amber/10" />
        <div className="absolute right-[-10vw] top-[20vh] w-[50vw] h-[50vw] rounded-full border border-amber/15" />
        <div className="relative max-w-[1500px] mx-auto w-full">
          <Reveal>
            <p className="eyebrow mb-6">Sala 02 · Historia · 1900 – hoy</p>
          </Reveal>
          <SplitTitle as="h1" text="Un siglo en el dial" accentFrom={2} className="font-display text-[16vw] md:text-[10vw] leading-[0.85] tracking-[-0.03em]" />
          <div className="mt-10 grid md:grid-cols-[1fr_auto] gap-8 items-end">
            <Reveal delay={0.2}>
              <p className="max-w-2xl text-lg md:text-xl text-tin leading-relaxed">
                Del imperio del estaño a la señal por internet: {ALL_COUNT} momentos documentados de la historia del distrito minero y de su radio. Las fechas y cifras proceden de fuentes publicadas; cuando discrepan, lo indicamos.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <NarrateButton text={NARRATION.history} id="history-intro" label="Escuchar introducción" />
            </Reveal>
          </div>
          <div className="mt-14 flex flex-wrap gap-2">
            {ERAS.map((e, i) => (
              <span key={e.id} className="rounded-full panel px-4 py-2 text-sm text-tin">
                <span className="font-mono text-[10px] text-amber mr-2">{['I', 'II', 'III', 'IV', 'V'][i]}</span>
                {e.name} <span className="text-dust">· {e.range}</span>
              </span>
            ))}
          </div>
        </div>
      </header>

      <div id="timeline" ref={pin} className="relative md:h-screen md:overflow-hidden bg-coal border-y border-white/10">
        <div className="absolute inset-0 bg-dial-grid opacity-25 pointer-events-none" />
        <div ref={track} className="relative flex flex-col md:flex-row md:h-full md:w-max will-change-transform">
          {ERAS.map((era, n) => (
            <div key={era.id} className="contents">
              <EraPanel era={era} n={n} />
              {era.events.map((ev, i) => (
                <EventPanel key={ev.title} ev={ev} index={n * 10 + i} />
              ))}
            </div>
          ))}
          <div className="hidden md:block shrink-0 w-[20vw]" />
        </div>

        {/* dial cronológico */}
        <div className="hidden md:block absolute left-12 right-12 bottom-24 pointer-events-none">
          <div className="flex items-center justify-between mb-2 font-mono text-[10px] tracking-[0.25em] uppercase text-dust">
            <span>Dial del tiempo</span>
            <span ref={yearLabel} className="text-amber text-sm tracking-[0.1em]">
              1900
            </span>
          </div>
          <div className="relative h-6">
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
            {ticks.map((t, i) => (
              <div key={i} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center" style={{ left: `${t.frac * 100}%` }}>
                <span className="w-px h-3 bg-white/40" />
              </div>
            ))}
            <div ref={needle} className="absolute top-0 bottom-0 w-[2px] bg-ember shadow-[0_0_12px_rgba(224,80,47,0.9)]" style={{ left: 0 }} />
          </div>
        </div>
      </div>

      <section className="relative px-5 md:px-12 py-32 max-w-[1500px] mx-auto grid md:grid-cols-[1.3fr_1fr] gap-12 items-end">
        <div>
          <Reveal>
            <p className="eyebrow mb-6">Epílogo</p>
          </Reveal>
          <SplitTitle text="La dinamita cambió de manos" accentFrom={2} className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight" />
          <Reveal delay={0.15}>
            <p className="mt-8 text-lg text-tin leading-relaxed max-w-2xl">
              “Al principio, la dinamita la tiraban los mineros en contra de la Pío. […] Unos años después, los militares dinamitaban, intervenían la estación. Y eran los mineros los que acudían a defenderla.” — José Ignacio López Vigil, <em>Una mina de coraje</em> (1985).
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.2}>
          <Link to="/museo" className="group flex items-center justify-between gap-6 rounded-3xl bg-amber text-ink p-8 hover:bg-amber-hi transition-colors" data-cursor="ENTRAR">
            <span>
              <span className="block font-mono text-[11px] tracking-[0.3em]">SIGUIENTE · SALA 03</span>
              <span className="block mt-2 font-display text-3xl">Entrar al museo 3D</span>
            </span>
            <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>
      <Footer />
    </div>
  );
}
