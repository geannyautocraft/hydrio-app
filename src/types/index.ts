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
export type PlanType = 'free' | 'premium_subscription' | 'lifetime';

export interface PremiumState {
  plan: PlanType;
  subscribedAt?: string;
  billingCycle?: 'monthly' | 'yearly';
}

export type PremiumFeature =
  | 'advanced_insights'
  | 'extended_history'
  | 'data_export'
  | 'advanced_charts'
  | 'multiple_profiles'
  | 'smart_coach';

export const PREMIUM_FEATURES: Record<PremiumFeature, { label: string; description: string }> = {
  smart_coach: { label: 'Smart Hydration Coach', description: 'Personalized coaching and recommendations' },
  advanced_insights: { label: 'Advanced Insights', description: 'Consistency score, monthly trends, and statistics' },
  extended_history: { label: 'Unlimited History', description: 'Browse your full hydration history' },
  data_export: { label: 'Data Export', description: 'Export your data as JSON or CSV' },
  advanced_charts: { label: 'Advanced Charts', description: 'Monthly trends and goal comparison charts' },
  multiple_profiles: { label: 'Multiple Profiles', description: 'Create profiles for different routines' },
};

export const PREMIUM_PRICING = {
  monthly: { price: 0.99, label: '$0.99/month' },
  yearly: { price: 4.99, label: '$4.99/year', savings: '58%' },
  lifetime: { price: 9.99, label: '$9.99 once' },
} as const;

// Analytics event types
export type AnalyticsEvent =
  | 'water_logged'
  | 'goal_reached'
  | 'premium_prompt_opened'
  | 'premium_upgrade_clicked'
  | 'coach_suggestion_shown'
  | 'feedback_sent';

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
