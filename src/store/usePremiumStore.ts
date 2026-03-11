import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlanType, PremiumFeature } from '../types';

interface PremiumState {
  plan: PlanType;
  subscribedAt: string | null;
  billingCycle: 'monthly' | 'yearly' | null;
  setPlan: (plan: PlanType, billingCycle?: 'monthly' | 'yearly') => void;
  isPremium: () => boolean;
  hasFeature: (feature: PremiumFeature) => boolean;
  downgrade: () => void;
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      plan: 'free',
      subscribedAt: null,
      billingCycle: null,

      setPlan: (plan: PlanType, billingCycle?: 'monthly' | 'yearly') =>
        set({
          plan,
          subscribedAt: plan !== 'free' ? new Date().toISOString() : null,
          billingCycle: billingCycle ?? null,
        }),

      isPremium: () => get().plan !== 'free',

      hasFeature: (_feature: PremiumFeature) => get().plan !== 'free',

      downgrade: () => set({ plan: 'free', subscribedAt: null, billingCycle: null }),
    }),
    {
      name: 'hydrio-premium',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2) {
          const oldPlan = state.plan as string;
          return {
            ...state,
            plan: oldPlan === 'premium' ? 'lifetime' : 'free',
            subscribedAt: oldPlan === 'premium' ? new Date().toISOString() : null,
            billingCycle: null,
          };
        }
        return state;
      },
    }
  )
);
