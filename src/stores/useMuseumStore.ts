import { create } from 'zustand';

interface MuseumState {
  selected: string | null;
  hovered: string | null;
  inspect: boolean;
  touring: boolean;
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  setInspect: (v: boolean) => void;
  setTouring: (v: boolean) => void;
}

export const useMuseumStore = create<MuseumState>((set) => ({
  selected: null,
  hovered: null,
  inspect: false,
  touring: false,
  select: (selected) => set({ selected, inspect: false }),
  hover: (hovered) => set({ hovered }),
  setInspect: (inspect) => set({ inspect }),
  setTouring: (touring) => set({ touring }),
}));
