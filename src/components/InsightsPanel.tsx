import { useMemo } from 'react';
import { useHydrationStore } from '../store/useHydrationStore';
import { useHydrationStats } from '../hooks/useHydrationStats';
import { getDateLabel } from '../utils/date';

export function InsightsPanel() {
  const stats = useHydrationStats();
  const records = useHydrationStore((s) => s.records);
  const goalMl = useHydrationStore((s) => s.goalMl);

  const insights = useMemo(() => {
    const dates = Object.keys(records).sort();
    if (dates.length < 2) return null;

    // Goal completion rate
    let daysReached = 0;
    for (const date of dates) {
      if (records[date].totalMl >= goalMl) daysReached++;
    }
    const completionRate = Math.round((daysReached / dates.length) * 100);

    // Weekly average (last 7 days)
    const last7 = dates.slice(-7);
    const weeklyTotal = last7.reduce((sum, d) => sum + records[d].totalMl, 0);
    const weeklyAvg = Math.round(weeklyTotal / last7.length);

    return { completionRate, weeklyAvg, daysReached, totalDays: dates.length };
  }, [records, goalMl]);

  if (!insights || stats.totalDays < 2) return null;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Insights</h2>
      <div className="grid grid-cols-2 gap-3">
        <InsightItem
          label="Best day"
          value={`${stats.bestDayMl.toLocaleString()} ml`}
          sub={getDateLabel(stats.bestDayDate)}
        />
        <InsightItem
          label="Current streak"
          value={stats.streak > 0 ? `${stats.streak} day${stats.streak === 1 ? '' : 's'}` : '—'}
        />
        <InsightItem
          label="Weekly avg"
          value={`${insights.weeklyAvg.toLocaleString()} ml`}
        />
        <InsightItem
          label="Goal completion"
          value={`${insights.completionRate}%`}
          sub={`${insights.daysReached}/${insights.totalDays} days`}
        />
      </div>
    </div>
  );
}

function InsightItem({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-gray-700/50">
      <p className="text-sm font-semibold text-gray-800 dark:text-white">{value}</p>
      <p className="mt-0.5 text-xs text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}
