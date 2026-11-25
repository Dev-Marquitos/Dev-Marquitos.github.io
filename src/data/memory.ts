/**
 * “Frecuencia memoria”: boletines narrados (recreaciones) basados en hechos
 * documentados en López Vigil (1985) y Tórrez Miranda (2009). Las frases entre
 * comillas son citas literales.
 */
export interface MemoryStation {
  id: string;
  pos: number;
  year: string;
  date: string;
  title: string;
  text: string;
}

export const MEMORY: MemoryStation[] = [
  {
    id: '1959',
    pos: 0.08,
    year: '1959',
    date: '1 de mayo de 1959',
    title: 'Nace una voz',
    text: 'Boletín de la memoria. Primero de mayo de 1959. En el campamento Siglo XX, el padre oblato Lino Grenier inaugura Emisoras Pío XII. Su lema, tomado del Papa: “decir la verdad y hacer el bien”. Con unos dos mil vatios, su transmisor supera con creces a las radios sindicales del distrito.',
  },
  {
    id: '1967',
    pos: 0.25,
    year: '1967',
    date: '24 de junio de 1967',
    title: 'Noche de San Juan',
    text: 'Boletín de la memoria. Madrugada del 24 de junio de 1967. El ejército entra al campamento mientras arden las fogatas de San Juan. Han cortado la luz para silenciar las radios, pero la Pío vuelve al aire con su planta de emergencia. Denuncia la masacre y pide sangre para los heridos.',
  },
  {
    id: '1978',
    pos: 0.42,
    year: '1978',
    date: '16 de enero de 1978',
    title: 'La radio es de su pueblo',
    text: 'Boletín de la memoria. Enero de 1978. Cuatro mujeres de Siglo XX y sus hijos sostienen una huelga de hambre en La Paz, y ya son más de mil los huelguistas. Los dirigentes mineros toman los micrófonos de la Pío: “Nosotros, oigan bien, nosotros y no los padres ni nadie hemos ordenado que la Pío XII siga transmitiendo.” Días después, la dictadura concede la amnistía.',
  },
  {
    id: '1980',
    pos: 0.6,
    year: '1980',
    date: '24 de julio de 1980',
    title: 'Antes del silencio',
    text: 'Boletín de la memoria. Julio de 1980. Golpe de García Meza. Quince emisoras se enlazan en la Cadena de la Democracia. Han dinamitado antenas y la radio de Colquiri fue bombardeada. Este jueves, al mediodía, la Pío XII sale por última vez al aire. Después vendrán dos años de silencio.',
  },
  {
    id: '1986',
    pos: 0.77,
    year: '1986',
    date: 'Agosto de 1986',
    title: 'Marcha por la Vida',
    text: 'Boletín de la memoria. Agosto de 1986. Miles de mineros marchan de Oruro hacia La Paz contra el cierre de las minas. La Pío XII transmite la marcha completa. En Calamarca, el estado de sitio detiene a los marchistas, y también al personal de la radio.',
  },
  {
    id: 'hoy',
    pos: 0.93,
    year: 'Hoy',
    date: 'En vivo',
    title: 'La señal continúa',
    text: 'Boletín de la memoria. Más de sesenta y cinco años después, la Red Pío XII sigue al aire desde Siglo XX, Oruro y Cochabamba, en castellano y en quechua. Y su señal llega en vivo a este museo virtual.',
  },
];
