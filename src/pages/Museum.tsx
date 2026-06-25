import React from 'react';
import { motion } from 'framer-motion';
import { MuseumScene } from '../components/3d/scenes/MuseumScene';
import { useMuseumStore } from '../stores/useMuseumStore';

const objectInfo: Record<string, { title: string; desc: string; year: string; details: string[] }> = {
  radio: {
    title: 'Transmisor de Ondas Cortas',
    year: '1959',
    desc: 'Equipo fundamental utilizado en los primeros años de la emisora para alcanzar los campamentos mineros más alejados del altiplano potosino. Este tipo de transmisor permitía que la señal llegara a comunidades rurales sin acceso a otros medios de comunicación.',
    details: [
      'Frecuencia: Onda Corta / FM',
      'Alcance: ~200 km en el altiplano',
      'Fabricación: Europa (donación)',
      'Estado: Replica funcional'
    ]
  },
  mic: {
    title: 'Micrófono de Estudio RCA',
    year: '1960s',
    desc: 'Micrófono de condensador clásico utilizado por los locutores sindicales para transmitir los ampliados mineros, convocar a marchas de resistencia y denunciar las masacres durante las dictaduras militares. A través de este tipo de micrófono, los dirigentes mineros como Juan Lechín Oquendo se dirigían al pueblo.',
    details: [
      'Tipo: Condensador unidireccional',
      'Marca: RCA (Radio Corporation)',
      'Uso: Locución y transmisiones de emergencia',
      'Época: Década de 1960'
    ]
  },
  helmet: {
    title: 'Casco de Guardatojo',
    year: 'Siglo XX',
    desc: 'El símbolo por excelencia del minero boliviano. La luz de carburo en la frente guiaba el trabajo en la oscuridad del interior mina, a más de 300 metros bajo tierra. Así como esta lámpara iluminaba los socavones, Radio Pío XII iluminaba la conciencia de los trabajadores.',
    details: [
      'Material: Baquelita / Metal reforzado',
      'Lámpara: Carburo de calcio',
      'Profundidad de trabajo: Hasta 400m',
      'Patrimonio: Símbolo nacional minero'
    ]
  }
};

export default function Museum() {
  const { selectedObject, selectObject } = useMuseumStore();

  return (
    <div className="flex-grow flex flex-col relative h-[calc(100vh-64px)]">
      {/* 3D Canvas */}
      <MuseumScene />

      {/* Instructions overlay */}
      <motion.div
        className="absolute top-4 left-4 z-10 bg-[var(--color-coal-black)]/90 border border-[var(--color-rock-gray)] p-4 max-w-xs pointer-events-none backdrop-blur-sm"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h2 className="font-mono text-[var(--color-radio-red)] font-bold mb-2 text-sm">[ MUSEO VIRTUAL 3D ]</h2>
        <p className="font-sans text-xs text-[var(--color-ore-gray)] leading-relaxed">
          Arrastra para rotar la cámara. Haz clic en los pedestales hexagonales para ver información de cada pieza del museo.
        </p>
        <div className="mt-3 pt-3 border-t border-[var(--color-rock-gray)] font-mono text-[10px] text-[var(--color-ore-gray)] space-y-1">
          <p><span className="inline-block w-3 h-3 bg-[var(--color-amber-dial)] mr-2"></span>TRANSMISOR (IZQ)</p>
          <p><span className="inline-block w-3 h-3 bg-[var(--color-radio-red)] mr-2"></span>MICRÓFONO (CENTRO)</p>
          <p><span className="inline-block w-3 h-3 bg-[var(--color-mine-green)] mr-2"></span>CASCO MINERO (DER)</p>
        </div>
      </motion.div>

      {/* Quick select buttons */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {[
          { id: 'radio', label: 'RADIO', color: 'var(--color-amber-dial)' },
          { id: 'mic', label: 'MICRO', color: 'var(--color-radio-red)' },
          { id: 'helmet', label: 'CASCO', color: 'var(--color-mine-green)' },
        ].map((btn) => (
          <motion.button
            key={btn.id}
            onClick={() => selectObject(btn.id)}
            className="px-4 py-2 font-mono text-xs uppercase border-2 backdrop-blur-sm bg-black/50"
            style={{
              borderColor: btn.color,
              color: selectedObject === btn.id ? 'var(--color-coal-black)' : btn.color,
              backgroundColor: selectedObject === btn.id ? btn.color : 'rgba(0,0,0,0.5)',
            }}
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            {btn.label}
          </motion.button>
        ))}
      </div>

      {/* Object Info Modal */}
      {selectedObject && objectInfo[selectedObject] && (
        <motion.div
          className="absolute top-4 right-4 z-20 bg-[var(--color-coal-black)]/95 border-2 border-[var(--color-rock-gray)] p-6 max-w-sm backdrop-blur-sm"
          initial={{ opacity: 0, x: 30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-start mb-4 border-b border-[var(--color-rock-gray)] pb-3">
            <div>
              <h3 className="font-display font-black text-lg text-[var(--color-phosphor-white)] uppercase leading-tight">
                {objectInfo[selectedObject].title}
              </h3>
              <span className="font-mono text-xs text-[var(--color-amber-dial)]">
                REV {objectInfo[selectedObject].year}
              </span>
            </div>
            <motion.button
              onClick={() => selectObject(null)}
              className="text-[var(--color-radio-red)] font-mono text-sm border border-[var(--color-radio-red)] px-2 py-1 hover:bg-[var(--color-radio-red)] hover:text-white transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              CERRAR
            </motion.button>
          </div>

          <p className="font-sans text-sm text-[var(--color-ore-gray)] leading-relaxed mb-4">
            {objectInfo[selectedObject].desc}
          </p>

          <div className="border-t border-[var(--color-rock-gray)] pt-3">
            <h4 className="font-mono text-xs text-[var(--color-radio-red)] font-bold mb-2">[ FICHA TÉCNICA ]</h4>
            {objectInfo[selectedObject].details.map((detail, i) => (
              <p key={i} className="font-mono text-[11px] text-[var(--color-ore-gray)] py-1 border-b border-[var(--color-rock-gray)]/30">
                &gt; {detail}
              </p>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
