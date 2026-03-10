export interface WaterEntry {
  id: string;
  amount: number;
  timestamp: string;
}

export interface DayRecord {
  date: string;
  entries: WaterEntry[];
  totalMl: number;
}

export const MAX_SINGLE_ENTRY_ML = 2000;
export const MIN_GOAL_ML = 100;
export const MAX_GOAL_ML = 10000;
export const DEFAULT_GOAL_ML = 2000;
export const DEFAULT_PRESETS = [100, 250, 500];
