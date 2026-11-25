export const PROJECT = {
  title: 'Museo Virtual Interactivo 3D de Radio Pío XII',
  author: 'Marco Antonio Calizaya Laura',
  advisor: 'Juan Pablo Luna Felipez, Ph.D.',
  university: 'Universidad Nacional “Siglo XX”',
  area: 'Área Tecnología · Carrera de Ingeniería Informática',
  course: 'Programación Gráfica',
  place: 'Llallagua, Potosí, Bolivia',
  version: '2.0 · Edición congreso',
  year: '2026',
};

export const CREDITS: { title: string; lines: string[] }[] = [
  { title: 'Investigación, diseño y desarrollo', lines: [PROJECT.author] },
  { title: 'Docente guía', lines: [PROJECT.advisor] },
  { title: 'Institución', lines: [PROJECT.university, PROJECT.area, PROJECT.place] },
  { title: 'Asignatura', lines: [PROJECT.course] },
  {
    title: 'Tecnologías',
    lines: ['React 19 · TypeScript · Vite', 'Three.js · React Three Fiber · Drei · Postprocessing', 'GSAP · Lenis · Framer Motion · Zustand', 'Web Audio API · Web Speech API'],
  },
  { title: 'Señal en vivo', lines: ['Radio Pío XII — servidor de streaming de ALER'] },
  { title: 'Modelos 3D, texturas, música y efectos', lines: ['Generados por código (geometría y audio procedurales)'] },
  {
    title: 'Agradecimientos',
    lines: [
      'A los trabajadores mineros de Siglo XX y Catavi',
      'A las mujeres de los Comités de Amas de Casa',
      'A Radio Pío XII y a todas las radios mineras de Bolivia',
    ],
  },
];
