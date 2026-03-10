import { useMemo } from 'react';
import { useHydrationStore } from '../store/useHydrationStore';
import { getTodayKey } from '../utils/date';

export interface HydrationStats {
  averageMl: number;
  bestDayMl: number;
  bestDayDate: string;
  streak: number;
  totalDays: number;
}

export function useHydrationStats(): HydrationStats {
  const records = useHydrationStore((s) => s.records);
  const goalMl = useHydrationStore((s) => s.goalMl);

  return useMemo(() => {
    const today = getTodayKey();
    const dates = Object.keys(records).sort().reverse();

    if (dates.length === 0) {
      return { averageMl: 0, bestDayMl: 0, bestDayDate: today, streak: 0, totalDays: 0 };
    }

    let totalMl = 0;
    let bestDayMl = 0;
    let bestDayDate = dates[0];

    for (const date of dates) {
      const dayTotal = records[date].entries.reduce((sum, e) => sum + e.amount, 0);
      totalMl += dayTotal;
      if (dayTotal > bestDayMl) {
        bestDayMl = dayTotal;
        bestDayDate = date;
      }
    }

    const averageMl = Math.round(totalMl / dates.length);

    // Calculate streak: consecutive days reaching goal, starting from today going back
    let streak = 0;
    const currentDate = new Date(today + 'T00:00:00');
    for (let i = 0; i < 365; i++) {
      const dateKey = formatDateKey(currentDate);
      const record = records[dateKey];
      const dayTotal = record
        ? record.entries.reduce((sum, e) => sum + e.amount, 0)
        : 0;

      if (dayTotal >= goalMl) {
        streak++;
      } else if (i === 0) {
        // Today hasn't reached goal yet, that's okay — check if they're still working on it
        // Don't break the streak for today
        continue;
      } else {
        break;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return { averageMl, bestDayMl, bestDayDate, streak, totalDays: dates.length };
  }, [records, goalMl]);
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
