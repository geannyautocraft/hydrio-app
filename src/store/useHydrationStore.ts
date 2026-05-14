import { create } from 'zustand';
import type { DayRecord, WaterEntry, UserProfile, NotificationSettings, ActivityLevel } from '../types';
import {
  MAX_SINGLE_ENTRY_ML,
  DEFAULT_GOAL_ML,
  DEFAULT_PRESETS,
  WEIGHT_TO_ML_FACTOR,
  DEFAULT_REMINDER_INTERVAL,
  ACTIVITY_MULTIPLIERS,
  WEATHER_MULTIPLIER,
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
  setActivityLevel: (level: ActivityLevel) => void;
  setWeatherAdjust: (enabled: boolean) => void;
  setNotifications: (settings: Partial<NotificationSettings>) => void;
}

function calcRecommendedGoal(weightKg: number | null, activityLevel: ActivityLevel, weatherAdjust: boolean): number {
  if (!weightKg) return DEFAULT_GOAL_ML;
  let goal = weightKg * WEIGHT_TO_ML_FACTOR;
  goal *= ACTIVITY_MULTIPLIERS[activityLevel];
  if (weatherAdjust) goal *= WEATHER_MULTIPLIER;
  return Math.round(goal);
}

export const useHydrationStore = create<HydrationState & HydrationActions>()(
  (set) => ({
      goalMl: DEFAULT_GOAL_ML,
      records: {},
      quickPresets: DEFAULT_PRESETS,
      userProfile: {
        weightKg: null,
        recommendedGoal: DEFAULT_GOAL_ML,
        customGoal: null,
        activityLevel: 'moderate' as ActivityLevel,
        weatherAdjust: false,
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
          const recommendedGoal = calcRecommendedGoal(weightKg, state.userProfile.activityLevel, state.userProfile.weatherAdjust);
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

      setActivityLevel: (level: ActivityLevel) =>
        set((state) => {
          const recommendedGoal = calcRecommendedGoal(state.userProfile.weightKg, level, state.userProfile.weatherAdjust);
          return {
            userProfile: {
              ...state.userProfile,
              activityLevel: level,
              recommendedGoal,
            },
            goalMl: state.userProfile.customGoal ?? recommendedGoal,
          };
        }),

      setWeatherAdjust: (enabled: boolean) =>
        set((state) => {
          const recommendedGoal = calcRecommendedGoal(state.userProfile.weightKg, state.userProfile.activityLevel, enabled);
          return {
            userProfile: {
              ...state.userProfile,
              weatherAdjust: enabled,
              recommendedGoal,
            },
            goalMl: state.userProfile.customGoal ?? recommendedGoal,
          };
        }),

      setNotifications: (settings: Partial<NotificationSettings>) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),
    })
);

export function useTodayRecord(): DayRecord {
  const today = getTodayKey();
  return useHydrationStore((s) => s.records[today]) ?? createEmptyDayRecord(today);
}
