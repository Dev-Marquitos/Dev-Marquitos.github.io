export interface Person {
  id: string;
  name: string;
  life: string;
  role: string;
  bio: string;
  source: string;
  image?: string;
  initials: string;
}

export const PEOPLE: Person[] = [
  {
    id: 'domitila',
    name: 'Domitila Barrios de Chungara',
    life: '1937 – 2012',
    role: 'Dirigente del Comité de Amas de Casa de Siglo XX',
    bio: 'Esposa de minero de Siglo XX, se convirtió en una de las voces más potentes de Bolivia. Habló en la Tribuna del Año Internacional de la Mujer (México, 1975) y se sumó a la huelga de hambre de 1977–1978 que obligó a la dictadura a conceder la amnistía. Su testimonio, “Si me permiten hablar…”, recogido por Moema Viezzer, recorrió el mundo.',
    source: 'Wikipedia; Viezzer (1977); López Vigil (1985).',
    initials: 'DB',
  },
  {
    id: 'grenier',
    name: 'P. Lino Grenier, OMI',
    life: 'Llegó a Bolivia en 1954',
    role: 'Fundador y primer director de la radio',
    bio: 'Misionero oblato canadiense. Inauguró Emisoras Pío XII el 1 de mayo de 1959 con el lema “decir la verdad y hacer el bien”. Su línea anticomunista lo enfrentó con el sindicato de Siglo XX; dejó el país a fines de 1961.',
    source: 'López Vigil (1985); radiopio12.com.bo.',
    initials: 'LG',
  },
  {
    id: 'iriarte',
    name: 'P. Gregorio Iriarte, OMI',
    life: '1925 – 2012',
    role: 'Sacerdote, escritor y defensor de los derechos humanos',
    bio: 'Oblato navarro que llegó a Siglo XX en 1964. Acompañó el giro de la emisora hacia el pueblo minero, ayudó a dirigentes perseguidos y fue cofundador de ERBOL y de la Asamblea Permanente de Derechos Humanos de Bolivia. Autor de “Análisis crítico de la realidad”.',
    source: 'López Vigil (1985); obituarios (2012).',
    initials: 'GI',
  },
  {
    id: 'durette',
    name: 'P. Roberto Durette, OMI',
    life: 'Llegó a Catavi en 1962',
    role: 'Director de la radio durante décadas',
    bio: 'Oblato estadounidense. Fue golpeado en el asalto de 1975, dirigía la emisora durante el golpe de 1980 y sigue ligado a la Red Pío XII. Suya es la frase que dio título al libro de López Vigil: “El pueblo boliviano es una mina de coraje”.',
    source: 'López Vigil (1985); Tórrez (2009); radiopio12.com.bo.',
    initials: 'RD',
  },
  {
    id: 'escobar',
    name: 'Federico Escóbar Zapata',
    life: '1924 – 1966',
    role: 'Control Obrero del sindicato de Siglo XX',
    bio: 'Conocido como “Macho Moreno”, fue uno de los dirigentes más influyentes del distrito. Al principio vetó a la emisora de los curas; años después, el propio Iriarte gestionó su libertad cuando fue detenido.',
    source: 'López Vigil (1985); Marxists Internet Archive.',
    initials: 'FE',
  },
  {
    id: 'lechin',
    name: 'Juan Lechín Oquendo',
    life: '1914 – 2001',
    role: 'Máximo dirigente de la FSTMB y la COB',
    bio: 'Dirigió la Federación Sindical de Trabajadores Mineros de Bolivia de 1944 a 1987 y la Central Obrera Boliviana desde su fundación en 1952. Fue vicepresidente de la República entre 1960 y 1964.',
    source: 'Wikipedia (ES, EN).',
    initials: 'JL',
  },
  {
    id: 'lora',
    name: 'César Lora',
    life: '? – 1965',
    role: 'Dirigente minero de Siglo XX',
    bio: 'Dirigente trotskista del sindicato de Siglo XX, figura de la resistencia minera. Fue asesinado en 1965, en plena represión del gobierno militar.',
    source: 'López Vigil (1985); La Izquierda Diario. La fecha exacta discrepa.',
    initials: 'CL',
  },
  {
    id: 'patino',
    name: 'Simón I. Patiño',
    life: '1860 – 1947',
    role: 'El “Rey del Estaño”',
    bio: 'Nacido en Cochabamba, hizo su fortuna con la mina La Salvadora de Llallagua y llegó a controlar una de las mayores empresas de estaño del mundo. Su emporio fue nacionalizado en 1952.',
    source: 'Smale (2010); Wikipedia.',
    initials: 'SP',
  },
];

export interface Quote {
  text: string;
  author: string;
  context: string;
}

/** Citas literales tomadas de López Vigil (1985), obra con licencia CC BY-NC-SA 3.0. */
export const QUOTES: Quote[] = [
  {
    text: 'Hoy entregamos esta radio al pueblo, a nuestros hermanos trabajadores. […] el fin de esta radio es decir la verdad y hacer el bien en este campamento.',
    author: 'P. Lino Grenier',
    context: 'Inauguración, 1 de mayo de 1959',
  },
  {
    text: 'Al principio, la dinamita la tiraban los mineros en contra de la Pío. […] Unos años después, los militares dinamitaban, intervenían la estación. Y eran los mineros los que acudían a defenderla.',
    author: 'José Ignacio López Vigil',
    context: 'Una mina de coraje, 1985',
  },
  {
    text: 'Nosotros, oigan bien, nosotros y no los padres ni nadie hemos ordenado que la Pío XII siga transmitiendo.',
    author: 'Dirigentes mineros, al aire',
    context: '16 de enero de 1978',
  },
  {
    text: 'A la Pío, la convirtieron los mineros, las señoras, los campesinos, la lucha popular. El pueblo boliviano es una mina de coraje.',
    author: 'P. Roberto Durette',
    context: '1984',
  },
  {
    text: 'No hablar en nombre del pueblo. Dejar que el pueblo diga su palabra.',
    author: 'Letrero de la caseta de transmisión',
    context: 'Citado por Ernesto Miranda, 1984',
  },
];
