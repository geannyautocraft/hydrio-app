import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';
import { generateCoachSuggestions, type CoachSuggestion } from '../services/coachService';
import { trackEvent } from '../services/analyticsService';
import {
  getCachedTodayHealthSummary,
  getHealthStatus,
  HEALTH_TODAY_UPDATED_EVENT,
  isHealthConnectAvailableOnPlatform,
  readTodayHealthSummary,
  type HealthTodaySummary,
} from '../services/healthService';

export interface CoachMessage {
  text: string;
  type: CoachSuggestion['type'];
}

export function useHydrationCoach(): CoachMessage[] {
  const { t } = useTranslation();
  const goalMl = useHydrationStore((s) => s.goalMl);
  const weightKg = useHydrationStore((s) => s.userProfile.weightKg);
  const todayRecord = useTodayRecord();
  const [healthSummary, setHealthSummary] = useState<HealthTodaySummary | null>(() => getCachedTodayHealthSummary());

  useEffect(() => {
    const handleHealthUpdate = (event: Event) => {
      const summary = (event as CustomEvent<HealthTodaySummary>).detail;
      setHealthSummary(summary);
    };

    window.addEventListener(HEALTH_TODAY_UPDATED_EVENT, handleHealthUpdate);

    let cancelled = false;
    const refreshHealthSummary = async () => {
      if (!isHealthConnectAvailableOnPlatform()) return;

      try {
        const status = await getHealthStatus();
        if (!status.granted) return;

        const summary = await readTodayHealthSummary();
        if (!cancelled) {
          setHealthSummary(summary);
        }
      } catch {
        // Health data should enrich the coach, not block the dashboard.
      }
    };

    refreshHealthSummary();

    return () => {
      cancelled = true;
      window.removeEventListener(HEALTH_TODAY_UPDATED_EVENT, handleHealthUpdate);
    };
  }, []);

  return useMemo(() => {
    const suggestions = generateCoachSuggestions({
      currentMl: todayRecord.totalMl,
      goalMl,
      weightKg,
      entries: todayRecord.entries,
      activity: healthSummary
        ? {
            activeCaloriesKcal: healthSummary.activeCaloriesKcal,
            extraWaterMl: healthSummary.extraWaterMl,
            exerciseCount: healthSummary.exerciseCount,
          }
        : null,
    });

    if (suggestions.length > 0) {
      trackEvent('coach_suggestion_shown');
    }

    return suggestions.map((s) => ({
      text: t(s.messageKey, s.messageParams),
      type: s.type,
    }));
  }, [todayRecord.totalMl, todayRecord.entries, goalMl, weightKg, healthSummary, t]);
}
