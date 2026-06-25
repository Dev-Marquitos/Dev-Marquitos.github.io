import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.5 }
  })
};

export default function About() {
  return (
    <div className="flex-grow py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="font-display font-black text-5xl md:text-6xl text-[var(--color-phosphor-white)] uppercase tracking-tight">
            ACERCA DEL PROYECTO
          </h1>
          <div className="border-b-2 border-[var(--color-rock-gray)] pb-4 mt-4">
            <p className="font-mono text-sm text-[var(--color-ore-gray)] tracking-widest">
              &gt;&gt; MUSEO VIRTUAL INTERACTIVO — RADIO PÍO XII
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission */}
          <motion.div
            className="bg-[var(--color-mine-dark)] border-2 border-[var(--color-rock-gray)] p-6"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            custom={0} variants={fadeUp}
          >
            <h2 className="font-mono text-sm text-[var(--color-radio-red)] font-bold mb-4">[ MISIÓN ]</h2>
            <p className="font-sans text-sm text-[var(--color-ore-gray)] leading-relaxed">
              Preservar y difundir la memoria histórica de Radio Pío XII y el movimiento minero del Centro Minero Siglo XX a través de una experiencia web inmersiva que combine la narrativa histórica con tecnología 3D interactiva, haciendo accesible este patrimonio cultural boliviano a audiencias globales.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div
            className="bg-[var(--color-mine-dark)] border-2 border-[var(--color-rock-gray)] p-6"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            custom={1} variants={fadeUp}
          >
            <h2 className="font-mono text-sm text-[var(--color-amber-dial)] font-bold mb-4">[ VISIÓN ]</h2>
            <p className="font-sans text-sm text-[var(--color-ore-gray)] leading-relaxed">
              Convertirse en una referencia digital de preservación del patrimonio radiofónico minero de Bolivia, integrando archivos sonoros, documentos históricos y reconstrucciones 3D en una plataforma educativa y cultural de acceso universal.
            </p>
          </motion.div>

          {/* Context */}
          <motion.div
            className="bg-[var(--color-mine-dark)] border-2 border-[var(--color-rock-gray)] p-6 md:col-span-2"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            custom={2} variants={fadeUp}
          >
            <h2 className="font-mono text-sm text-[var(--color-mine-green)] font-bold mb-4">[ CONTEXTO HISTÓRICO ]</h2>
            <p className="font-sans text-sm text-[var(--color-ore-gray)] leading-relaxed mb-4">
              El Centro Minero Siglo XX, ubicado en Llallagua, Potosí, Bolivia, fue uno de los centros de producción de estaño más importantes del mundo durante el siglo XX. En este contexto de explotación laboral, luchas sindicales y dictaduras militares, las emisoras de radio mineras se convirtieron en los medios de comunicación más poderosos del movimiento obrero boliviano.
            </p>
            <p className="font-sans text-sm text-[var(--color-ore-gray)] leading-relaxed">
              Radio Pío XII, fundada en 1959 por los Misioneros Oblatos de María Inmaculada, trascendió su misión evangelizadora original para convertirse en la voz del pueblo minero. Transmitió en vivo masacres como la de San Juan (1967), resistió intervenciones militares, y se mantiene al aire más de 65 años después como patrimonio cultural vivo de Bolivia.
            </p>
          </motion.div>
        </div>

        {/* Tech Stack */}
        <motion.div
          className="mt-8 border-2 border-[var(--color-rock-gray)] bg-[var(--color-mine-dark)] p-6"
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          custom={3} variants={fadeUp}
        >
          <h2 className="font-mono text-sm text-[var(--color-radio-red)] font-bold mb-4">[ ESPECIFICACIONES TÉCNICAS ]</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            {[
              { label: 'FRAMEWORK', value: 'React 18' },
              { label: 'LENGUAJE', value: 'TypeScript 5' },
              { label: 'BUILD', value: 'Vite 6' },
              { label: '3D ENGINE', value: 'Three.js r183' },
              { label: '3D REACT', value: 'React Three Fiber' },
              { label: 'ANIMACIÓN', value: 'Framer Motion' },
              { label: 'ESTADO', value: 'Zustand' },
              { label: 'ESTILOS', value: 'Tailwind CSS 4' },
            ].map((tech, i) => (
              <div key={i} className="border border-[var(--color-rock-gray)] p-3">
                <span className="text-[var(--color-ore-gray)] block">{tech.label}:</span>
                <span className="text-[var(--color-phosphor-white)] font-bold">{tech.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Credits */}
        <motion.div
          className="mt-8 border-2 border-[var(--color-rock-gray)] bg-[var(--color-mine-dark)] p-6"
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          custom={4} variants={fadeUp}
        >
          <h2 className="font-mono text-sm text-[var(--color-amber-dial)] font-bold mb-4">[ CRÉDITOS ]</h2>
          <div className="font-mono text-sm text-[var(--color-ore-gray)] space-y-2">
            <p>&gt; PROYECTO: Programación Gráfica — Evaluación Final</p>
            <p>&gt; TEMA: Museo Virtual 3D — Radio Pío XII</p>
            <p>&gt; ESTILO: Brutalismo Industrial Minero</p>
            <p>&gt; MODELOS 3D: Geometría Procedural (Three.js)</p>
            <p>&gt; FECHA: 25 de Junio, 2026</p>
            <p>&gt; VERSIÓN: 1.0.0</p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-12 text-center"
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          custom={5} variants={fadeUp}
        >
          <Link to="/museo">
            <motion.button
              className="bg-[var(--color-radio-red)] text-white font-mono font-bold text-lg px-10 py-4 uppercase tracking-widest border-2 border-[var(--color-radio-red)]"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(230,25,25,0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              &gt;&gt;&gt; EXPLORAR EL MUSEO &lt;&lt;&lt;
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
