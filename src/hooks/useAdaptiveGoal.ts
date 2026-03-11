import { useHydrationStore } from '../store/useHydrationStore';
import { calculateAdaptiveGoal, type GoalBreakdown } from '../services/hydrationRecommendationService';

export function useAdaptiveGoal(): GoalBreakdown {
  const { weightKg, activityLevel, weatherAdjust } = useHydrationStore((s) => s.userProfile);
  return calculateAdaptiveGoal(weightKg, activityLevel, weatherAdjust);
}
