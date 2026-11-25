import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initSmoothScroll(native = false) {
  if (lenis) return lenis;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  lenis = new Lenis({
    // interpolación corta: suave pero sin sensación de "pesadez"
    lerp: 0.16,
    wheelMultiplier: 1.1,
    smoothWheel: !reduce && !native,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export const getLenis = () => lenis;

export function scrollToTop(immediate = true) {
  if (lenis) lenis.scrollTo(0, { immediate, force: true });
  else window.scrollTo(0, 0);
}

/** Desplaza hasta una posición o elemento y resuelve al terminar. */
export function scrollToTarget(target: number | string | HTMLElement, duration = 2): Promise<void> {
  return new Promise((resolve) => {
    if (!lenis) {
      if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
      else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(resolve, duration * 1000);
      return;
    }
    lenis.scrollTo(target, { duration, force: true, onComplete: () => resolve() });
  });
}

export function setScrollLocked(locked: boolean) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}
