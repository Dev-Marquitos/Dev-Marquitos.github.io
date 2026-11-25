import { useEffect, useRef, useState } from 'react';

/** Cursor de dial: punto ámbar + anillo con inercia y etiqueta contextual. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;
    setEnabled(true);
    document.documentElement.classList.add('has-custom-cursor');
    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let scale = 1, target = 1, raf = 0, visible = false;

    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = pos.x;
        ringPos.y = pos.y;
        if (dot.current) dot.current.style.opacity = '1';
        if (ring.current) ring.current.style.opacity = '1';
      }
      const el = (e.target as HTMLElement | null)?.closest?.('a, button, [data-cursor], input, select, label, canvas') as HTMLElement | null;
      if (el) {
        const l = el.getAttribute('data-cursor') ?? '';
        target = el.tagName === 'CANVAS' && !l ? 1.35 : l ? 3.4 : 2;
        setLabel(l);
      } else {
        target = 1;
        setLabel('');
      }
    };
    const down = () => (target *= 0.8);
    const up = () => (target /= 0.8);
    const leave = () => {
      visible = false;
      if (dot.current) dot.current.style.opacity = '0';
      if (ring.current) ring.current.style.opacity = '0';
    };
    let frame = 0;
    const recheck = () => {
      // el elemento bajo el cursor puede desaparecer sin que el mouse se mueva
      const el = (document.elementFromPoint(pos.x, pos.y) as HTMLElement | null)?.closest?.('a, button, [data-cursor], input, select, label, canvas') as HTMLElement | null;
      if (!el) {
        target = 1;
        setLabel('');
      }
    };
    const loop = () => {
      if (visible && ++frame % 15 === 0) recheck();
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      scale += (target - scale) * 0.15;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.addEventListener('pointerleave', leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('pointerleave', leave);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, []);

  if (!enabled) return null;
  return (
    <>
      <div ref={ring} className="fixed left-0 top-0 z-[130] pointer-events-none w-9 h-9 rounded-full border border-amber/70 opacity-0 transition-opacity duration-300 flex items-center justify-center mix-blend-screen">
        {label && <span className="font-mono text-[3.2px] tracking-[0.12em] text-amber whitespace-nowrap">{label}</span>}
      </div>
      <div ref={dot} className="fixed left-0 top-0 z-[131] pointer-events-none w-1.5 h-1.5 rounded-full bg-amber opacity-0 shadow-[0_0_10px_rgba(242,165,65,0.9)]" />
    </>
  );
}
