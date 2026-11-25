/**
 * Señales en vivo de la Red Pío XII alojadas en el servidor Icecast de ALER
 * (Asociación Latinoamericana de Educación y Comunicación Popular).
 * Verificado el 25/11/2026: el servidor envía `Access-Control-Allow-Origin: *`,
 * lo que permite analizar el espectro real con la Web Audio API.
 */
export interface Station {
  id: string;
  name: string;
  city: string;
  stream: string;
  mount: string;
  statusUrl?: string;
  note: string;
}

const STATUS = 'https://aler.org:8445/status-json.xsl';

export const STATIONS: Station[] = [
  {
    id: 'siglo',
    name: 'Radio Pío XII — Siglo XX',
    city: 'Siglo XX · Llallagua, Potosí',
    stream: 'https://aler.org:8445/pio12siglo.mp3',
    mount: 'pio12siglo',
    statusUrl: STATUS,
    note: 'La emisora histórica del distrito minero.',
  },
  {
    id: 'oruro',
    name: 'Radio Pío XII — Oruro',
    city: 'Oruro',
    stream: 'https://aler.org:8445/pio12oruro.mp3',
    mount: 'pio12oruro',
    statusUrl: STATUS,
    note: 'Filial de la red en la ciudad de Oruro.',
  },
  {
    id: 'cbba',
    name: 'Radio Pío XII — Cochabamba',
    city: 'Cochabamba',
    stream: 'https://aler.org:8445/pio12cbba.mp3',
    mount: 'pio12cbba',
    statusUrl: STATUS,
    note: 'Filial de la red en la ciudad de Cochabamba.',
  },
];
