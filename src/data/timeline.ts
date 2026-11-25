/**
 * Línea de tiempo verificada. Fuentes principales:
 *  [LV]  López Vigil, J. I. (1985). Una mina de coraje. ALER–Pío XII.
 *  [T09] Tórrez Miranda, F. (2009). Radio Pío XII, la radio que se hace pueblo. Revista Fuentes, 3(3).
 *  [PIO] radiopio12.com.bo · [HER] Herrera Miller (2006) · [AGU] Aguirre Alvis (2022)
 * Cuando las fuentes discrepan, el texto lo indica.
 */
export type Tone = 'mine' | 'radio' | 'tragedy' | 'people' | 'today';

export interface TimelineEvent {
  year: string;
  date?: string;
  title: string;
  text: string;
  tone: Tone;
  source: string;
  image?: string;
}

export interface Era {
  id: string;
  range: string;
  name: string;
  intro: string;
  events: TimelineEvent[];
}

export const ERAS: Era[] = [
  {
    id: 'estano',
    range: '1900 – 1951',
    name: 'El imperio del estaño',
    intro: 'Antes de la radio, la montaña. Del cerro de Llallagua salió buena parte del estaño que el mundo industrial necesitaba.',
    events: [
      {
        year: '1900',
        date: 'c. 1900 – 1901',
        title: 'La veta de La Salvadora',
        text: 'Simón I. Patiño encuentra la veta rica de su mina La Salvadora, en Llallagua. De ella nace un emporio que convertirá a Patiño en el “Rey del Estaño” y al distrito en uno de los mayores centros mineros del planeta.',
        tone: 'mine',
        source: 'Smale (2010); Wikipedia: Simón I. Patiño. Las fuentes dan 1900 o 1901.',
      },
      {
        year: '1942',
        date: '21 de diciembre de 1942',
        title: 'Masacre de Catavi',
        text: 'Las tropas disparan contra trabajadores en huelga y sus familias en la pampa de Catavi. La cifra oficial habló de 19 muertos; los trabajadores denunciaron cientos. Entre las víctimas estaba María Barzola, que se volvió símbolo de las mujeres mineras.',
        tone: 'tragedy',
        source: 'Wikipedia: Masacre de Catavi; [LV]. Las cifras de víctimas discrepan.',
      },
      {
        year: '1947',
        date: 'Fines de los años cuarenta',
        title: 'La Voz del Minero',
        text: 'El sindicato de Siglo XX pone al aire su propia emisora, financiada con aportes de los trabajadores. Es el comienzo de las radios mineras: medios de los obreros, hechos por ellos mismos.',
        tone: 'radio',
        source: '[AGU] y [HER] dan 1947; otros testimonios la sitúan después de 1952.',
      },
    ],
  },
  {
    id: 'nacimiento',
    range: '1952 – 1963',
    name: 'Revolución y nacimiento',
    intro: 'La Revolución Nacional cambia el país. En los campamentos llegan nuevos actores: el Estado minero, los sindicatos fortalecidos y los misioneros oblatos.',
    events: [
      {
        year: '1952',
        date: '31 de octubre de 1952',
        title: 'Nacionalización de las minas',
        text: 'En el Campo María Barzola de Catavi se firma el Decreto Supremo 3223, que nacionaliza las minas de los barones del estaño. Semanas antes se había creado la Corporación Minera de Bolivia, COMIBOL. Ese mismo año llegan a la zona los primeros misioneros oblatos canadienses.',
        tone: 'mine',
        source: 'CEDIB (Ley 2400); Wikipedia: COMIBOL; [PIO].',
      },
      {
        year: '1959',
        date: '1 de mayo de 1959',
        title: 'Nace Emisoras Pío XII',
        text: 'El padre oblato canadiense Lino Grenier inaugura la emisora en el campamento Siglo XX con un lema tomado del Papa: “decir la verdad y hacer el bien”. Nació para evangelizar, alfabetizar y combatir el alcoholismo, pero también con una línea anticomunista que la enfrentó a La Voz del Minero.',
        tone: 'radio',
        source: '[LV], [PIO], [T09], [AGU].',
      },
      {
        year: '1961',
        date: '4 de julio de 1961',
        title: 'Dinamita contra la Pío',
        text: 'Tras una asamblea sindical, mineros atacan la emisora con piedras y dinamita. Hubo heridos. En diciembre Grenier deja el país y el nuevo director, Gabriel Dicaire, inspirado en Juan XXIII y el Concilio, prohíbe los ataques al comunismo desde los micrófonos.',
        tone: 'tragedy',
        source: '[LV] (fuente única, con transcripciones de la época).',
      },
    ],
  },
  {
    id: 'giro',
    range: '1964 – 1970',
    name: 'Del púlpito al pueblo',
    intro: 'Golpes militares, rebajas salariales y masacres. La emisora de los curas empieza a ponerse del lado de los mineros.',
    events: [
      {
        year: '1964',
        date: '30 de mayo de 1964',
        title: 'Llega Gregorio Iriarte',
        text: 'El sacerdote oblato navarro llega a Siglo XX. Meses después, el golpe del general Barrientos abre una etapa de represión. Iriarte gestiona la libertad de dirigentes detenidos y la radio comienza a escuchar al campamento.',
        tone: 'people',
        source: '[LV]; obituarios de G. Iriarte (2012).',
      },
      {
        year: '1965',
        date: 'Septiembre de 1965',
        title: 'La masacre de septiembre',
        text: 'Con las rebajas salariales llega la ocupación militar de Llallagua, Catavi y Siglo XX: 82 muertos y unos 200 heridos. La Pío informa en directo. Para muchos, ese “vuelco de conciencia” marca el cambio definitivo de la emisora.',
        tone: 'tragedy',
        source: '[LV], [T09]. Las fuentes discrepan sobre el momento exacto del giro (1964 – 1965).',
      },
      {
        year: '1967',
        date: '24 de junio de 1967, madrugada',
        title: 'La noche de San Juan',
        text: 'Mientras las familias celebraban las fogatas de San Juan, el ejército ataca el campamento. Cortaron la luz para silenciar las radios, pero la Pío volvió al aire con una planta de emergencia, denunció la masacre y pidió sangre para los heridos. Las cifras de muertos van de 20 a 27.',
        tone: 'tragedy',
        source: 'Wikipedia: Masacre de San Juan; [LV]; [T09]. Cifras discrepantes.',
      },
      {
        year: '1967',
        date: '18 de julio de 1967',
        title: 'Nace ERBOL',
        text: 'La Pío XII es una de las emisoras fundadoras de Educación Radiofónica de Bolivia, la red que reunirá a las radios educativas y populares del país.',
        tone: 'radio',
        source: '[PIO]; obituarios de G. Iriarte.',
      },
      {
        year: '1969',
        date: '26 de septiembre de 1969',
        title: 'Primera intervención militar',
        text: 'Con el golpe del general Ovando, la radio es intervenida por primera vez. Sacerdotes y periodistas quedan detenidos y son liberados gracias a la mediación de Marcelo Quiroga Santa Cruz.',
        tone: 'tragedy',
        source: '[LV], [T09].',
      },
    ],
  },
  {
    id: 'resistencia',
    range: '1971 – 1982',
    name: 'Dictaduras y resistencia',
    intro: 'Los años más duros. Cada golpe de Estado buscaba primero las antenas; cada vez, el campamento salía a defender su voz.',
    events: [
      {
        year: '1971',
        date: '21 de agosto de 1971',
        title: 'Golpe de Banzer',
        text: 'La Pío transmite llamando a resistir hasta la una de la madrugada. Luego cierra por precaución durante unos quince días. Empieza una dictadura de siete años.',
        tone: 'tragedy',
        source: '[LV]; [T09].',
      },
      {
        year: '1975',
        date: '13 de enero de 1975',
        title: 'Asalto a cuatro radios',
        text: 'Un operativo paramilitar simultáneo asalta La Voz del Minero, la 21 de Diciembre, Radio Llallagua y la Pío XII. Saquean los equipos, golpean al padre Roberto Durette y detienen al padre Gustavo Pelletier. La Pío queda cerrada unos nueve meses.',
        tone: 'tragedy',
        source: '[LV], [T09].',
      },
      {
        year: '1977',
        date: '28 de diciembre de 1977',
        title: 'La huelga de las cuatro mujeres',
        text: 'Cuatro esposas de mineros de Siglo XX y catorce niños inician una huelga de hambre en el Arzobispado de La Paz. La medida se había decidido en el salón de la Pío. Se suman Domitila Barrios de Chungara y más de mil personas; a los 23 días, la dictadura concede la amnistía.',
        tone: 'people',
        source: '[LV]; Global Nonviolent Action Database; Wikipedia: Domitila Barrios de Chungara.',
      },
      {
        year: '1978',
        date: '21 de julio de 1978',
        title: 'Los vecinos defienden la radio',
        text: 'En el golpe de Pereda, soldados irrumpen en plena emisión y golpean al locutor Marcial Mansilla. En media hora, los vecinos del campamento los expulsan. Los balazos quedaron marcados en el techo.',
        tone: 'people',
        source: '[LV] (detalles); [T09] confirma la intervención.',
      },
      {
        year: '1980',
        date: '17 – 24 de julio de 1980',
        title: 'La Cadena de la Democracia',
        text: 'La misma noche del golpe de García Meza, quince emisoras se enlazan en cadena para resistir. Dinamitan antenas y bombardean la radio de Colquiri. La última emisión de la Pío sale el jueves 24 al mediodía; los militares se llevan los equipos.',
        tone: 'tragedy',
        source: '[LV], [T09]; [HER] y [AGU] confirman la cadena.',
      },
      {
        year: '1982',
        date: '4 de julio de 1982',
        title: 'Vuelve la voz',
        text: 'Tras dos años de silencio, la Pío XII vuelve al aire con un transmisor viejo. Meses después, Bolivia recupera la democracia.',
        tone: 'radio',
        source: '[LV] (día); [T09] (año).',
      },
    ],
  },
  {
    id: 'memoria',
    range: '1985 – hoy',
    name: 'Relocalización y memoria',
    intro: 'Cierra el ciclo del estaño estatal, pero la radio se queda. Hoy es una red que sigue hablando en castellano y quechua.',
    events: [
      {
        year: '1985',
        date: '29 de agosto de 1985',
        title: 'Decreto 21060',
        text: 'La nueva política económica y la caída del precio del estaño llevan a la “relocalización”: más de veinte mil trabajadores de COMIBOL pierden su empleo. Los campamentos se vacían y miles de familias migran.',
        tone: 'mine',
        source: '[HER]; copia del DS 21060. Las cifras van de 21 000 a 27 000.',
      },
      {
        year: '1986',
        date: '21 – 28 de agosto de 1986',
        title: 'Marcha por la Vida',
        text: 'Miles de mineros marchan de Oruro hacia La Paz. En Calamarca los detiene el estado de sitio. La Pío transmite la marcha completa; su personal y el padre Pelletier son detenidos.',
        tone: 'people',
        source: '[T09]; Red UNITAS (2019); Wikipedia: Marcha por la Vida.',
      },
      {
        year: '2009',
        date: '1 de mayo de 2009',
        title: 'Cincuenta años',
        text: 'La radio celebra medio siglo como “la radio que se hace pueblo”. Programas como “Ríase en quechua”, “Golpes sobre el Yunque” o la radionovela “Rumi Tambo” y el festival Takiy Tinkuy forman parte de su historia.',
        tone: 'radio',
        source: '[T09]; [PIO]; [LV].',
      },
      {
        year: 'HOY',
        date: '2024 – 2026',
        title: 'Sigue al aire',
        text: 'Con más de 65 años, la Red Pío XII transmite desde Siglo XX, Oruro y Cochabamba, y por internet al mundo. Este museo virtual conecta su señal en vivo con la memoria del distrito minero.',
        tone: 'today',
        source: '[PIO]; eju.tv (2024); servidor de streaming de ALER.',
      },
    ],
  },
];

export const ALL_EVENTS = ERAS.flatMap((e) => e.events.map((ev) => ({ ...ev, era: e.name })));
