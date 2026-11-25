import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { routeByPath } from '../../data/routes';
import { sfx } from '../../stores/useExperience';
import { scrollToTop } from '../../lib/smoothScroll';
import { stopNarration } from '../../stores/useNarration';

function StaticCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(c.width, c.height);
    let raf = 0;
    const draw = () => {
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = v;
        img.data[i + 1] = v * 0.92;
        img.data[i + 2] = v * 0.8;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={192} height={108} className="absolute inset-0 w-full h-full opacity-[0.22]" style={{ imageRendering: 'pixelated' }} />;
}

/** "Cambio de dial" entre salas: ráfaga de estática + rótulo de la sala. */
export function RouteTransition() {
  const { pathname } = useLocation();
  const [n, setN] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    scrollToTop(true);
    stopNarration();
    setN((v) => v + 1);
    sfx.static(0.5, 0.14);
  }, [pathname]);

  const room = routeByPath(pathname);

  useEffect(() => {
    document.title = pathname === '/' ? 'Radio Pío XII — Museo virtual 3D' : `${room.label} · Radio Pío XII — Museo virtual`;
  }, [pathname, room.label]);

  return (
    <AnimatePresence>
      {n > 0 && (
        <motion.div
          key={n}
          className="fixed inset-0 z-[80] pointer-events-none bg-ink"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <StaticCanvas />
          <div className="absolute inset-0 scanlines" />
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: [0, 1, 1, 0], scale: 1 }}
            transition={{ duration: 0.9, times: [0, 0.2, 0.7, 1] }}
          >
            <span className="font-mono text-xs tracking-[0.4em] text-amber">SALA {room.number}</span>
            <span className="mt-3 font-display text-4xl md:text-6xl">{room.label}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
