import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlanType, PremiumFeature } from '../types';

interface PremiumState {
  plan: PlanType;
  setPlan: (plan: PlanType) => void;
  isPremium: () => boolean;
  hasFeature: (feature: PremiumFeature) => boolean;
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      plan: 'free',

      setPlan: (plan: PlanType) => set({ plan }),

      isPremium: () => get().plan === 'premium',

      hasFeature: (_feature: PremiumFeature) => get().plan === 'premium',
    }),
    {
      name: 'hydrio-premium',
    }
  )
);
