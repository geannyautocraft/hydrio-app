import { useTranslation } from 'react-i18next';
import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';

export interface SmartSuggestion {
  message: string;
  type: 'tip' | 'nudge';
}

export function useSmartSuggestions(): SmartSuggestion | null {
  const { t } = useTranslation();
  const goalMl = useHydrationStore((s) => s.goalMl);
  const todayRecord = useTodayRecord();
  const currentMl = todayRecord.totalMl;
  const remaining = goalMl - currentMl;

  if (currentMl >= goalMl || currentMl === 0) return null;

  if (remaining <= 500 && remaining > 0) {
    return {
      message: t('suggestions.awayFromGoal', { remaining }),
      type: 'tip',
    };
  }

  // Suggest a drink amount to stay on track
  const now = new Date();
  const hoursLeft = 23 - now.getHours();
  if (hoursLeft > 0) {
    const perHour = Math.round(remaining / hoursLeft);
    const suggested = Math.min(Math.max(Math.round(perHour / 50) * 50, 100), 500);
    return {
      message: t('suggestions.drinkNow', { amount: suggested }),
      type: 'nudge',
    };
  }

  return null;
}
