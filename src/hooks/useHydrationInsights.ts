import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';
import { useSmartSuggestions } from './useSmartSuggestions';

export interface HydrationInsight {
  message: string;
  type: 'info' | 'success' | 'warning';
}

export function useHydrationInsights(): HydrationInsight[] {
  const goalMl = useHydrationStore((s) => s.goalMl);
  const todayRecord = useTodayRecord();
  const presets = useHydrationStore((s) => s.quickPresets);
  const suggestion = useSmartSuggestions();
  const currentMl = todayRecord.totalMl;
  const remaining = goalMl - currentMl;
  const ratio = goalMl > 0 ? currentMl / goalMl : 0;

  const insights: HydrationInsight[] = [];

  if (currentMl === 0) {
    insights.push({ message: 'Start your day with a glass of water!', type: 'info' });
    return insights;
  }

  if (ratio >= 2) {
    insights.push({ message: "You're significantly above your goal. Stay balanced.", type: 'warning' });
    return insights;
  }

  if (ratio >= 1.5) {
    insights.push({ message: "That's well above your goal. You're very hydrated!", type: 'warning' });
    return insights;
  }

  if (ratio >= 1) {
    insights.push({ message: 'Goal reached! Great hydration today!', type: 'success' });
    return insights;
  }

  // Smart suggestion: find a preset that would reach or get close to the goal
  const bestPreset = presets.find((p) => p >= remaining);
  if (bestPreset) {
    insights.push({
      message: `If you drink ${bestPreset} ml now, you'll reach your goal!`,
      type: 'info',
    });
  } else if (remaining <= 250) {
    insights.push({ message: `Almost there! Only ${remaining} ml to go.`, type: 'info' });
  } else {
    insights.push({ message: `You are ${remaining} ml away from your goal.`, type: 'info' });
  }

  // Add smart suggestion as secondary insight
  if (suggestion) {
    insights.push({ message: suggestion.message, type: 'info' });
  }

  return insights;
}
