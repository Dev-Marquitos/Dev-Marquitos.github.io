import { Footer } from '../components/layout/Footer';
import { NarrateButton, Reveal, SplitTitle } from '../components/ui/Reveal';
import { PowerOffButton } from '../components/experience/Outro';
import { siteUrl, useQr } from '../lib/qr';
import { PROJECT } from '../data/credits';
import { REFERENCES, ASSET_CREDITS } from '../data/references';
import { IMAGE_LIST } from '../data/images';
import { NARRATION } from '../data/narration';

const STACK: [string, string, string][] = [
  ['Interfaz', 'React 19 · TypeScript 6', 'Componentes, rutas perezosas y tipado estricto'],
  ['Compilación', 'Vite 8 (Rolldown)', 'Empaquetado por salas y carga diferida del 3D'],
  ['Gráficos 3D', 'Three.js r185 · React Three Fiber 9 · Drei 10', 'WebGL 2, sombras, reflejos, controles de cámara'],
  ['Postproceso', 'postprocessing 6', 'Bloom, aberración cromática, viñeta, grano y ACES'],
  ['Animación', 'GSAP 3 + ScrollTrigger · Lenis · Framer Motion', 'Narrativa guiada por el scroll y transiciones'],
  ['Audio', 'Web Audio API', 'Música generativa, efectos de radio y análisis FFT del stream'],
  ['Voz', 'Web Speech API', 'Narrador con voces neuronales y subtítulos'],
  ['Estado', 'Zustand 5', 'Preferencias persistentes, radio, museo y recorrido'],
  ['Estilos', 'Tailwind CSS 4', 'Sistema de diseño con tokens 60 · 30 · 10'],
];

const LAYERS = [
  { name: 'Experiencia', items: ['Intro de encendido', 'Recorrido guiado', 'Despedida y créditos'] },
  { name: 'Salas (React)', items: ['Inicio', 'Historia', 'Museo 3D', 'Red minera', 'Voces', 'Archivo', 'En vivo', 'Créditos'] },
  { name: 'Motores', items: ['Escenas WebGL (R3F)', 'Calidad gráfica adaptativa', 'Motor de audio (Web Audio)', 'Narrador (Web Speech)', 'Asistente BM25'] },
  { name: 'Datos', items: ['Línea de tiempo verificada', 'Piezas y fichas', 'Red de radios (Natural Earth)', 'Imágenes con licencia'] },
  { name: 'Red', items: ['GitHub Pages (estático)', 'Icecast de ALER (MP3 96 kbps, CORS)'] },
];

const CYCLES = [
  ['1 – 6', 'Prototipos iniciales', 'Estructura, primeros modelos, texturas, cámara, multimedia y señal en vivo (versión 1).'],
  ['7', 'Rediseño integral', 'Nuevo sistema visual 60 · 30 · 10, tipografía y navegación por salas.'],
  ['8', 'Escenas y modelos', 'Siete piezas procedurales, sala con reflejos, escena narrativa guiada por scroll.'],
  ['9', 'Sonido y voz', 'Motor de audio procedural, narrador, subtítulos y análisis del stream real.'],
  ['10', 'Contenido y rendimiento', 'Fuentes verificadas, mapa, voces, archivo, asistente y calidad gráfica adaptativa (de 2 a 60 FPS en una GPU de gama baja).'],
];

export default function Credits() {
  const qr = useQr(siteUrl());
  return (
    <>
      <header className="relative px-5 md:px-12 pt-36 pb-16 max-w-[1500px] mx-auto">
        <Reveal>
          <p className="eyebrow mb-6">Sala 08 · Créditos</p>
        </Reveal>
        <SplitTitle as="h1" text="Proyecto y créditos" accentFrom={2} className="font-display text-7xl md:text-[8.5vw] leading-[0.88] tracking-tight" />
      </header>

      <section className="px-5 md:px-12 pb-20 max-w-[1500px] mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <Reveal>
          <div className="h-full rounded-[2rem] border border-white/10 bg-shaft/60 p-8 md:p-12">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-amber">Ficha del proyecto</p>
            <h2 className="mt-5 font-display text-4xl md:text-5xl leading-tight">{PROJECT.title}</h2>
            <dl className="mt-10 grid sm:grid-cols-2 gap-x-10 gap-y-6">
              {[
                ['Investigación y desarrollo', PROJECT.author],
                ['Docente guía', PROJECT.advisor],
                ['Institución', PROJECT.university],
                ['Carrera', PROJECT.area],
                ['Asignatura', PROJECT.course],
                ['Versión', PROJECT.version],
              ].map(([k, v]) => (
                <div key={k} className="border-t border-white/10 pt-3">
                  <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-dust">{k}</dt>
                  <dd className="mt-1.5 text-lg">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-10 flex flex-wrap gap-3">
              <NarrateButton text={NARRATION.credits} id="credits-intro" />
              <PowerOffButton className="rounded-full border border-white/15 px-5 py-2 font-mono text-[11px] tracking-[0.18em] uppercase text-tin hover:text-ember hover:border-ember/50 transition-colors" />
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="h-full rounded-[2rem] bg-bone text-ink p-8 md:p-10 flex flex-col items-center justify-center text-center">
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase">Escanea y lleva el museo</p>
            {qr && <img src={qr} alt="Código QR del sitio" className="mt-6 w-56 h-56" />}
            <p className="mt-6 font-mono text-[11px] break-all opacity-70">{siteUrl()}</p>
          </div>
        </Reveal>
      </section>

      {/* Arquitectura */}
      <section className="px-5 md:px-12 py-20 max-w-[1500px] mx-auto">
        <p className="eyebrow mb-5">Cómo se hizo</p>
        <SplitTitle text="Arquitectura del museo" accentFrom={2} className="font-display text-4xl md:text-6xl leading-tight" />
        <div className="mt-12 space-y-3">
          {LAYERS.map((l, i) => (
            <Reveal key={l.name} delay={i * 0.06}>
              <div className="grid md:grid-cols-[200px_1fr] gap-3 items-stretch">
                <div className="rounded-2xl bg-amber text-ink px-5 py-4 font-mono text-xs tracking-[0.2em] uppercase flex items-center">{l.name}</div>
                <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-shaft/50 p-3">
                  {l.items.map((it) => (
                    <span key={it} className="rounded-xl border border-white/10 bg-ink/60 px-4 py-2.5 text-sm text-bone/90">
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Paleta */}
      <section className="px-5 md:px-12 py-20 max-w-[1500px] mx-auto grid lg:grid-cols-2 gap-12">
        <div>
          <p className="eyebrow mb-5">Sistema visual</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight">
            Regla <span className="italic text-amber">60 · 30 · 10</span>
          </h2>
          <p className="mt-6 text-tin leading-relaxed">
            El 60 % de la superficie es carbón de socavón (fondos), el 30 % es estaño y papel de archivo (texto, líneas y superficies claras) y el 10 % es el ámbar de las válvulas encendidas, reservado para lo que se puede tocar. El rojo brasa marca solo la represión y la señal en vivo; el verde, solo el estado “al aire”.
          </p>
          <div className="mt-8 flex h-24 rounded-2xl overflow-hidden border border-white/10">
            <div className="w-[60%] bg-ink flex items-end p-3 font-mono text-[10px] text-tin">60 % · #0B0907</div>
            <div className="w-[30%] bg-bone flex items-end p-3 font-mono text-[10px] text-ink">30 % · #EDE5D3</div>
            <div className="w-[10%] bg-amber flex items-end p-2 font-mono text-[9px] text-ink">10 %</div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[
              ['#18140F', 'Galería'],
              ['#BDB4A2', 'Estaño'],
              ['#E0502F', 'Brasa'],
              ['#7BE07B', 'Al aire'],
            ].map(([c, n]) => (
              <div key={c} className="rounded-xl border border-white/10 overflow-hidden">
                <div className="h-10" style={{ background: c }} />
                <p className="px-2 py-1.5 font-mono text-[9.5px] text-tin">
                  {n} · {c}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-shaft/50 p-8 md:p-10 space-y-8">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-dust">Títulos · Fraunces</p>
            <p className="mt-2 font-display text-6xl leading-none">
              La voz <span className="italic text-amber">de la mina</span>
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-dust">Texto · Inter</p>
            <p className="mt-2 text-lg text-tin leading-relaxed">Una radio que nació para evangelizar y terminó siendo, por decisión de su pueblo, una mina de coraje.</p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-dust">Datos · JetBrains Mono</p>
            <p className="mt-2 font-mono text-sm tracking-[0.2em] text-amber">SALA 07 · 96 KBPS · 5.950 Mc</p>
          </div>
        </div>
      </section>

      {/* Stack y metodología */}
      <section className="px-5 md:px-12 py-20 max-w-[1500px] mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-12">
        <div>
          <p className="eyebrow mb-5">Tecnologías</p>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {STACK.map(([k, v, d]) => (
              <div key={k} className="grid sm:grid-cols-[150px_1fr] gap-2 py-4">
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-dust pt-1">{k}</span>
                <span>
                  <span className="block text-bone">{v}</span>
                  <span className="block text-sm text-tin">{d}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-5">Metodología · prototipado iterativo</p>
          <ol className="space-y-3">
            {CYCLES.map(([n, t, d]) => (
              <li key={n} className="grid grid-cols-[70px_1fr] gap-4 rounded-2xl border border-white/10 p-5">
                <span className="font-display text-2xl text-amber">{n}</span>
                <span>
                  <span className="block font-display text-xl">{t}</span>
                  <span className="block text-sm text-tin mt-1">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Fuentes y licencias */}
      <section className="px-5 md:px-12 py-20 max-w-[1500px] mx-auto grid lg:grid-cols-2 gap-12">
        <div>
          <p className="eyebrow mb-5">Fuentes consultadas (APA 7)</p>
          <ul className="space-y-3 text-sm text-tin leading-relaxed">
            {REFERENCES.map((r) => (
              <li key={r} className="pl-6 -indent-6">
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-5">Recursos y licencias</p>
          <ul className="divide-y divide-white/10 border-y border-white/10 text-sm">
            {ASSET_CREDITS.map((a) => (
              <li key={a.what} className="py-3 grid grid-cols-[1fr_auto] gap-4">
                <span>
                  <span className="block text-bone">{a.what}</span>
                  <span className="block text-tin text-[13px]">{a.who}</span>
                </span>
                <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-amber self-center text-right">{a.license}</span>
              </li>
            ))}
            {IMAGE_LIST.map((im) => (
              <li key={im.src} className="py-3 grid grid-cols-[1fr_auto] gap-4">
                <a href={im.page} target="_blank" rel="noreferrer" className="hover:text-amber">
                  <span className="block text-bone">{im.caption}</span>
                  <span className="block text-tin text-[13px]">{im.credit} · Wikimedia Commons</span>
                </a>
                <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-amber self-center text-right">{im.license}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Footer />
    </>
  );
}
