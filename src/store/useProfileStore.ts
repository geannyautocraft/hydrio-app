import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HydrationProfile } from '../types';
import { DEFAULT_PROFILES } from '../types';

interface ProfileState {
  profiles: HydrationProfile[];
  activeProfileId: string;
  setActiveProfile: (id: string) => void;
  addProfile: (profile: HydrationProfile) => void;
  updateProfile: (id: string, updates: Partial<HydrationProfile>) => void;
  removeProfile: (id: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profiles: DEFAULT_PROFILES,
      activeProfileId: 'default',

      setActiveProfile: (id: string) => set({ activeProfileId: id }),

      addProfile: (profile: HydrationProfile) =>
        set((state) => ({
          profiles: [...state.profiles, profile],
        })),

      updateProfile: (id: string, updates: Partial<HydrationProfile>) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      removeProfile: (id: string) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId: state.activeProfileId === id ? 'default' : state.activeProfileId,
        })),
    }),
    {
      name: 'hydrio-profiles',
    }
  )
);
