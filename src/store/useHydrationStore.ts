import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DayRecord, WaterEntry } from '../types';
import {
  MAX_SINGLE_ENTRY_ML,
  DEFAULT_GOAL_ML,
  DEFAULT_PRESETS,
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
}

interface HydrationActions {
  addEntry: (amount: number) => void;
  removeEntry: (entryId: string) => void;
  editEntry: (entryId: string, newAmount: number) => void;
  setGoal: (goalMl: number) => void;
  setQuickPresets: (presets: number[]) => void;
}

export const useHydrationStore = create<HydrationState & HydrationActions>()(
  persist(
    (set) => ({
      goalMl: DEFAULT_GOAL_ML,
      records: {},
      quickPresets: DEFAULT_PRESETS,

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
    }),
    {
      name: 'hydrio-storage',
      version: 1,
    }
  )
);

export function useTodayRecord(): DayRecord {
  const today = getTodayKey();
  return useHydrationStore((s) => s.records[today]) ?? createEmptyDayRecord(today);
}
