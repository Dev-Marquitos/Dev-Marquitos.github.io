import React from 'react';
import { motion } from 'framer-motion';
import { HeroScene } from '../components/3d/scenes/HeroScene';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }
  })
};

export default function Home() {
  return (
    <div className="flex-grow flex flex-col">
      {/* Hero Section with 3D */}
      <div className="relative overflow-hidden h-[80vh] md:h-[90vh]">
        <HeroScene />

        {/* Overlay Content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none p-6">
          <motion.div className="max-w-4xl w-full text-center space-y-6 pointer-events-auto">
            <motion.p
              className="font-mono text-sm text-[var(--color-amber-dial)] tracking-[0.3em] uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
            >
              &gt;&gt;&gt; MUSEO VIRTUAL INTERACTIVO &lt;&lt;&lt;
            </motion.p>

            <motion.h1
              className="font-display font-black text-6xl md:text-8xl lg:text-9xl tracking-tighter text-[var(--color-radio-red)] uppercase leading-none"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
              style={{ textShadow: '0 0 40px rgba(230,25,25,0.4)' }}
            >
              RADIO<br/>PÍO XII
            </motion.h1>

            <motion.div
              className="border-t-2 border-b-2 border-[var(--color-rock-gray)] py-4 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <p className="font-mono text-lg md:text-xl text-[var(--color-phosphor-white)] uppercase tracking-[0.2em]">
                CENTRO MINERO SIGLO XX
              </p>
              <p className="font-mono text-sm text-[var(--color-ore-gray)] mt-1 tracking-widest">
                LLALLAGUA — POTOSÍ — BOLIVIA
              </p>
            </motion.div>

            <motion.p
              className="font-sans text-base md:text-lg text-[var(--color-phosphor-white)] max-w-2xl mx-auto bg-black/40 p-4 border border-[var(--color-rock-gray)] leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              Explora la historia viva de la radiodifusión minera en Bolivia. Un recorrido inmersivo 3D por los equipos, las luchas y las voces que marcaron la resistencia obrera en las minas de estaño.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
            >
              <Link to="/museo">
                <motion.button
                  className="w-full sm:w-auto bg-[var(--color-radio-red)] text-white font-mono font-bold text-base px-8 py-4 uppercase tracking-widest border-2 border-[var(--color-radio-red)]"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(230,25,25,0.5)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  ▣ EXPLORAR MUSEO 3D
                </motion.button>
              </Link>
              <Link to="/en-vivo">
                <motion.button
                  className="w-full sm:w-auto bg-transparent text-[var(--color-mine-green)] font-mono font-bold text-base px-8 py-4 uppercase tracking-widest border-2 border-[var(--color-mine-green)]"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(74,246,38,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  ◉ ESCUCHAR EN VIVO
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Info Section */}
      <section className="bg-[var(--color-mine-dark)] border-t-2 border-[var(--color-rock-gray)] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="font-display font-black text-3xl md:text-4xl text-[var(--color-phosphor-white)] uppercase mb-12 text-center"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            custom={0} variants={fadeUp}
          >
            [ LA VOZ DE LOS MINEROS ]
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '📻',
                title: 'FUNDADA EN 1959',
                desc: 'Los Padres Oblatos de María Inmaculada establecen Radio Pío XII en el centro minero más importante de Bolivia, con el objetivo de alfabetizar y comunicar a las comunidades mineras.'
              },
              {
                icon: '⛏️',
                title: 'VOZ DE RESISTENCIA',
                desc: 'Durante las dictaduras militares, la radio se convirtió en el principal medio de denuncia e información para los trabajadores mineros, transmitiendo en vivo masacres y represiones.'
              },
              {
                icon: '🎙️',
                title: 'PATRIMONIO VIVO',
                desc: 'Hoy la emisora sigue operando como bastión de la comunicación comunitaria, preservando la memoria histórica del movimiento obrero boliviano y la identidad cultural de Potosí.'
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                className="bg-[var(--color-coal-black)] border-2 border-[var(--color-rock-gray)] p-6 hover:border-[var(--color-radio-red)] transition-colors duration-300"
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i + 1} variants={fadeUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <span className="text-4xl block mb-4">{card.icon}</span>
                <h3 className="font-mono text-sm text-[var(--color-radio-red)] font-bold mb-3 tracking-wider">{card.title}</h3>
                <p className="font-sans text-sm text-[var(--color-ore-gray)] leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="border-t-2 border-b-2 border-[var(--color-rock-gray)] py-10 px-4 bg-[var(--color-coal-black)]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: '1959', label: 'AÑO DE FUNDACIÓN' },
            { num: '65+', label: 'AÑOS AL AIRE' },
            { num: 'FM 99.1', label: 'FRECUENCIA' },
            { num: '4,000m', label: 'ALTITUD (m.s.n.m.)' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              custom={i} variants={fadeUp}
            >
              <p className="font-display font-black text-3xl md:text-4xl text-[var(--color-amber-dial)]">{stat.num}</p>
              <p className="font-mono text-[11px] text-[var(--color-ore-gray)] tracking-widest mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
