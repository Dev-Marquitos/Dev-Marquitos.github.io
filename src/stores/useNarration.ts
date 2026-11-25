import { create } from 'zustand';
import { narrator } from '../lib/narrator';
import { audio } from '../lib/audio/engine';
import { useExperience } from './useExperience';

interface NarrationState {
  activeId: string | null;
  line: string | null;
  index: number;
  total: number;
}

export const useNarration = create<NarrationState>(() => ({
  activeId: null,
  line: null,
  index: 0,
  total: 0,
}));

narrator.on((e) => {
  if (e.type === 'start') {
    useNarration.setState({ activeId: e.id, line: null, index: 0, total: 0 });
    audio.duck(true);
  } else if (e.type === 'line') {
    useNarration.setState({ line: e.text, index: e.index, total: e.total });
  } else if (e.type === 'end') {
    if (useNarration.getState().activeId === e.id) {
      useNarration.setState({ activeId: null, line: null, index: 0, total: 0 });
    }
    audio.duck(false);
  }
});

/**
 * Narra un texto respetando las preferencias del visitante.
 * - narrador activo + sonido: voz sintetizada con subtítulos.
 * - narrador inactivo pero `force`: solo subtítulos cronometrados.
 * Devuelve `true` si terminó completo.
 */
export function narrate(text: string, id: string, opts: { force?: boolean } = {}) {
  const s = useExperience.getState();
  const voiced = s.narratorOn && s.soundOn;
  if (!voiced && !opts.force) return Promise.resolve(false);
  return narrator.speak(text, id, voiced);
}

export function stopNarration() {
  narrator.cancel();
}

/** Alterna narrar / detener para un botón "Escuchar". */
export function toggleNarration(text: string, id: string) {
  if (useNarration.getState().activeId === id) {
    narrator.cancel();
    return;
  }
  const s = useExperience.getState();
  if (!s.audioUnlocked) s.unlockAudio();
  void narrator.speak(text, id, s.soundOn);
}
