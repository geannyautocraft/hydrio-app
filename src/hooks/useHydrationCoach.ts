import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';
import { generateCoachSuggestions, type CoachSuggestion } from '../services/coachService';
import { trackEvent } from '../services/analyticsService';

export interface CoachMessage {
  text: string;
  type: CoachSuggestion['type'];
}

export function useHydrationCoach(): CoachMessage[] {
  const { t } = useTranslation();
  const goalMl = useHydrationStore((s) => s.goalMl);
  const weightKg = useHydrationStore((s) => s.userProfile.weightKg);
  const todayRecord = useTodayRecord();

  return useMemo(() => {
    const suggestions = generateCoachSuggestions({
      currentMl: todayRecord.totalMl,
      goalMl,
      weightKg,
      entries: todayRecord.entries,
    });

    if (suggestions.length > 0) {
      trackEvent('coach_suggestion_shown');
    }

    return suggestions.map((s) => ({
      text: t(s.messageKey, s.messageParams),
      type: s.type,
    }));
  }, [todayRecord.totalMl, todayRecord.entries, goalMl, weightKg, t]);
}
