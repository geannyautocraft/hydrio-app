import type { ActivityLevel } from '../types';
import { WEIGHT_TO_ML_FACTOR, ACTIVITY_MULTIPLIERS, WEATHER_MULTIPLIER } from '../types';

export interface GoalBreakdown {
  baseGoal: number;
  activityAdjustment: number;
  weatherAdjustment: number;
  finalGoal: number;
}

export function calculateAdaptiveGoal(
  weightKg: number | null,
  activityLevel: ActivityLevel,
  weatherAdjust: boolean
): GoalBreakdown {
  const baseGoal = weightKg ? Math.round(weightKg * WEIGHT_TO_ML_FACTOR) : 2000;
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  const afterActivity = Math.round(baseGoal * activityMultiplier);
  const activityAdjustment = afterActivity - baseGoal;

  const weatherMultiplier = weatherAdjust ? WEATHER_MULTIPLIER : 1;
  const finalGoal = Math.round(afterActivity * weatherMultiplier);
  const weatherAdjustment = finalGoal - afterActivity;

  return {
    baseGoal,
    activityAdjustment,
    weatherAdjustment,
    finalGoal,
  };
}

export function getActivityLabel(level: ActivityLevel): string {
  switch (level) {
    case 'sedentary': return 'Sedentary';
    case 'moderate': return 'Moderate';
    case 'active': return 'Active';
  }
}
