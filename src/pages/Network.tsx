import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link2, Maximize2, Minimize2, Radio } from 'lucide-react';
import { BOLIVIA_PATH, MAP_H, MAP_W, NEIGHBOR_PATHS, TITICACA_PATH, project } from '../data/boliviaMap';
import { CITIES, NETWORK, NETWORK_FACTS, type NetStation } from '../data/network';
import { NARRATION } from '../data/narration';
import { Footer } from '../components/layout/Footer';
import { NarrateButton, Reveal, SplitTitle } from '../components/ui/Reveal';
import { sfx } from '../stores/useExperience';
import { audio } from '../lib/audio/engine';

const DISTRICT = new Set(['pio', 'voz', '21dic', 'llallagua']);

type Lbl = { a: 'start' | 'end'; dx: number; dy: number };
const FULL_LABELS: Record<string, Lbl> = {
  pio: { a: 'start', dx: 14, dy: 5 },
  huanuni: { a: 'end', dx: -12, dy: 17 },
  colquiri: { a: 'end', dx: -12, dy: 5 },
  telamayu: { a: 'start', dx: 12, dy: -9 },
  animas: { a: 'end', dx: -12, dy: 16 },
};
const ZOOM_LABELS: Record<string, Lbl> = {
  pio: { a: 'start', dx: 14, dy: 14 },
  voz: { a: 'end', dx: -12, dy: 14 },
  '21dic': { a: 'start', dx: 12, dy: -8 },
  llallagua: { a: 'end', dx: -12, dy: -8 },
  huanuni: { a: 'start', dx: 12, dy: 5 },
};
const CITY_ANCHOR: Record<string, Lbl> = {
  Oruro: { a: 'end', dx: -9, dy: -3 },
};
const CENTER = project(-18.42, -66.6);
const ZOOM_W = 70;
const ZOOM_H = 70 * 0.82;
const FULL: [number, number, number, number] = [0, 0, MAP_W, MAP_H];
const ZOOMED: [number, number, number, number] = [CENTER[0] - ZOOM_W * 0.62, CENTER[1] - ZOOM_H / 2, ZOOM_W, ZOOM_H];

function useAnimatedViewBox(target: [number, number, number, number]) {
  const [vb, setVb] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const from = cur.current;
    const t0 = performance.now();
    let raf = 0;
    const ease = (t: number) => 1 - Math.pow(1 - t, 4);
    const tick = () => {
      const u = Math.min(1, (performance.now() - t0) / 1400);
      const k = ease(u);
      const next = from.map((v, i) => v + (target[i] - v) * k) as [number, number, number, number];
      cur.current = next;
      setVb(next);
      if (u < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return vb;
}

function BoliviaMap({ zoom, chain, selected, onSelect }: { zoom: boolean; chain: boolean; selected: string | null; onSelect: (id: string | null) => void }) {
  const vb = useAnimatedViewBox(zoom ? ZOOMED : FULL);
  const scale = vb[2] / MAP_W; // 1 = vista completa
  const pio = NETWORK[0];
  const [px, py] = project(pio.lat, pio.lon);
  const grid = useMemo(() => {
    const lines: { d: string; label: string; x: number; y: number }[] = [];
    for (let lat = -10; lat >= -22; lat -= 2) {
      const [x0, y] = project(lat, -70.6);
      const [x1] = project(lat, -56.8);
      lines.push({ d: `M${x0} ${y} L${x1} ${y}`, label: `${Math.abs(lat)}°S`, x: x0 + 6, y: y - 4 });
    }
    for (let lon = -70; lon <= -58; lon += 2) {
      const [x, y0] = project(-9, lon);
      const [, y1] = project(-23.6, lon);
      lines.push({ d: `M${x} ${y0} L${x} ${y1}`, label: `${Math.abs(lon)}°O`, x: x + 4, y: y1 - 8 });
    }
    return lines;
  }, []);

  return (
    <svg viewBox={vb.join(' ')} className="w-full h-full" role="img" aria-label="Mapa de las radios mineras de Bolivia">
      <defs>
        <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#221b14" />
          <stop offset="1" stopColor="#15110d" />
        </linearGradient>
      </defs>
      <rect x={-500} y={-500} width={MAP_W + 1000} height={MAP_H + 1000} fill="#0b0907" onClick={() => onSelect(null)} />
      {grid.map((g, i) => (
        <g key={i}>
          <path d={g.d} stroke="rgba(237,229,211,0.05)" strokeWidth={1 * scale} />
          {!zoom && (
            <text x={g.x} y={g.y} fill="rgba(237,229,211,0.25)" fontSize={11} fontFamily="JetBrains Mono Variable, monospace">
              {g.label}
            </text>
          )}
        </g>
      ))}
      {Object.entries(NEIGHBOR_PATHS).map(([k, d]) => (
        <path key={k} d={d} fill="#110e0b" stroke="rgba(237,229,211,0.08)" strokeWidth={1 * scale} />
      ))}
      {/* brillo del contorno con trazos superpuestos (un filtro SVG se recalcularía en cada cuadro) */}
      <path d={BOLIVIA_PATH} fill="none" stroke="rgba(242,165,65,0.08)" strokeWidth={9 * scale} strokeLinejoin="round" />
      <path d={BOLIVIA_PATH} fill="none" stroke="rgba(242,165,65,0.14)" strokeWidth={4.5 * scale} strokeLinejoin="round" />
      <path d={BOLIVIA_PATH} fill="url(#land)" stroke="rgba(242,165,65,0.6)" strokeWidth={1.6 * scale} strokeLinejoin="round" />
      <path d={TITICACA_PATH} fill="#0e1824" stroke="rgba(120,160,210,0.35)" strokeWidth={1 * scale} />

      {/* ondas desde Llallagua */}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={px} cy={py} r={10} fill="none" stroke="rgba(242,165,65,0.45)" strokeWidth={1.2 * scale}>
          <animate attributeName="r" from={4 * scale} to={(chain ? 420 : 160) * scale} dur={chain ? '3.2s' : '4.5s'} begin={`${i * (chain ? 0.8 : 1.1)}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.9" to="0" dur={chain ? '3.2s' : '4.5s'} begin={`${i * (chain ? 0.8 : 1.1)}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* cadena: enlaces */}
      {chain &&
        NETWORK.filter((s) => s.id !== 'pio').map((s, i) => {
          const [x, y] = project(s.lat, s.lon);
          const mx = (px + x) / 2;
          const my = (py + y) / 2 - Math.hypot(x - px, y - py) * 0.25;
          const d = `M${px} ${py} Q${mx} ${my} ${x} ${y}`;
          return (
            <g key={s.id}>
              <path d={d} fill="none" stroke="rgba(242,165,65,0.7)" strokeWidth={1.4 * scale} strokeDasharray={`${6 * scale} ${5 * scale}`}>
                <animate attributeName="stroke-dashoffset" from={60 * scale} to="0" dur="1.2s" repeatCount="indefinite" />
              </path>
              <circle r={3 * scale} fill="#ffc977">
                <animateMotion dur={`${2 + i * 0.3}s`} repeatCount="indefinite" path={d} />
              </circle>
            </g>
          );
        })}

      {/* ciudades */}
      {CITIES.map((c) => {
        const [x, y] = project(c.lat, c.lon);
        const l = CITY_ANCHOR[c.name] ?? { a: 'start', dx: 9, dy: 5 };
        return (
          <g key={c.name} opacity={zoom ? 0.4 : 0.9}>
            <rect x={x - 3 * scale} y={y - 3 * scale} width={6 * scale} height={6 * scale} fill="#bdb4a2" transform={`rotate(45 ${x} ${y})`} />
            <text x={x + l.dx * scale} y={y + l.dy * scale} textAnchor={l.a} fill="#bdb4a2" fontSize={15 * scale} fontFamily="Inter Variable, sans-serif">
              {c.name}
            </text>
          </g>
        );
      })}

      {/* emisoras */}
      {NETWORK.map((s) => {
        if (!zoom && DISTRICT.has(s.id) && s.id !== 'pio') return null;
        const [x, y] = project(s.lat, s.lon);
        const isPio = s.kind === 'pio';
        const sel = selected === s.id;
        const r = (isPio ? 7 : 5) * scale;
        const lb: Lbl = (zoom ? ZOOM_LABELS : FULL_LABELS)[s.id] ?? { a: 'start', dx: 12, dy: -8 };
        return (
          <g
            key={s.id}
            onClick={(e) => {
              e.stopPropagation();
              sfx.click();
              onSelect(s.id);
            }}
            onMouseEnter={() => sfx.tick()}
            style={{ cursor: 'pointer' }}
          >
            <circle cx={x} cy={y} r={r * 3.2} fill="transparent" />
            <circle cx={x} cy={y} r={r * 2.2} fill="none" stroke={isPio ? '#f2a541' : '#ede5d3'} strokeOpacity={0.5} strokeWidth={1 * scale}>
              <animate attributeName="r" values={`${r * 1.2};${r * 2.6};${r * 1.2}`} dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={y} r={sel ? r * 1.35 : r} fill={isPio ? '#f2a541' : '#ede5d3'} stroke="#0b0907" strokeWidth={1.5 * scale} />
            <text
              x={x + lb.dx * scale}
              y={y + lb.dy * scale}
              textAnchor={lb.a}
              fill={isPio ? '#ffc977' : '#ede5d3'}
              fontSize={(isPio ? 18 : 15) * scale}
              fontWeight={isPio || sel ? 700 : 500}
              fontFamily="Inter Variable, sans-serif"
              style={{ paintOrder: 'stroke' }}
              stroke="#0b0907"
              strokeWidth={3 * scale}
            >
              {!zoom && isPio ? 'Siglo XX – Catavi (4 radios)' : s.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Anatomy() {
  const steps = [
    { k: 'Micrófono', d: 'La voz del locutor, del dirigente o de la vecina se convierte en señal eléctrica.' },
    { k: 'Consola', d: 'Se mezclan voces, discos y efectos; se controla el nivel de cada fuente.' },
    { k: 'Transmisor', d: 'Las válvulas de potencia modulan una onda portadora de alta frecuencia.' },
    { k: 'Antena', d: 'La señal se irradia; en onda corta rebota en la ionosfera y cruza el altiplano.' },
    { k: 'Receptor', d: 'En cada casa del campamento, el dial vuelve a convertir la onda en voz.' },
  ];
  return (
    <section className="px-5 md:px-12 py-28 max-w-[1500px] mx-auto">
      <Reveal>
        <p className="eyebrow mb-5">Anatomía de una transmisión</p>
      </Reveal>
      <SplitTitle text="Cómo viajaba la voz de la mina" accentFrom={4} className="font-display text-4xl md:text-6xl leading-[0.98] tracking-tight max-w-4xl" />
      <div className="relative mt-16">
        <svg className="absolute left-0 right-0 top-[38px] w-full h-6 hidden md:block" preserveAspectRatio="none" viewBox="0 0 100 4" aria-hidden>
          <line x1="2" y1="2" x2="98" y2="2" stroke="rgba(242,165,65,0.25)" strokeWidth="0.4" />
          <line x1="2" y1="2" x2="98" y2="2" stroke="#f2a541" strokeWidth="0.6" strokeDasharray="2 3" className="anatomy-flow" />
        </svg>
        <div className="grid md:grid-cols-5 gap-6">
          {steps.map((s, i) => (
            <Reveal key={s.k} delay={i * 0.1}>
              <div className="relative">
                <div className="w-[78px] h-[78px] rounded-full panel flex items-center justify-center font-display text-2xl text-amber relative z-10">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="mt-6 font-display text-2xl">{s.k}</h3>
                <p className="mt-2 text-tin leading-relaxed text-[15px]">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Network() {
  const [zoom, setZoom] = useState(false);
  const [chain, setChain] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const station: NetStation | undefined = NETWORK.find((s) => s.id === selected);

  useEffect(() => {
    const on = () => {
      setChain(true);
      audio.morse('SOS', { gain: 0.03, wpm: 18 });
    };
    window.addEventListener('pio12:chain', on);
    return () => window.removeEventListener('pio12:chain', on);
  }, []);

  const toggleChain = () => {
    const next = !chain;
    setChain(next);
    if (next) {
      sfx.static(0.6, 0.12);
      audio.morse('PIO XII', { gain: 0.03, wpm: 20 });
    }
  };

  return (
    <>
      <header className="relative px-5 md:px-12 pt-36 pb-12 max-w-[1500px] mx-auto">
        <Reveal>
          <p className="eyebrow mb-6">Sala 04 · Red minera</p>
        </Reveal>
        <SplitTitle as="h1" text="La cadena de radios mineras" accentFrom={3} className="font-display text-6xl md:text-8xl leading-[0.9] tracking-tight max-w-5xl" />
        <div className="mt-10 grid md:grid-cols-[1fr_auto] gap-8 items-end">
          <Reveal delay={0.15}>
            <p className="max-w-2xl text-lg text-tin leading-relaxed">
              Desde fines de los años cuarenta, los sindicatos mineros levantaron sus propias emisoras, sostenidas con aportes de los trabajadores. En los golpes de Estado se enlazaban en cadena para que una sola voz cruzara el país. Radio Pío XII, de los oblatos, terminó siendo parte de esa red.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <NarrateButton text={NARRATION.network} id="network-intro" />
          </Reveal>
        </div>
      </header>

      <section className="px-3 md:px-12 pb-10 max-w-[1500px] mx-auto">
        <div className="grid lg:grid-cols-[1.35fr_1fr] gap-4">
          <div className="relative rounded-[2rem] border border-white/10 bg-ink overflow-hidden aspect-[1000/1000] lg:aspect-auto lg:h-[min(86vh,900px)]">
            <BoliviaMap zoom={zoom} chain={chain} selected={selected} onSelect={setSelected} />
            <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  sfx.whoosh();
                  setZoom(!zoom);
                }}
                className="inline-flex items-center gap-2 rounded-full panel px-4 py-2 text-xs font-mono tracking-[0.15em] uppercase hover:text-amber"
              >
                {zoom ? <Minimize2 size={14} /> : <Maximize2 size={14} />} {zoom ? 'Ver Bolivia' : 'Distrito Siglo XX – Catavi'}
              </button>
              <button
                onClick={toggleChain}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono tracking-[0.15em] uppercase transition-colors ${chain ? 'bg-amber text-ink' : 'panel hover:text-amber'}`}
                data-cursor="ENLAZAR"
              >
                <Link2 size={14} /> {chain ? 'Cadena activa' : 'Activar la cadena'}
              </button>
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-4 rounded-full panel px-4 py-2 text-[11px] text-tin">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber" /> Radio Pío XII
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-bone" /> Radio sindical
              </span>
              <span className="hidden sm:flex items-center gap-2">
                <span className="w-2 h-2 rotate-45 bg-tin" /> Ciudad
              </span>
            </div>
            <p className="absolute bottom-4 right-4 text-[10px] text-dust hidden md:block">Mapa: Natural Earth · ubicaciones aproximadas</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="panel rounded-[2rem] p-7 md:p-9 min-h-[300px]">
              <AnimatePresence mode="wait">
                {station ? (
                  <motion.div key={station.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-amber">{station.kind === 'pio' ? 'Emisora católica' : 'Radio sindical minera'}</p>
                    <h2 className="mt-4 font-display text-4xl leading-tight">{station.name}</h2>
                    <p className="mt-2 text-tin">
                      {station.place}
                      {station.year ? ` · desde ${station.year}` : ''}
                    </p>
                    <p className="mt-6 text-bone/90 leading-relaxed">{station.text}</p>
                    <button onClick={() => setSelected(null)} className="mt-6 text-sm text-tin hover:text-amber link-underline">
                      ← Volver a la red
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <Radio className="text-amber" size={26} />
                    <h2 className="mt-5 font-display text-3xl leading-tight">Una red única en el mundo</h2>
                    <p className="mt-4 text-tin leading-relaxed">
                      Toca un punto del mapa para conocer cada emisora. Amplía el distrito Siglo XX – Catavi: en pocos kilómetros convivían cuatro radios. Activa la cadena para ver cómo se enlazaban en los golpes militares.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {NETWORK_FACTS.map((f) => (
                <div key={f.label} className="rounded-[1.5rem] border border-white/10 bg-shaft/60 p-6">
                  <p className="font-display text-4xl text-amber">{f.value}</p>
                  <p className="mt-2 text-sm text-bone/90 leading-snug">{f.label}</p>
                  <p className="mt-2 text-[10px] text-dust leading-snug">{f.source}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 md:px-12 py-24 max-w-[1500px] mx-auto">
        <div className="rounded-[2rem] border border-ember/30 bg-gradient-to-br from-[#2a110b] via-shaft to-ink p-8 md:p-14 grid lg:grid-cols-[1fr_1.1fr] gap-10">
          <div>
            <p className="eyebrow !text-ember mb-5">17 – 24 de julio de 1980</p>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.98] tracking-tight">
              La Cadena de <span className="italic text-amber">la Democracia</span>
            </h2>
          </div>
          <ol className="space-y-6">
            {[
              ['17 de julio, noche', 'Golpe de García Meza. Quince emisoras se enlazan para informar y llamar a la resistencia.'],
              ['Días siguientes', 'Atentados con dinamita contra las antenas. La radio de Colquiri es bombardeada; caen Ánimas y Huanuni.'],
              ['24 de julio, mediodía', 'Última emisión de la Pío XII. Los militares incautan los equipos; el P. Durette ordena no resistir para evitar muertes.'],
              ['4 de julio de 1982', 'La Pío vuelve al aire con un transmisor viejo.'],
            ].map(([t, d]) => (
              <li key={t} className="grid grid-cols-[150px_1fr] gap-5 border-b border-white/10 pb-5">
                <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-amber pt-1">{t}</span>
                <span className="text-bone/90 leading-relaxed">{d}</span>
              </li>
            ))}
            <li className="text-[11px] text-dust">Fuentes: López Vigil (1985); Tórrez Miranda (2009); Herrera Miller (2006).</li>
          </ol>
        </div>
      </section>

      <Anatomy />
      <Footer />
    </>
  );
}
