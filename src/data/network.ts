/**
 * Radios mineras y emisoras vinculadas (ubicaciones aproximadas).
 * Fuentes: Herrera Miller (2006), López Vigil (1985), Aguirre Alvis (2022).
 */
export interface NetStation {
  id: string;
  name: string;
  place: string;
  lat: number;
  lon: number;
  year?: string;
  kind: 'pio' | 'sindical';
  text: string;
}

export const NETWORK: NetStation[] = [
  {
    id: 'pio',
    name: 'Radio Pío XII',
    place: 'Siglo XX · Llallagua',
    lat: -18.425,
    lon: -66.585,
    year: '1959',
    kind: 'pio',
    text: 'Emisora católica de los oblatos, inaugurada el 1 de mayo de 1959. Pasó de enfrentar a los sindicatos a convertirse en una de las voces más firmes del distrito.',
  },
  {
    id: 'voz',
    name: 'La Voz del Minero',
    place: 'Siglo XX',
    lat: -18.44,
    lon: -66.63,
    year: 'c. 1947',
    kind: 'sindical',
    text: 'La emisora del sindicato de Siglo XX, considerada pionera de las radios mineras. Fue asaltada en 1975 junto a otras radios del distrito.',
  },
  {
    id: '21dic',
    name: 'Radio 21 de Diciembre',
    place: 'Catavi',
    lat: -18.395,
    lon: -66.555,
    year: '1956',
    kind: 'sindical',
    text: 'La radio de los trabajadores de Catavi. Su nombre recuerda la masacre del 21 de diciembre de 1942.',
  },
  {
    id: 'llallagua',
    name: 'Radio Llallagua',
    place: 'Llallagua',
    lat: -18.41,
    lon: -66.6,
    kind: 'sindical',
    text: 'Una de las cuatro emisoras atacadas en el operativo paramilitar del 13 de enero de 1975.',
  },
  {
    id: 'huanuni',
    name: 'Radio Nacional de Huanuni',
    place: 'Huanuni, Oruro',
    lat: -18.289,
    lon: -66.838,
    year: '1959',
    kind: 'sindical',
    text: 'Emisora del sindicato de Huanuni. En 1980 fue una de las últimas en caer durante el golpe de García Meza.',
  },
  {
    id: 'colquiri',
    name: 'Radio Vanguardia de Colquiri',
    place: 'Colquiri, La Paz',
    lat: -17.391,
    lon: -67.127,
    year: '1964',
    kind: 'sindical',
    text: 'Inaugurada oficialmente en 1964. En julio de 1980 fue bombardeada durante el golpe militar.',
  },
  {
    id: 'telamayu',
    name: 'Radio Telamayu',
    place: 'Telamayu, Potosí',
    lat: -20.93,
    lon: -66.23,
    year: '1957',
    kind: 'sindical',
    text: 'Radio minera del sur de Potosí, en la zona de Atocha y Quechisla.',
  },
  {
    id: 'animas',
    name: 'Radio de Ánimas',
    place: 'Ánimas, Potosí',
    lat: -21.0,
    lon: -66.37,
    kind: 'sindical',
    text: 'Emisora minera del sur potosino que cayó durante el golpe de julio de 1980.',
  },
];

export const CITIES = [
  { name: 'La Paz', lat: -16.4955, lon: -68.1336 },
  { name: 'Oruro', lat: -17.9694, lon: -67.115 },
  { name: 'Cochabamba', lat: -17.3895, lon: -66.1568 },
  { name: 'Potosí', lat: -19.5836, lon: -65.7531 },
  { name: 'Sucre', lat: -19.0333, lon: -65.2627 },
  { name: 'Santa Cruz', lat: -17.7833, lon: -63.1821 },
  { name: 'Trinidad', lat: -14.8333, lon: -64.9 },
];

export const NETWORK_FACTS = [
  { value: '20', label: 'radios mineras en 1956', source: 'López Vigil (1985)' },
  { value: '23', label: 'emisoras en 1963', source: 'Gumucio Dagron, citado por Herrera Miller (2006)' },
  { value: '15', label: 'emisoras en la Cadena de la Democracia (1980)', source: 'López Vigil (1985); Tórrez (2009)' },
  { value: '2 000 W', label: 'potencia de la Pío frente a 300–500 W de las sindicales', source: 'Entrevista a J. Mansilla en López Vigil (1985)' },
];
