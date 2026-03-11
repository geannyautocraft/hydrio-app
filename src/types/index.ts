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

// Premium types
export type PlanType = 'free' | 'premium';

export interface PremiumState {
  plan: PlanType;
}

export type PremiumFeature =
  | 'advanced_insights'
  | 'extended_history'
  | 'data_export'
  | 'advanced_charts'
  | 'multiple_profiles';

export const PREMIUM_FEATURES: Record<PremiumFeature, { label: string; description: string }> = {
  advanced_insights: { label: 'Advanced Insights', description: 'Deeper analysis of your hydration patterns' },
  extended_history: { label: 'Extended History', description: 'Browse 30-day and all-time history' },
  data_export: { label: 'Data Export', description: 'Export your data as JSON or CSV' },
  advanced_charts: { label: 'Advanced Charts', description: 'Monthly trends and goal comparison charts' },
  multiple_profiles: { label: 'Multiple Profiles', description: 'Create profiles for different routines' },
};

// Profile types
export interface HydrationProfile {
  id: string;
  name: string;
  goalMl: number;
  activityLevel: ActivityLevel;
  reminderInterval: number;
  icon: string;
}

export const DEFAULT_PROFILES: HydrationProfile[] = [
  { id: 'default', name: 'Default', goalMl: 2000, activityLevel: 'moderate', reminderInterval: 120, icon: '💧' },
  { id: 'workday', name: 'Workday', goalMl: 2500, activityLevel: 'sedentary', reminderInterval: 90, icon: '💼' },
  { id: 'workout', name: 'Workout Days', goalMl: 3500, activityLevel: 'active', reminderInterval: 60, icon: '🏋️' },
  { id: 'summer', name: 'Summer Routine', goalMl: 3000, activityLevel: 'moderate', reminderInterval: 60, icon: '☀️' },
];
