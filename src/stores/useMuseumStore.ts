import { create } from 'zustand';

interface MuseumState {
  selectedObject: string | null;
  selectObject: (id: string | null) => void;
}

export const useMuseumStore = create<MuseumState>((set) => ({
  selectedObject: null,
  selectObject: (id) => set({ selectedObject: id }),
}));
