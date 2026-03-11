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

export type ActivityLevel = 'sedentary' | 'moderate' | 'active';

export interface UserProfile {
  weightKg: number | null;
  recommendedGoal: number;
  customGoal: number | null;
  activityLevel: ActivityLevel;
  weatherAdjust: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  intervalMinutes: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

export interface AchievementProgress {
  achievements: Record<string, string | null>; // id -> unlockedAt ISO string or null
}

export const MAX_SINGLE_ENTRY_ML = 2000;
export const MIN_GOAL_ML = 100;
export const MAX_GOAL_ML = 10000;
export const DEFAULT_GOAL_ML = 2000;
export const DEFAULT_PRESETS = [100, 250, 500];
export const WEIGHT_TO_ML_FACTOR = 35;
export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 300;
export const DEFAULT_REMINDER_INTERVAL = 120; // minutes

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.0,
  moderate: 1.15,
  active: 1.3,
};

export const WEATHER_MULTIPLIER = 1.1;
