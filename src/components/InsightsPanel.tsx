import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationStore } from '../store/useHydrationStore';
import { useHydrationStats } from '../hooks/useHydrationStats';
import { getDateLabel } from '../utils/date';

export function InsightsPanel() {
  const { t } = useTranslation();
  const stats = useHydrationStats();
  const records = useHydrationStore((s) => s.records);
  const goalMl = useHydrationStore((s) => s.goalMl);

  const insights = useMemo(() => {
    const dates = Object.keys(records).sort();
    if (dates.length < 2) return null;

    let daysReached = 0;
    for (const date of dates) {
      if (records[date].totalMl >= goalMl) daysReached++;
    }
    const completionRate = Math.round((daysReached / dates.length) * 100);

    const last7 = dates.slice(-7);
    const weeklyTotal = last7.reduce((sum, d) => sum + records[d].totalMl, 0);
    const weeklyAvg = Math.round(weeklyTotal / last7.length);

    return { completionRate, weeklyAvg, daysReached, totalDays: dates.length };
  }, [records, goalMl]);

  if (!insights || stats.totalDays < 2) return null;

  const streakValue = stats.streak > 0
    ? (stats.streak === 1 ? t('stats.day', { count: stats.streak }) : t('stats.days', { count: stats.streak }))
    : '—';

  return (
    <div className="rounded-2xl glass p-4 shadow-lg shadow-blue-900/5">
      <h2 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{t('insightsPanel.title')}</h2>
      <div className="grid grid-cols-2 gap-3">
        <InsightItem label={t('insightsPanel.bestDay')} value={`${stats.bestDayMl.toLocaleString()} ml`} sub={getDateLabel(stats.bestDayDate)} />
        <InsightItem label={t('insightsPanel.currentStreak')} value={streakValue} />
        <InsightItem label={t('insightsPanel.weeklyAvg')} value={`${insights.weeklyAvg.toLocaleString()} ml`} />
        <InsightItem label={t('insightsPanel.goalCompletion')} value={`${insights.completionRate}%`} sub={t('insightsPanel.daysCount', { reached: insights.daysReached, total: insights.totalDays })} />
      </div>
    </div>
  );
}

function InsightItem({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg glass-inner px-3 py-2.5">
      <p className="text-sm font-semibold text-gray-800 dark:text-white">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}
