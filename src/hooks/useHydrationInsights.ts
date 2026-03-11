import { useTranslation } from 'react-i18next';
import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';
import { useSmartSuggestions } from './useSmartSuggestions';

export interface HydrationInsight {
  message: string;
  type: 'info' | 'success' | 'warning';
}

export function useHydrationInsights(): HydrationInsight[] {
  const { t } = useTranslation();
  const goalMl = useHydrationStore((s) => s.goalMl);
  const todayRecord = useTodayRecord();
  const presets = useHydrationStore((s) => s.quickPresets);
  const suggestion = useSmartSuggestions();
  const currentMl = todayRecord.totalMl;
  const remaining = goalMl - currentMl;
  const ratio = goalMl > 0 ? currentMl / goalMl : 0;

  const insights: HydrationInsight[] = [];

  if (currentMl === 0) {
    insights.push({ message: t('insights.startDay'), type: 'info' });
    return insights;
  }

  if (ratio >= 2) {
    insights.push({ message: t('insights.aboveGoal'), type: 'warning' });
    return insights;
  }

  if (ratio >= 1.5) {
    insights.push({ message: t('insights.wellAbove'), type: 'warning' });
    return insights;
  }

  if (ratio >= 1) {
    insights.push({ message: t('insights.goalReached'), type: 'success' });
    return insights;
  }

  // Smart suggestion: find a preset that would reach or get close to the goal
  const bestPreset = presets.find((p) => p >= remaining);
  if (bestPreset) {
    insights.push({
      message: t('insights.drinkToReach', { amount: bestPreset }),
      type: 'info',
    });
  } else if (remaining <= 250) {
    insights.push({ message: t('insights.almostThere', { remaining }), type: 'info' });
  } else {
    insights.push({ message: t('insights.awayFromGoal', { remaining }), type: 'info' });
  }

  // Add smart suggestion as secondary insight
  if (suggestion) {
    insights.push({ message: suggestion.message, type: 'info' });
  }

  return insights;
}
