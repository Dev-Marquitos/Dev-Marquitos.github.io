import { create } from 'zustand';
import { useExperience } from '../../stores/useExperience';
import { narrate, stopNarration } from '../../stores/useNarration';
import { useRadio } from '../../stores/useRadio';
import { useMuseumStore } from '../../stores/useMuseumStore';
import { NARRATION } from '../../data/narration';
import { scrollToTarget, scrollToTop } from '../../lib/smoothScroll';
import { runMuseumTour } from '../../lib/museumTour';

interface TourState {
  active: boolean;
  step: number;
  total: number;
  label: string;
}

export const useTour = create<TourState>(() => ({ active: false, step: 0, total: 0, label: '' }));

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const alive = () => useTour.getState().active;

function go(path: string) {
  const hash = '#' + path;
  if (window.location.hash !== hash) window.location.hash = hash;
}

/** Desplaza el documento hasta el final de forma lenta mientras dure la narración. */
async function slowScroll(selector: string | null, seconds: number) {
  await wait(300);
  const el = selector ? (document.querySelector(selector) as HTMLElement | null) : null;
  const end = el ? el.offsetTop + el.offsetHeight - window.innerHeight : document.documentElement.scrollHeight - window.innerHeight;
  await scrollToTarget(Math.max(0, end), seconds);
}

interface Step {
  label: string;
  path: string;
  run: () => Promise<unknown>;
}

const STEPS: Step[] = [
  {
    label: 'Inicio',
    path: '/',
    run: () => Promise.all([narrate(NARRATION.homeHero, 'tour-home', { force: true }), slowScroll('#hero', 16)]),
  },
  {
    label: 'Historia',
    path: '/historia',
    run: () => Promise.all([narrate(NARRATION.history, 'tour-history', { force: true }), slowScroll('#timeline', 42)]),
  },
  {
    label: 'Museo 3D',
    path: '/museo',
    run: async () => {
      await narrate(NARRATION.museum, 'tour-museum', { force: true });
      if (alive()) await runMuseumTour({ shortTexts: true, isAlive: alive });
    },
  },
  {
    label: 'Red minera',
    path: '/red-minera',
    run: async () => {
      window.dispatchEvent(new CustomEvent('pio12:chain'));
      await Promise.all([narrate(NARRATION.network, 'tour-network', { force: true }), slowScroll(null, 22)]);
    },
  },
  {
    label: 'Voces',
    path: '/voces',
    run: () => Promise.all([narrate(NARRATION.voices, 'tour-voices', { force: true }), slowScroll(null, 24)]),
  },
  {
    label: 'En vivo',
    path: '/en-vivo',
    run: async () => {
      useRadio.getState().play();
      await narrate(NARRATION.live, 'tour-live', { force: true });
      await wait(9000);
      useRadio.getState().stop();
    },
  },
];

export async function startGuidedTour() {
  if (useTour.getState().active) return;
  const exp = useExperience.getState();
  if (!exp.audioUnlocked) exp.unlockAudio();
  useTour.setState({ active: true, step: 0, total: STEPS.length, label: STEPS[0].label });
  exp.setTourActive(true);
  for (let i = 0; i < STEPS.length; i++) {
    if (!alive()) break;
    const s = STEPS[i];
    useTour.setState({ step: i, label: s.label });
    go(s.path);
    await wait(1500);
    scrollToTop(true);
    if (!alive()) break;
    await s.run();
    if (!alive()) break;
    await wait(1200);
  }
  const finished = alive();
  stopGuidedTour();
  if (finished) useExperience.getState().setPhase('outro');
}

export function stopGuidedTour() {
  useTour.setState({ active: false });
  useExperience.getState().setTourActive(false);
  useMuseumStore.getState().setTouring(false);
  stopNarration();
}
