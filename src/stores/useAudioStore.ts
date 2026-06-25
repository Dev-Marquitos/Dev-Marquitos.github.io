import { create } from 'zustand';

interface AudioState {
  isPlaying: boolean;
  volume: number;
  streamUrl: string;
  setPlaying: (playing: boolean) => void;
  setVolume: (vol: number) => void;
  setStreamUrl: (url: string) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isPlaying: false,
  volume: 0.8,
  streamUrl: 'https://streaming01.radiosenlinea.com.ar/8794/stream',
  setPlaying: (playing) => set({ isPlaying: playing }),
  setVolume: (vol) => set({ volume: vol }),
  setStreamUrl: (url) => set({ streamUrl: url }),
}));
