import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';

export interface HydrationPrediction {
  message: string;
  onTrack: boolean;
  estimatedCompletionTime: string | null;
}

export function useHydrationPrediction(): HydrationPrediction | null {
  const goalMl = useHydrationStore((s) => s.goalMl);
  const todayRecord = useTodayRecord();
  const currentMl = todayRecord.totalMl;
  const entries = todayRecord.entries;

  if (entries.length === 0) return null;
  if (currentMl >= goalMl) {
    return { message: 'Goal reached! Great job today.', onTrack: true, estimatedCompletionTime: null };
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
      message: `At this pace, you'll reach your goal by ${timeStr}.`,
      onTrack: true,
      estimatedCompletionTime: timeStr,
    };
  }

  return {
    message: "You may fall short of your goal today.",
    onTrack: false,
    estimatedCompletionTime: null,
  };
}
