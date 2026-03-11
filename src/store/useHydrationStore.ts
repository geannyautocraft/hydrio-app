import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DayRecord, WaterEntry, UserProfile, NotificationSettings } from '../types';
import {
  MAX_SINGLE_ENTRY_ML,
  DEFAULT_GOAL_ML,
  DEFAULT_PRESETS,
  WEIGHT_TO_ML_FACTOR,
  DEFAULT_REMINDER_INTERVAL,
} from '../types';
import { getTodayKey } from '../utils/date';

const EMPTY_ENTRIES: WaterEntry[] = [];

const createEmptyDayRecord = (date: string): DayRecord => ({
  date,
  entries: EMPTY_ENTRIES,
  totalMl: 0,
});

interface HydrationState {
  goalMl: number;
  records: Record<string, DayRecord>;
  quickPresets: number[];
  userProfile: UserProfile;
  notifications: NotificationSettings;
}

interface HydrationActions {
  addEntry: (amount: number) => void;
  removeEntry: (entryId: string) => void;
  editEntry: (entryId: string, newAmount: number) => void;
  setGoal: (goalMl: number) => void;
  setQuickPresets: (presets: number[]) => void;
  setWeight: (weightKg: number | null) => void;
  setCustomGoal: (goalMl: number | null) => void;
  setNotifications: (settings: Partial<NotificationSettings>) => void;
}

export const useHydrationStore = create<HydrationState & HydrationActions>()(
  persist(
    (set) => ({
      goalMl: DEFAULT_GOAL_ML,
      records: {},
      quickPresets: DEFAULT_PRESETS,
      userProfile: {
        weightKg: null,
        recommendedGoal: DEFAULT_GOAL_ML,
        customGoal: null,
      },
      notifications: {
        enabled: false,
        intervalMinutes: DEFAULT_REMINDER_INTERVAL,
      },

      addEntry: (amount: number) => {
        if (amount <= 0 || amount > MAX_SINGLE_ENTRY_ML) return;

        const today = getTodayKey();
        const entry: WaterEntry = {
          id: crypto.randomUUID(),
          amount,
          timestamp: new Date().toISOString(),
        };

        set((state) => {
          const dayRecord = state.records[today] ?? createEmptyDayRecord(today);
          return {
            records: {
              ...state.records,
              [today]: {
                ...dayRecord,
                entries: [...dayRecord.entries, entry],
                totalMl: dayRecord.totalMl + amount,
              },
            },
          };
        });
      },

      removeEntry: (entryId: string) => {
        const today = getTodayKey();
        set((state) => {
          const dayRecord = state.records[today];
          if (!dayRecord) return state;
          const entry = dayRecord.entries.find((e) => e.id === entryId);
          if (!entry) return state;
          const filtered = dayRecord.entries.filter((e) => e.id !== entryId);
          return {
            records: {
              ...state.records,
              [today]: {
                ...dayRecord,
                entries: filtered,
                totalMl: dayRecord.totalMl - entry.amount,
              },
            },
          };
        });
      },

      editEntry: (entryId: string, newAmount: number) => {
        if (newAmount <= 0 || newAmount > MAX_SINGLE_ENTRY_ML) return;

        const today = getTodayKey();
        set((state) => {
          const dayRecord = state.records[today];
          if (!dayRecord) return state;
          const entry = dayRecord.entries.find((e) => e.id === entryId);
          if (!entry) return state;
          const diff = newAmount - entry.amount;
          const updatedEntries = dayRecord.entries.map((e) =>
            e.id === entryId ? { ...e, amount: newAmount } : e
          );
          return {
            records: {
              ...state.records,
              [today]: {
                ...dayRecord,
                entries: updatedEntries,
                totalMl: dayRecord.totalMl + diff,
              },
            },
          };
        });
      },

      setGoal: (goalMl: number) => set({ goalMl }),

      setQuickPresets: (presets: number[]) => set({ quickPresets: presets }),

      setWeight: (weightKg: number | null) =>
        set((state) => {
          const recommendedGoal = weightKg
            ? Math.round(weightKg * WEIGHT_TO_ML_FACTOR)
            : DEFAULT_GOAL_ML;
          const newGoal = state.userProfile.customGoal ?? recommendedGoal;
          return {
            userProfile: {
              ...state.userProfile,
              weightKg,
              recommendedGoal,
            },
            goalMl: newGoal,
          };
        }),

      setCustomGoal: (goalMl: number | null) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            customGoal: goalMl,
          },
          goalMl: goalMl ?? state.userProfile.recommendedGoal,
        })),

      setNotifications: (settings: Partial<NotificationSettings>) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),
    }),
    {
      name: 'hydrio-storage',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as HydrationState;
        if (version < 2) {
          return {
            ...state,
            userProfile: state.userProfile ?? {
              weightKg: null,
              recommendedGoal: state.goalMl ?? DEFAULT_GOAL_ML,
              customGoal: null,
            },
            notifications: state.notifications ?? {
              enabled: false,
              intervalMinutes: DEFAULT_REMINDER_INTERVAL,
            },
          };
        }
        return state;
      },
    }
  )
);

export function useTodayRecord(): DayRecord {
  const today = getTodayKey();
  return useHydrationStore((s) => s.records[today]) ?? createEmptyDayRecord(today);
}
