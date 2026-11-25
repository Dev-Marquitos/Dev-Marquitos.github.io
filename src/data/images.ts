/**
 * Fotografías con licencia libre (Wikimedia Commons), alojadas en /public/images.
 * Las imágenes se redimensionaron y recodificaron en JPG; en pantalla se aplica
 * un filtro de color. Las obras CC BY-SA conservan su licencia.
 */
const BASE = import.meta.env.BASE_URL;
const C = 'https://commons.wikimedia.org/wiki/File:';

export interface ArchiveImage {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  license: string;
  page: string;
  w: number;
  h: number;
  tag: 'Distrito minero' | 'Interior mina' | 'Altiplano' | 'Personas' | 'Radio';
}

const img = (file: string, data: Omit<ArchiveImage, 'src'>): ArchiveImage => ({ src: `${BASE}images/${file}`, ...data });

export const IMAGES = {
  cataviOverview: img('cataviOverview.jpg', {
    alt: 'Vista general del complejo minero de Catavi con colas de mineral',
    caption: 'Complejo minero de Catavi, vista general (2025)',
    credit: 'HighVoltage 5576',
    license: 'CC BY-SA 4.0',
    page: C + 'Mina_Catavi_overview.jpg',
    w: 1280, h: 960, tag: 'Distrito minero',
  }),
  sigloEntrance: img('sigloEntrance.jpg', {
    alt: 'Entrada de la mina Siglo XX',
    caption: 'Entrada de la mina Siglo XX (2025)',
    credit: 'HighVoltage 5576',
    license: 'CC BY-SA 4.0',
    page: C + 'Mina_Siglo_XX_entrance.jpg',
    w: 1280, h: 960, tag: 'Distrito minero',
  }),
  sigloBuildings: img('sigloBuildings.jpg', {
    alt: 'Edificios en ruinas de la mina Siglo XX',
    caption: 'Edificios de la mina Siglo XX (2025)',
    credit: 'HighVoltage 5576',
    license: 'CC BY-SA 4.0',
    page: C + 'Mina_Siglo_XX_buildings.jpg',
    w: 1280, h: 960, tag: 'Distrito minero',
  }),
  llallaguaDawn: img('llallaguaDawn.jpg', {
    alt: 'Llallagua al amanecer con las luces del pueblo',
    caption: 'Luz del alba en Llallagua, hacia Catavi (2023)',
    credit: 'Celina Ramos Aiza',
    license: 'CC BY-SA 4.0',
    page: C + 'Luz_del_alba_de_llallagua.jpg',
    w: 1280, h: 963, tag: 'Distrito minero',
  }),
  siglo1940: img('siglo1940.jpg', {
    alt: 'Fotografía histórica en blanco y negro de la mina Siglo XX',
    caption: 'Mina Siglo XX, fotografía histórica (1940 – 1946)',
    credit: 'Office of War Information (EE. UU.)',
    license: 'Dominio público',
    page: C + 'Siglo_XX.jpg',
    w: 845, h: 616, tag: 'Distrito minero',
  }),
  catavi1930: img('catavi1930.jpg', {
    alt: 'Grupo de mineros de Catavi en 1930',
    caption: 'Mineros de Catavi, 1930 (revista Plus Ultra)',
    credit: 'Revista Plus Ultra',
    license: 'Dominio público',
    page: C + 'Mineros_de_Catavi,_1930.png',
    w: 564, h: 766, tag: 'Personas',
  }),
  teatroPatino: img('teatroPatino.jpg', {
    alt: 'Fachada del teatro Simón I. Patiño en Catavi',
    caption: 'Teatro Simón I. Patiño, Catavi (2021)',
    credit: 'Carlillasa',
    license: 'CC BY-SA 4.0',
    page: C + 'Teatro_Simón_I._Patiño_en_Catavi.jpg',
    w: 1280, h: 591, tag: 'Distrito minero',
  }),
  minersNorte: img('minersNorte.jpg', {
    alt: 'Dos mineros con casco en la entrada de una mina del norte de Potosí',
    caption: 'Mineros del norte de Potosí',
    credit: 'Dr. Vladimir Iván',
    license: 'CC BY-SA 3.0',
    page: C + 'Los_mineros_de_Bolivia_(norte_de_Potosi).JPG',
    w: 1280, h: 960, tag: 'Personas',
  }),
  minerCart: img('minerCart.jpg', {
    alt: 'Minero empujando un carro de mineral en un túnel oscuro',
    caption: 'Minero empujando una vagoneta, Potosí (2017)',
    credit: 'Dan Lundberg',
    license: 'CC BY-SA 2.0',
    page: C + '20170808_Bolivia_1450_Potosí_sRGB_(24128335138).jpg',
    w: 1280, h: 960, tag: 'Interior mina',
  }),
  mineGallery: img('mineGallery.jpg', {
    alt: 'Galería de una mina en el Cerro Rico de Potosí',
    caption: 'Galería de mina, Cerro Rico de Potosí (2015)',
    credit: 'Consulnico',
    license: 'CC BY-SA 4.0',
    page: C + "Couloir_d'une_galerie_de_mine_-_Cerro_Rico,_Potosi.jpg",
    w: 1280, h: 853, tag: 'Interior mina',
  }),
  potosiPanorama: img('potosiPanorama.jpg', {
    alt: 'Panorámica de Potosí bajo el Cerro Rico',
    caption: 'Potosí y el Cerro Rico, panorámica (2007)',
    credit: 'Martin St-Amant',
    license: 'CC BY 3.0',
    page: C + 'Potosi_Décembre_2007_-_Panorama_1.jpg',
    w: 1600, h: 607, tag: 'Altiplano',
  }),
  altiplano: img('altiplano.jpg', {
    alt: 'Altiplano boliviano con montañas a lo lejos',
    caption: 'Altiplano de Bolivia (2015)',
    credit: 'W. Bulach',
    license: 'CC BY-SA 4.0',
    page: C + '00_1671_South_America_-_Altiplano_de_Bolivia.jpg',
    w: 1280, h: 853, tag: 'Altiplano',
  }),
  pajaBrava: img('pajaBrava.jpg', {
    alt: 'Pajonal de paja brava en el altiplano de Oruro',
    caption: 'Paja brava en el altiplano orureño (2011)',
    credit: 'Marmer',
    license: 'CC BY-SA 4.0',
    page: C + 'PAJA_BRAVA.JPG',
    w: 1280, h: 960, tag: 'Altiplano',
  }),
  lechin: img('lechin.jpg', {
    alt: 'Retrato en blanco y negro de Juan Lechín Oquendo',
    caption: 'Juan Lechín Oquendo, c. 1960 – 1964',
    credit: 'Autor desconocido',
    license: 'Dominio público',
    page: C + 'Juan_Lechín._Unknown_author._c._1960–1964._La_Paz.png',
    w: 960, h: 1393, tag: 'Personas',
  }),
  domitila: img('domitila.jpg', {
    alt: 'Dibujo a línea de Domitila Barrios de Chungara',
    caption: 'Domitila Barrios de Chungara, dibujo (2021)',
    credit: 'Fduriez',
    license: 'CC BY-SA 4.0',
    page: C + 'Domitila_Barrios_de_Chungara_Portrait.jpg',
    w: 1083, h: 1092, tag: 'Personas',
  }),
  revolutionRelief: img('revolutionRelief.jpg', {
    alt: 'Bajorrelieve de obreros y campesinos en el Museo de la Revolución Nacional',
    caption: 'Bajorrelieve del Museo de la Revolución Nacional, La Paz',
    credit: 'Carwil Bjork-James',
    license: 'CC BY-SA 4.0',
    page: C + 'Museum_of_National_Revolution_Bas_Relief.jpg',
    w: 1280, h: 896, tag: 'Personas',
  }),
  tubeRadio: img('tubeRadio.jpg', {
    alt: 'Radio de válvulas de 1955 con gabinete de madera',
    caption: 'Receptor de válvulas de 1955 (referencial)',
    credit: 'Masaki Ikeda',
    license: 'Dominio público',
    page: C + 'Toshiba_Vacuum_tube_Radio.jpg',
    w: 1280, h: 841, tag: 'Radio',
  }),
  ribbonMic: img('ribbonMic.jpg', {
    alt: 'Micrófono de cinta de transmisión de los años cuarenta',
    caption: 'Micrófono de cinta de radiodifusión (referencial)',
    credit: 'Roadside Guitars',
    license: 'CC BY-SA 2.0',
    page: C + 'RCA_44-BX_Bi-Directional_Velocity_Microphone.jpg',
    w: 896, h: 1371, tag: 'Radio',
  }),
} satisfies Record<string, ArchiveImage>;

export type ImageKey = keyof typeof IMAGES;
export const IMAGE_LIST: ArchiveImage[] = Object.values(IMAGES);
