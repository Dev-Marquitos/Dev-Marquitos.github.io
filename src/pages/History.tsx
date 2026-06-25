import React from 'react';
import { motion } from 'framer-motion';

const events = [
  {
    year: '1900',
    title: 'AUGE DEL ESTAÑO',
    desc: 'Bolivia se convierte en uno de los mayores productores de estaño del mundo. Los "Barones del Estaño" — Patiño, Hochschild y Aramayo — controlan la industria y la vida de miles de mineros en condiciones de extrema explotación.',
    color: 'var(--color-ore-gray)',
  },
  {
    year: '1952',
    title: 'REVOLUCIÓN NACIONAL',
    desc: 'La Revolución del 9 de abril de 1952 nacionaliza las minas. Se crea COMIBOL (Corporación Minera de Bolivia). Los mineros organizados en la FSTMB se convierten en la columna vertebral del movimiento obrero boliviano.',
    color: 'var(--color-amber-dial)',
  },
  {
    year: '1959',
    title: 'FUNDACIÓN DE RADIO PÍO XII',
    desc: 'Los Misioneros Oblatos de María Inmaculada fundan Radio Pío XII en el distrito minero de Siglo XX-Catavi, Llallagua, Potosí. Inicialmente concebida para la evangelización y alfabetización, rápidamente se convierte en la voz de los trabajadores mineros.',
    color: 'var(--color-radio-red)',
  },
  {
    year: '1964',
    title: 'GOLPE DE BARRIENTOS',
    desc: 'El General René Barrientos instaura una dictadura militar. Las emisoras mineras, incluida Radio Pío XII, comienzan a sufrir persecución, censura y amenazas constantes por parte del gobierno militar.',
    color: 'var(--color-ore-gray)',
  },
  {
    year: '1967',
    title: 'MASACRE DE SAN JUAN',
    desc: 'En la noche del 24 de junio de 1967 (Noche de San Juan), el ejército ataca el campamento minero de Siglo XX-Catavi mientras las familias celebraban las fogatas de San Juan. Radio Pío XII transmite en vivo los hechos, convirtiéndose en testigo directo de la masacre que dejó decenas de muertos y heridos.',
    color: 'var(--color-radio-red)',
  },
  {
    year: '1971',
    title: 'ASAMBLEA POPULAR',
    desc: 'Se crea la Asamblea Popular, un intento de cogobierno obrero-campesino. Las radios mineras actúan como órganos de comunicación del movimiento. Ese mismo año, el golpe de Banzer las silencia: Radio Pío XII es intervenida y sus equipos destruidos.',
    color: 'var(--color-amber-dial)',
  },
  {
    year: '1978',
    title: 'HUELGA DE HAMBRE',
    desc: 'Cuatro mujeres mineras inician una huelga de hambre que desemboca en la caída de la dictadura de Banzer. Las radios mineras recobran su voz y vuelven a transmitir, reconstruyendo sus equipos con la solidaridad internacional.',
    color: 'var(--color-amber-dial)',
  },
  {
    year: '1985',
    title: 'DECRETO 21060',
    desc: 'El gobierno de Paz Estenssoro implementa la "relocalización" masiva de mineros. Miles de familias son despedidas de COMIBOL. El Centro Minero Siglo XX entra en decadencia. Radio Pío XII documenta el éxodo y mantiene viva la memoria.',
    color: 'var(--color-ore-gray)',
  },
  {
    year: '2000s',
    title: 'RESISTENCIA DIGITAL',
    desc: 'Radio Pío XII se adapta a las nuevas tecnologías, incorporando transmisión por internet, redes sociales y podcasts, mientras mantiene su señal FM para las comunidades rurales del Norte de Potosí que dependen de la radio como medio primario de información.',
    color: 'var(--color-mine-green)',
  },
  {
    year: 'HOY',
    title: 'PATRIMONIO Y MEMORIA',
    desc: 'Radio Pío XII continúa transmitiendo como testimonio vivo de la resistencia minera boliviana. Su archivo sonoro, con décadas de grabaciones históricas, representa un patrimonio cultural invaluable para Bolivia y América Latina.',
    color: 'var(--color-radio-red)',
  },
];

const fadeIn = {
  hidden: { opacity: 0, x: -40 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }
  })
};

export default function History() {
  return (
    <div className="flex-grow py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="font-display font-black text-5xl md:text-7xl text-[var(--color-radio-red)] uppercase tracking-tight leading-none">
            HISTORIA
          </h1>
          <div className="border-b-2 border-[var(--color-rock-gray)] pb-4 mt-4">
            <p className="font-mono text-sm text-[var(--color-ore-gray)] tracking-widest">
              &gt;&gt; LÍNEA DE TIEMPO — RADIO PÍO XII Y EL MOVIMIENTO MINERO BOLIVIANO
            </p>
          </div>
          <p className="font-sans text-base text-[var(--color-ore-gray)] mt-6 max-w-2xl leading-relaxed">
            La historia de Radio Pío XII es inseparable de la lucha del movimiento obrero minero de Bolivia. Desde las profundidades de las minas de estaño de Siglo XX hasta la era digital, esta emisora ha sido testigo y protagonista de los momentos más decisivos del país.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-[var(--color-rock-gray)]" />

          <div className="space-y-12">
            {events.map((event, i) => (
              <motion.div
                key={i}
                className="relative pl-16 md:pl-20"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                custom={i}
                variants={fadeIn}
              >
                {/* Year marker */}
                <div
                  className="absolute left-0 top-0 w-12 md:w-16 h-12 md:h-16 flex items-center justify-center font-mono font-bold text-xs md:text-sm border-2"
                  style={{ borderColor: event.color, color: event.color, background: 'var(--color-coal-black)' }}
                >
                  {event.year}
                </div>

                {/* Connector */}
                <div
                  className="absolute left-[24px] md:left-[32px] top-6 md:top-8 w-4 h-0.5"
                  style={{ background: event.color }}
                />

                {/* Content Card */}
                <motion.div
                  className="bg-[var(--color-mine-dark)] border border-[var(--color-rock-gray)] p-6 hover:border-opacity-100 transition-all duration-300 cursor-default"
                  style={{ borderLeftColor: event.color, borderLeftWidth: '3px' }}
                  whileHover={{ x: 5, borderColor: event.color }}
                >
                  <h2 className="font-display font-black text-xl md:text-2xl text-[var(--color-phosphor-white)] uppercase mb-3">
                    {event.title}
                  </h2>
                  <p className="font-sans text-sm text-[var(--color-ore-gray)] leading-relaxed">
                    {event.desc}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <motion.div
          className="mt-20 p-8 bg-[var(--color-mine-dark)] border-l-4 border-[var(--color-radio-red)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-sans text-lg text-[var(--color-phosphor-white)] italic leading-relaxed">
            "Las radios mineras no son simplemente medios de comunicación. Son la memoria colectiva de un pueblo, el grito de justicia que ni la dinamita ni las dictaduras pudieron silenciar."
          </p>
          <p className="font-mono text-sm text-[var(--color-ore-gray)] mt-4">
            — TESTIMONIO HISTÓRICO, CENTRO MINERO SIGLO XX
          </p>
        </motion.div>
      </div>
    </div>
  );
}
