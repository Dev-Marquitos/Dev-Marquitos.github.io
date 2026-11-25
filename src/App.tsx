import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { MenuOverlay } from './components/layout/MenuOverlay';
import { Cursor } from './components/layout/Cursor';
import { RouteTransition } from './components/layout/RouteTransition';
import { SoundConsole } from './components/layout/SoundConsole';
import { Subtitles } from './components/layout/Subtitles';
import { TourHud } from './components/experience/TourHud';
import { Assistant } from './components/assistant/Assistant';
import Intro from './components/experience/Intro';
import Outro from './components/experience/Outro';
import { useExperience } from './stores/useExperience';
import { initSmoothScroll } from './lib/smoothScroll';
import { stopNarration } from './stores/useNarration';

const Home = lazy(() => import('./pages/Home'));
const History = lazy(() => import('./pages/History'));
const Museum = lazy(() => import('./pages/Museum'));
const Network = lazy(() => import('./pages/Network'));
const Voices = lazy(() => import('./pages/Voices'));
const Archive = lazy(() => import('./pages/Archive'));
const Live = lazy(() => import('./pages/Live'));
const Credits = lazy(() => import('./pages/Credits'));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="font-mono text-xs tracking-[0.35em] uppercase text-amber blink-soft">Sintonizando…</span>
    </div>
  );
}

function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const s = useExperience.getState();
      if (s.phase !== 'site') return;
      if (e.key === 'm' || e.key === 'M') s.setMusicOn(!s.musicOn);
      if (e.key === 'n' || e.key === 'N') s.setNarratorOn(!s.narratorOn);
      if (e.key === 'Escape') stopNarration();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/** Pestaña oculta: un guiño radial en el título. */
function useTabTitle() {
  useEffect(() => {
    let saved = document.title;
    const onVis = () => {
      if (document.hidden) {
        saved = document.title;
        document.title = '📻 Seguimos al aire… · Radio Pío XII';
      } else {
        document.title = saved;
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);
}

export default function App() {
  const location = useLocation();
  const phase = useExperience((s) => s.phase);

  useEffect(() => {
    initSmoothScroll();
    const params = new URLSearchParams(window.location.search);
    if (params.get('intro') === '0') useExperience.getState().setPhase('site');
  }, []);
  useShortcuts();
  useTabTitle();

  return (
    <>
      <div id="site-shell" className="relative min-h-screen bg-ink text-bone">
        <Navbar />
        <MenuOverlay />
        <main>
          <Suspense fallback={<PageFallback />}>
            <AnimatePresence mode="wait">
              <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                <Routes location={location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/historia" element={<History />} />
                  <Route path="/museo" element={<Museum />} />
                  <Route path="/red-minera" element={<Network />} />
                  <Route path="/voces" element={<Voices />} />
                  <Route path="/archivo" element={<Archive />} />
                  <Route path="/en-vivo" element={<Live />} />
                  <Route path="/creditos" element={<Credits />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>
        {phase === 'site' && (
          <>
            <SoundConsole />
            <Assistant />
            <TourHud />
          </>
        )}
        <RouteTransition />
      </div>
      <Subtitles />
      <Intro />
      <Outro />
      <div className="film-grain" aria-hidden />
      <div className="vignette" aria-hidden />
      <Cursor />
    </>
  );
}
