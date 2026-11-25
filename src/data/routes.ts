export interface RoomRoute {
  path: string;
  label: string;
  short: string;
  number: string;
  title: string;
  description: string;
}

export const ROUTES: RoomRoute[] = [
  { path: '/', label: 'Inicio', short: 'Inicio', number: '01', title: 'Radio Pío XII — Museo virtual', description: 'Sintoniza la emisora que fue la voz del distrito minero Siglo XX – Catavi.' },
  { path: '/historia', label: 'Historia', short: 'Historia', number: '02', title: 'Un siglo en el dial', description: 'Del imperio del estaño a la memoria viva: la línea de tiempo completa.' },
  { path: '/museo', label: 'Museo 3D', short: 'Museo', number: '03', title: 'Sala de objetos', description: 'Siete piezas reconstruidas en 3D: explóralas, gíralas y escucha su historia.' },
  { path: '/red-minera', label: 'Red minera', short: 'Red', number: '04', title: 'La cadena de radios mineras', description: 'El mapa de las emisoras sindicales que se enlazaban para resistir.' },
  { path: '/voces', label: 'Voces', short: 'Voces', number: '05', title: 'Voces de la mina', description: 'Mujeres, dirigentes y sacerdotes que hicieron de la palabra un acto de coraje.' },
  { path: '/archivo', label: 'Archivo', short: 'Archivo', number: '06', title: 'Archivo fotográfico', description: 'Imágenes del campamento, la mina y el altiplano potosino.' },
  { path: '/en-vivo', label: 'En vivo', short: 'En vivo', number: '07', title: 'Señal en vivo', description: 'Escucha hoy Radio Pío XII y sintoniza la frecuencia de la memoria.' },
  { path: '/creditos', label: 'Créditos', short: 'Créditos', number: '08', title: 'Proyecto y créditos', description: 'Cómo se hizo este museo, quiénes lo hicieron y las fuentes consultadas.' },
];

export const routeByPath = (p: string) => ROUTES.find((r) => r.path === p) ?? ROUTES[0];
