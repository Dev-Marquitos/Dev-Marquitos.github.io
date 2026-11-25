export interface MuseumPiece {
  id: 'radio' | 'transmitter' | 'mic' | 'turntable' | 'helmet' | 'cart' | 'dynamite';
  number: string;
  title: string;
  era: string;
  kicker: string;
  short: string;
  description: string;
  context: string;
  facts: [string, string][];
  accent: string;
}

/**
 * Piezas representativas (reconstrucciones digitales por código). No son los
 * objetos originales de la emisora: representan el tipo de equipo y de
 * herramienta característicos de la época y del distrito minero.
 */
export const MUSEUM_PIECES: MuseumPiece[] = [
  {
    id: 'radio',
    number: '01',
    title: 'Receptor de válvulas',
    era: 'Décadas de 1950 y 1960',
    kicker: 'La ventana de la casa minera',
    short: 'El receptor de válvulas fue la ventana de cada casa del campamento. Alrededor de él las familias escuchaban noticias, música, avisos del sindicato y lecciones de alfabetización.',
    description:
      'Antes del transistor, los receptores funcionaban con válvulas de vacío que tardaban unos segundos en calentarse y despedían un brillo cálido. El gabinete de madera, la tela del parlante y el dial iluminado eran el centro de la vida doméstica.',
    context:
      'En sus primeros años, la Pío XII impulsó campañas de alfabetización en el norte de Potosí con receptores presintonizados en su señal: la llamada “frecuencia azul”. Con los años, por ese mismo dial llegaron los avisos del sindicato y, en tiempos de crisis, la única información confiable.',
    facts: [
      ['Tecnología', 'Válvulas de vacío'],
      ['Bandas', 'Onda media y onda corta'],
      ['Indicador', '“Ojo mágico” de sintonía'],
      ['Campaña', '“Frecuencia azul” (alfabetización)'],
    ],
    accent: '#f2a541',
  },
  {
    id: 'transmitter',
    number: '02',
    title: 'Transmisor de onda corta',
    era: 'Equipo de emisora',
    kicker: 'El corazón que había que proteger',
    short: 'El transmisor convertía la voz en ondas que cruzaban el altiplano. La Pío llegó a emitir con unos dos mil vatios, frente a los trescientos a quinientos de las radios sindicales. En los golpes de Estado, los transmisores eran el primer objetivo.',
    description:
      'Gabinetes metálicos con válvulas de potencia, instrumentos de aguja y alta tensión. La onda corta permitía que la señal rebotara en la ionosfera y alcanzara comunidades muy alejadas, sin carreteras ni teléfono.',
    context:
      'En el golpe de julio de 1980, la última emisión de la Pío salió el jueves 24 al mediodía; después, los militares se llevaron los equipos. La radio recién volvió al aire el 4 de julio de 1982, con un transmisor viejo.',
    facts: [
      ['Bandas', 'Onda media y onda corta'],
      ['Potencia citada', '≈ 2 000 W (López Vigil, 1985)'],
      ['Componentes', 'Válvulas de potencia, instrumentos de placa y antena'],
      ['Silencio', 'Julio 1980 – julio 1982'],
    ],
    accent: '#e0502f',
  },
  {
    id: 'mic',
    number: '03',
    title: 'Micrófono de estudio',
    era: 'Cabina de locución',
    kicker: 'Un micrófono abierto al pueblo',
    short: 'Ante este tipo de micrófono hablaron locutores, dirigentes, mujeres del campamento y campesinos. Las radios mineras practicaron la comunicación participativa antes de que tuviera nombre.',
    description:
      'Los micrófonos de cápsula de las décadas de 1950 y 1960 llevaban la “bandera” con el nombre de la emisora. Desde la cabina se transmitían noticieros, programas en quechua y castellano, y asambleas sindicales en directo.',
    context:
      'En la caseta de transmisión colgaba un letrero: “No hablar en nombre del pueblo. Dejar que el pueblo diga su palabra.” El micrófono se abría para que los oyentes denunciaran, convocaran y se organizaran: la raíz de lo que hoy llamamos radio comunitaria.',
    facts: [
      ['Tipo', 'Micrófono de cápsula, de pie'],
      ['Uso', 'Noticieros, asambleas y programas en vivo'],
      ['Idiomas', 'Castellano y quechua'],
      ['Programas', '“Ríase en quechua”, “Golpes sobre el Yunque”'],
    ],
    accent: '#ede5d3',
  },
  {
    id: 'turntable',
    number: '04',
    title: 'Tocadiscos de estudio',
    era: 'Discoteca de la emisora',
    kicker: 'Huayños, cuecas y dedicatorias',
    short: 'Los discos de pasta de setenta y ocho revoluciones llenaban la programación musical. Entre canción y canción viajaban saludos y dedicatorias entre familias del campamento y del campo.',
    description:
      'El tocadiscos de estudio permitía emitir música grabada: huayños, cuecas, bailecitos y otros géneros andinos. La discoteca de una emisora era también un archivo de la cultura popular.',
    context:
      'La música y los mensajes personales hacían de la radio un lugar de encuentro entre el campamento y las comunidades campesinas. Desde 1986 la emisora organiza además el festival Takiy Tinkuy.',
    facts: [
      ['Formato', 'Discos de pasta de 78 r.p.m.'],
      ['Géneros', 'Huayño, cueca, bailecito'],
      ['Función', 'Música, saludos y dedicatorias'],
      ['Festival', 'Takiy Tinkuy (desde 1986)'],
    ],
    accent: '#c9a25a',
  },
  {
    id: 'helmet',
    number: '05',
    title: 'Guardatojo con lámpara de carburo',
    era: 'Interior mina',
    kicker: 'La luz en el socavón',
    short: 'El guardatojo es el casco del minero. La lámpara de carburo producía una llama de acetileno al mezclar carburo de calcio con agua, la única luz en la oscuridad del socavón.',
    description:
      'En el interior de la mina, a cientos de metros bajo tierra, la jornada se hacía entre polvo, humedad y explosiones. El guardatojo protegía la cabeza y sostenía la lámpara, cuyo reflector concentraba la llama.',
    context:
      'Así como la lámpara alumbraba el socavón, la radio alumbraba la vida del campamento: informaba, educaba y daba voz a quienes trabajaban en la oscuridad.',
    facts: [
      ['Nombre', 'Guardatojo (casco minero)'],
      ['Lámpara', 'Carburo de calcio + agua → acetileno'],
      ['Lugar', 'Interior mina, socavones de estaño'],
      ['Reconstrucción', 'Geometría procedural (Three.js)'],
    ],
    accent: '#ffc977',
  },
  {
    id: 'cart',
    number: '06',
    title: 'Carro minero con mineral de estaño',
    era: 'Siglo XX – Catavi',
    kicker: 'La riqueza que salía de la montaña',
    short: 'De los socavones de Siglo Veinte salía el estaño que durante décadas sostuvo la economía de Bolivia. Los carros mineros lo transportaban sobre rieles hasta la superficie.',
    description:
      'La casiterita, el mineral del estaño, se extraía en los socavones y viajaba en vagonetas empujadas sobre rieles. Luego se concentraba en los ingenios de Catavi antes de ser exportada.',
    context:
      'El estaño hizo inmensamente ricos a los llamados barones del estaño y, tras la nacionalización de 1952, pasó a manos del Estado. Pero las condiciones de trabajo siguieron siendo durísimas: de ahí la fuerza del movimiento minero.',
    facts: [
      ['Mineral', 'Casiterita (óxido de estaño)'],
      ['Transporte', 'Vagonetas sobre rieles'],
      ['Procesamiento', 'Ingenios de concentración de Catavi'],
      ['Reconstrucción', 'Geometría procedural (Three.js)'],
    ],
    accent: '#bdb4a2',
  },
  {
    id: 'dynamite',
    number: '07',
    title: 'Cartuchos de dinamita',
    era: 'Herramienta y símbolo',
    kicker: 'Del trabajo a la protesta',
    short: 'La dinamita era una herramienta cotidiana para abrir la roca. En 1961 los mineros la lanzaron contra la Pío; años después, defendieron la emisora frente a los militares.',
    description:
      'Los cartuchos se colocaban en perforaciones hechas en la roca para arrancar el mineral. Su manejo exigía oficio y valentía: los accidentes eran parte de la dura realidad del trabajo.',
    context:
      'Como escribió José Ignacio López Vigil: “Al principio, la dinamita la tiraban los mineros en contra de la Pío. Unos años después, los militares dinamitaban, intervenían la estación. Y eran los mineros los que acudían a defenderla.”',
    facts: [
      ['Uso minero', 'Voladura de roca en los frentes de trabajo'],
      ['Contra la radio', 'Ataque del 4 de julio de 1961'],
      ['Por la radio', 'Defensa de la emisora en los golpes'],
      ['Riesgo', 'Explosivo de alto peligro'],
    ],
    accent: '#e0502f',
  },
];

export const pieceById = (id: string | null) => MUSEUM_PIECES.find((p) => p.id === id) ?? null;
