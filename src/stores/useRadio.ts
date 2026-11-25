import { create } from 'zustand';
import { audio } from '../lib/audio/engine';
import { STATIONS, type Station } from '../data/stations';
import { useExperience } from './useExperience';

type Status = 'idle' | 'connecting' | 'playing' | 'error';

interface RadioState {
  status: Status;
  stationId: string;
  volume: number;
  analysable: boolean;
  error: string | null;
  listeners: number | null;
  peak: number | null;
  onAirSince: string | null;
  bitrate: number | null;
  play: (stationId?: string) => void;
  stop: () => void;
  toggle: () => void;
  setVolume: (v: number) => void;
  refreshStats: () => Promise<void>;
}

export const useRadio = create<RadioState>((set, get) => ({
  status: 'idle',
  stationId: STATIONS[0].id,
  volume: 0.85,
  analysable: true,
  error: null,
  listeners: null,
  peak: null,
  onAirSince: null,
  bitrate: null,
  play: (stationId) => {
    const id = stationId ?? get().stationId;
    const station = STATIONS.find((s) => s.id === id) ?? STATIONS[0];
    const exp = useExperience.getState();
    if (!exp.audioUnlocked) exp.unlockAudio();
    if (!exp.soundOn) exp.setSoundOn(true);
    set({ stationId: station.id, error: null, status: 'connecting' });
    audio.setStreamVolume(get().volume);
    void audio.playStream(station.stream);
    void get().refreshStats();
  },
  stop: () => {
    audio.stopStream();
    set({ status: 'idle' });
  },
  toggle: () => {
    const s = get().status;
    if (s === 'playing' || s === 'connecting') get().stop();
    else get().play();
  },
  setVolume: (volume) => {
    audio.setStreamVolume(volume);
    set({ volume });
  },
  refreshStats: async () => {
    const station: Station | undefined = STATIONS.find((s) => s.id === get().stationId);
    if (!station?.statusUrl) return;
    try {
      const controller = new AbortController();
      const t = window.setTimeout(() => controller.abort(), 6000);
      const res = await fetch(station.statusUrl, { signal: controller.signal, cache: 'no-store' });
      window.clearTimeout(t);
      const json = await res.json();
      let sources = json?.icestats?.source ?? [];
      if (!Array.isArray(sources)) sources = [sources];
      const src = sources.find((x: { listenurl?: string }) => x.listenurl?.includes(station.mount));
      if (src) {
        set({
          listeners: typeof src.listeners === 'number' ? src.listeners : null,
          peak: typeof src.listener_peak === 'number' ? src.listener_peak : null,
          onAirSince: src.stream_start_iso8601 ?? null,
          bitrate: typeof src['ice-bitrate'] === 'number' ? src['ice-bitrate'] : null,
        });
      } else {
        set({ listeners: null, peak: null, onAirSince: null });
      }
    } catch {
      /* estadísticas opcionales: se ignoran los fallos */
    }
  },
}));

audio.onStream((status, info) => {
  useRadio.setState({
    status,
    analysable: info?.analysable ?? useRadio.getState().analysable,
    error: info?.error ?? (status === 'error' ? 'La señal no está disponible en este momento.' : null),
  });
});
