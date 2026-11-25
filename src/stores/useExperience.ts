import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { audio } from '../lib/audio/engine';
import { narrator } from '../lib/narrator';

export type Phase = 'intro' | 'site' | 'outro';

interface ExperienceState {
  phase: Phase;
  audioUnlocked: boolean;
  soundOn: boolean;
  musicOn: boolean;
  sfxOn: boolean;
  narratorOn: boolean;
  subtitlesOn: boolean;
  voiceURI: string | null;
  menuOpen: boolean;
  assistantOpen: boolean;
  tourActive: boolean;
  setPhase: (p: Phase) => void;
  unlockAudio: () => void;
  setSoundOn: (v: boolean) => void;
  setMusicOn: (v: boolean) => void;
  setSfxOn: (v: boolean) => void;
  setNarratorOn: (v: boolean) => void;
  setSubtitlesOn: (v: boolean) => void;
  setVoiceURI: (uri: string | null) => void;
  setMenuOpen: (v: boolean) => void;
  setAssistantOpen: (v: boolean) => void;
  setTourActive: (v: boolean) => void;
}

export const useExperience = create<ExperienceState>()(
  persist(
    (set, get) => ({
      phase: 'intro',
      audioUnlocked: false,
      soundOn: true,
      musicOn: true,
      sfxOn: true,
      narratorOn: true,
      subtitlesOn: true,
      voiceURI: null,
      menuOpen: false,
      assistantOpen: false,
      tourActive: false,
      setPhase: (phase) => set({ phase }),
      unlockAudio: () => {
        const ctx = audio.unlock();
        if (!ctx) return;
        const s = get();
        audio.setSoundOn(s.soundOn);
        audio.setSfxOn(s.sfxOn);
        audio.setMusicOn(s.musicOn);
        set({ audioUnlocked: true });
      },
      setSoundOn: (soundOn) => {
        if (soundOn && !get().audioUnlocked) get().unlockAudio();
        audio.setSoundOn(soundOn);
        if (!soundOn) narrator.cancel();
        set({ soundOn });
      },
      setMusicOn: (musicOn) => {
        if (!get().audioUnlocked) get().unlockAudio();
        audio.setMusicOn(musicOn);
        set({ musicOn });
      },
      setSfxOn: (sfxOn) => {
        audio.setSfxOn(sfxOn);
        set({ sfxOn });
      },
      setNarratorOn: (narratorOn) => {
        if (!narratorOn) narrator.cancel();
        set({ narratorOn });
      },
      setSubtitlesOn: (subtitlesOn) => set({ subtitlesOn }),
      setVoiceURI: (voiceURI) => {
        narrator.setPreferredVoice(voiceURI);
        set({ voiceURI });
      },
      setMenuOpen: (menuOpen) => set({ menuOpen }),
      setAssistantOpen: (assistantOpen) => set({ assistantOpen }),
      setTourActive: (tourActive) => set({ tourActive }),
    }),
    {
      name: 'pio12-preferencias',
      partialize: (s) => ({
        soundOn: s.soundOn,
        musicOn: s.musicOn,
        sfxOn: s.sfxOn,
        narratorOn: s.narratorOn,
        subtitlesOn: s.subtitlesOn,
        voiceURI: s.voiceURI,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.voiceURI) narrator.setPreferredVoice(state.voiceURI);
      },
    },
  ),
);

/** Sonido de interfaz (respeta preferencias y desbloqueo). */
export const sfx = {
  click: () => audio.click(),
  hover: () => audio.hover(),
  tick: () => audio.tick(),
  whoosh: () => audio.whoosh(),
  static: (d?: number, l?: number) => audio.staticBurst(d, l),
};
