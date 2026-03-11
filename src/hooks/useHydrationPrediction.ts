import { useTranslation } from 'react-i18next';
import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';

export interface HydrationPrediction {
  message: string;
  onTrack: boolean;
  estimatedCompletionTime: string | null;
}

export function useHydrationPrediction(): HydrationPrediction | null {
  const { t } = useTranslation();
  const goalMl = useHydrationStore((s) => s.goalMl);
  const todayRecord = useTodayRecord();
  const currentMl = todayRecord.totalMl;
  const entries = todayRecord.entries;

  if (entries.length === 0) return null;
  if (currentMl >= goalMl) {
    return { message: t('prediction.goalReached'), onTrack: true, estimatedCompletionTime: null };
  }

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  // Find the first entry time today
  const firstEntryTime = new Date(entries[0].timestamp);
  const startHour = firstEntryTime.getHours() + firstEntryTime.getMinutes() / 60;
  const hoursElapsed = currentHour - startHour;

  if (hoursElapsed <= 0) return null;

  const ratePerHour = currentMl / hoursElapsed;
  const remaining = goalMl - currentMl;
  const hoursNeeded = remaining / ratePerHour;
  const estimatedHour = currentHour + hoursNeeded;

  // End of day is ~23:00
  if (estimatedHour <= 23) {
    const completionHour = Math.floor(estimatedHour);
    const completionMin = Math.round((estimatedHour - completionHour) * 60);
    const timeStr = `${String(completionHour).padStart(2, '0')}:${String(completionMin).padStart(2, '0')}`;
    return {
      message: t('prediction.onTrack', { time: timeStr }),
      onTrack: true,
      estimatedCompletionTime: timeStr,
    };
  }

  return {
    message: t('prediction.fallShort'),
    onTrack: false,
    estimatedCompletionTime: null,
  };
}
