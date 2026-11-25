/**
 * Asistente del museo: recuperación de información con BM25 sobre la base de
 * conocimiento verificada del sitio (sin servicios externos ni claves de API).
 */
import { ALL_EVENTS } from '../data/timeline';
import { MUSEUM_PIECES } from '../data/museum';
import { PEOPLE } from '../data/people';
import { NETWORK } from '../data/network';

export interface KBEntry {
  id: string;
  title: string;
  answer: string;
  link?: { path: string; label: string };
  keys?: string;
  /** texto que lee el narrador (sin citas de fuentes) */
  speech?: string;
}

const STOP = new Set(
  'a al algo algun alguna como con contra cual cuales cuando de del desde donde e el ella ellas ellos en entre era eran es esa ese eso esta este esto fue fueron ha han hay la las le les lo los mas me mi mis muy ni no nos o os para pero por porque que quien quienes se sea ser si sin sobre son su sus tambien te tiene tu un una uno unos unas y ya yo dime cuentame sabes puedes hablame explicame quiero saber informacion acerca paso ocurrio'.split(
    ' ',
  ),
);

const SYN: [RegExp, string][] = [
  [/^(fund\w*|inaugur\w*|naci\w*|creo|creada|creacion|empez\w*|origen\w*|comenz\w*)$/, 'fundacion'],
  [/^(masacr\w*|matanz\w*|asesin\w*|muert\w*|victim\w*)$/, 'masacre'],
  [/^(emisor\w*|radi\w*|estacion\w*)$/, 'radio'],
  [/^(mujer\w*|amas|esposas|señoras|senoras)$/, 'mujeres'],
  [/^(huelg\w*|ayun\w*)$/, 'huelga'],
  [/^(golp\w*|dictadur\w*|militar\w*|ejercit\w*|tropas|soldad\w*)$/, 'golpe'],
  [/^(escuch\w*|oir|vivo|senal|señal|stream\w*|online|internet|frecuenci\w*|dial|fm|am)$/, 'vivo'],
  [/^(mina|minas|miner\w*|socavon\w*|estaño|estano)$/, 'mina'],
  [/^(cura|curas|padre|padres|sacerdot\w*|oblat\w*|iglesia|catolic\w*)$/, 'oblatos'],
  [/^(sindicat\w*|dirigent\w*|obrer\w*|trabajador\w*)$/, 'sindicato'],
  [/^(cadena|enlaz\w*|red)$/, 'cadena'],
  [/^(objeto\w*|pieza\w*|museo|sala\w*|3d)$/, 'museo'],
  [/^(casco|guardatojo|lampara|carburo)$/, 'guardatojo'],
  [/^(microfon\w*|locutor\w*|cabina)$/, 'microfono'],
  [/^(transmisor\w*|antena\w*|potencia|vatios)$/, 'transmisor'],
  [/^(disco\w*|tocadisc\w*|musica|huayno\w*|cueca\w*)$/, 'musica'],
  [/^(dinamit\w*|explosiv\w*|cartuch\w*)$/, 'dinamita'],
  [/^(carro|vagonet\w*|casiterit\w*|mineral)$/, 'carro'],
  [/^(relocaliz\w*|21060|decreto|despid\w*)$/, 'relocalizacion'],
  [/^(marcha\w*|calamarca)$/, 'marcha'],
  [/^(hoy|actual\w*|ahora|todavia|sigue)$/, 'hoy'],
  [/^(queda|ubica\w*|localiza\w*|lugar|situad\w*)$/, 'ubicacion'],
  [/^(quien\w*|autor\w*|hizo|desarroll\w*|credito\w*|universidad|proyecto)$/, 'creditos'],
];

export function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w))
    .map((w) => {
      for (const [re, rep] of SYN) if (re.test(w)) return rep;
      if (w.length > 5 && w.endsWith('es')) return w.slice(0, -2);
      if (w.length > 4 && w.endsWith('s')) return w.slice(0, -1);
      return w;
    });
}

const EXTRA: KBEntry[] = [
  {
    id: 'fundacion',
    title: '¿Cuándo y quién fundó Radio Pío XII?',
    answer:
      'Emisoras Pío XII se inauguró el 1 de mayo de 1959 en el campamento Siglo XX (Llallagua, Potosí). La fundó el padre oblato canadiense Lino Grenier, con el lema “decir la verdad y hacer el bien”. Fuente: López Vigil (1985).',
    link: { path: '/historia', label: 'Ver la línea de tiempo' },
    keys: 'fundacion fundador cuando año 1959 grenier inauguracion origen',
  },
  {
    id: 'proposito',
    title: '¿Para qué se creó la radio?',
    answer:
      'Nació para evangelizar, alfabetizar y combatir el alcoholismo, pero también con una línea anticomunista que la enfrentó a la emisora sindical La Voz del Minero. Con los años, y sobre todo desde 1964–1965, se puso del lado de los mineros.',
    link: { path: '/historia', label: 'Leer el cambio de línea' },
    keys: 'objetivo proposito anticomunista alfabetizacion evangelizar cambio giro linea',
  },
  {
    id: 'nombre',
    title: '¿Por qué se llama Pío XII?',
    answer:
      'Lleva el nombre del Papa Pío XII. En la inauguración, Lino Grenier explicó que el fin de la radio era, con palabras de ese Papa, “decir la verdad y hacer el bien en este campamento”.',
    keys: 'nombre llama pio xii papa',
  },
  {
    id: 'vivo',
    title: '¿Cómo la escucho en vivo?',
    answer:
      'Entra a la sala En vivo y enciende el receptor: el museo reproduce la señal real de Radio Pío XII de Siglo XX desde el servidor de streaming de ALER, con espectro de frecuencias real. También están las filiales de Oruro y Cochabamba.',
    link: { path: '/en-vivo', label: 'Ir a la señal en vivo' },
    keys: 'vivo escuchar señal stream frecuencia online hoy',
  },
  {
    id: 'hoy',
    title: '¿Sigue funcionando hoy?',
    answer:
      'Sí. Con más de 65 años, la Red Pío XII transmite desde Siglo XX, Oruro y Cochabamba, en castellano y quechua, y por internet. Celebró 60 años en 2019 y 65 en 2024.',
    link: { path: '/en-vivo', label: 'Escuchar ahora' },
    keys: 'hoy actual sigue funcionando red oruro cochabamba aniversario',
  },
  {
    id: 'radiosmineras',
    title: '¿Qué eran las radios mineras?',
    answer:
      'Eran emisoras de los sindicatos mineros, sostenidas con aportes de los trabajadores. La pionera fue La Voz del Minero de Siglo XX (las fuentes citan 1947). Se registraron unas 20 en 1956 y 23 en 1963; en los golpes se enlazaban en cadena.',
    link: { path: '/red-minera', label: 'Ver el mapa de la red' },
    keys: 'radios mineras sindicales red voz minero cuantas',
  },
  {
    id: 'cadena',
    title: '¿Qué fue la Cadena de la Democracia?',
    answer:
      'La noche del golpe de García Meza, el 17 de julio de 1980, quince emisoras se enlazaron para informar y resistir. Dinamitaron antenas y bombardearon la radio de Colquiri. La Pío XII emitió por última vez el 24 de julio al mediodía y volvió recién el 4 de julio de 1982.',
    link: { path: '/red-minera', label: 'Ver la cadena en el mapa' },
    keys: 'cadena democracia 1980 garcia meza golpe silencio',
  },
  {
    id: 'huelga',
    title: '¿Qué fue la huelga de hambre de 1977?',
    answer:
      'El 28 de diciembre de 1977, cuatro esposas de mineros de Siglo XX y catorce niños iniciaron una huelga de hambre en el Arzobispado de La Paz; se había decidido en el salón de la Pío. Se sumaron Domitila Barrios de Chungara y más de mil personas, y a los 23 días la dictadura concedió la amnistía.',
    link: { path: '/voces', label: 'Ir a la sala Voces' },
    keys: 'huelga hambre mujeres 1977 1978 domitila amnistia banzer',
  },
  {
    id: 'sanjuan',
    title: '¿Qué pasó en la masacre de San Juan?',
    answer:
      'En la madrugada del 24 de junio de 1967 el ejército atacó el campamento durante las fogatas de San Juan. Cortaron la luz para silenciar las radios, pero la Pío volvió al aire con una planta de emergencia, denunció la masacre y pidió sangre para los heridos. Las cifras de muertos van de 20 a 27.',
    link: { path: '/historia', label: 'Ver en la línea de tiempo' },
    keys: 'san juan 1967 masacre barrientos fogatas',
  },
  {
    id: 'museo',
    title: '¿Qué objetos hay en el museo 3D?',
    answer:
      'La sala de objetos tiene siete piezas reconstruidas por código: receptor de válvulas, transmisor de onda corta, micrófono de estudio, tocadiscos, guardatojo con lámpara de carburo, carro minero con mineral de estaño y cartuchos de dinamita.',
    link: { path: '/museo', label: 'Entrar al museo 3D' },
    keys: 'museo objetos piezas 3d sala modelos',
  },
  {
    id: 'creditos',
    title: '¿Quién hizo este museo virtual?',
    answer:
      'Lo desarrolló Marco Antonio Calizaya Laura, con la guía del docente Juan Pablo Luna Felipez, Ph.D., en la Carrera de Ingeniería Informática de la Universidad Nacional “Siglo XX” (Llallagua, Potosí).',
    link: { path: '/creditos', label: 'Ver créditos' },
    keys: 'creditos autor quien hizo desarrollo universidad proyecto',
  },
  {
    id: 'tecnologia',
    title: '¿Con qué tecnología está hecho?',
    answer:
      'Con React 19 y TypeScript, Three.js mediante React Three Fiber (WebGL 2) para el 3D, GSAP y Lenis para las animaciones de scroll, la Web Audio API para la música procedural y el análisis del audio en vivo, y la Web Speech API para el narrador. Este asistente usa búsqueda BM25 local.',
    link: { path: '/creditos', label: 'Cómo se hizo' },
    keys: 'tecnologia three react webgl programacion grafica como hecho audio voz',
  },
  {
    id: 'ubicacion',
    title: '¿Dónde está Siglo XX?',
    answer:
      'Siglo XX es un campamento minero contiguo a Llallagua, en el norte del departamento de Potosí, Bolivia, a unos 3 900 metros de altura. Junto a Catavi formó uno de los mayores distritos de estaño del mundo.',
    link: { path: '/red-minera', label: 'Ver en el mapa' },
    keys: 'donde ubicacion llallagua potosi altura catavi',
  },
  {
    id: 'idiomas',
    title: '¿En qué idiomas transmite?',
    answer: 'En castellano y en quechua, la lengua de buena parte de las comunidades del norte de Potosí. Programas como “Ríase en quechua” forman parte de su historia.',
    keys: 'idioma quechua castellano lengua',
  },
];

function build(): KBEntry[] {
  const out: KBEntry[] = [...EXTRA];
  ALL_EVENTS.forEach((e, i) =>
    out.push({
      id: 'ev' + i,
      title: `${e.year} · ${e.title}`,
      answer: `${e.date ?? e.year}: ${e.text} (Fuente: ${e.source})`,
      speech: `${e.date ?? e.year}: ${e.text}`,
      link: { path: '/historia', label: 'Ver en la línea de tiempo' },
      keys: e.era,
    }),
  );
  MUSEUM_PIECES.forEach((p) =>
    out.push({ id: 'pz' + p.id, title: p.title, answer: `${p.short} ${p.context}`, link: { path: '/museo', label: 'Ver la pieza en 3D' }, keys: p.facts.map((f) => f.join(' ')).join(' ') }),
  );
  PEOPLE.forEach((p) =>
    out.push({ id: 'pp' + p.id, title: p.name, answer: `${p.name} (${p.life}), ${p.role.charAt(0).toLowerCase()}${p.role.slice(1)}. ${p.bio}`, link: { path: '/voces', label: 'Ir a Voces' } }),
  );
  NETWORK.forEach((s) => out.push({ id: 'nt' + s.id, title: s.name, answer: `${s.name} (${s.place}${s.year ? ', ' + s.year : ''}): ${s.text}`, link: { path: '/red-minera', label: 'Ver en el mapa' } }));
  return out;
}

const KB = build();

/** Respuestas del asistente (se graban como audio). */
export const KB_ANSWERS = KB.map((e) => e.speech ?? e.answer);
const DOCS = KB.map((e) => {
  const tokens = normalize(`${e.title} ${e.title} ${e.keys ?? ''} ${e.keys ?? ''} ${e.answer}`);
  const tf = new Map<string, number>();
  tokens.forEach((t) => tf.set(t, (tf.get(t) ?? 0) + 1));
  return { e, tf, len: tokens.length };
});
const AVG = DOCS.reduce((s, d) => s + d.len, 0) / DOCS.length;
const DF = new Map<string, number>();
DOCS.forEach((d) => d.tf.forEach((_, t) => DF.set(t, (DF.get(t) ?? 0) + 1)));

export function ask(question: string): { entry: KBEntry; score: number; alternatives: KBEntry[] } | null {
  const q = normalize(question);
  if (!q.length) return null;
  const k1 = 1.4, b = 0.72, N = DOCS.length;
  const scored = DOCS.map((d) => {
    let s = 0;
    for (const t of q) {
      const f = d.tf.get(t);
      if (!f) continue;
      const df = DF.get(t) ?? 0;
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      s += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.len) / AVG)));
    }
    // año exacto en la pregunta
    const year = question.match(/\b(19\d\d|20\d\d)\b/)?.[1];
    if (year && (d.e.title.includes(year) || d.e.answer.includes(year))) s += 2.5;
    return { d, s };
  }).sort((a, z) => z.s - a.s);
  if (!scored[0] || scored[0].s < 1.2) return null;
  return { entry: scored[0].d.e, score: scored[0].s, alternatives: scored.slice(1, 4).filter((x) => x.s > scored[0].s * 0.55).map((x) => x.d.e) };
}

export const SUGGESTIONS = [
  '¿Cuándo se fundó la radio?',
  '¿Qué pasó en la masacre de San Juan?',
  '¿Quién fue Domitila?',
  '¿Qué fue la Cadena de la Democracia?',
  '¿Cómo la escucho en vivo?',
  '¿Quién hizo este museo?',
];
