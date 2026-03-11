import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationStore } from '../store/useHydrationStore';
import { getRecentDateKeys } from '../utils/date';
import { PremiumGate } from './PremiumGate';

function AdvancedInsightsContent() {
  const { t } = useTranslation();
  const records = useHydrationStore((s) => s.records);
  const goalMl = useHydrationStore((s) => s.goalMl);

  const insights = useMemo(() => {
    const allDates = Object.keys(records).sort();
    if (allDates.length < 3) return null;

    // Consistency score: % of days in last 30 where user logged >= 80% of goal
    const last30 = getRecentDateKeys(30);
    let consistentDays = 0;
    let activeDays = 0;
    for (const key of last30) {
      const record = records[key];
      if (record && record.totalMl > 0) {
        activeDays++;
        if (record.totalMl >= goalMl * 0.8) consistentDays++;
      }
    }
    const consistencyScore = activeDays > 0 ? Math.round((consistentDays / activeDays) * 100) : 0;

    // Monthly trends: average per month for last 3 months
    const monthlyTrends: { month: string; avg: number; days: number }[] = [];
    const now = new Date();
    for (let m = 2; m >= 0; m--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
      const monthDates = allDates.filter((d) => d.startsWith(prefix));
      const total = monthDates.reduce((sum, d) => sum + (records[d]?.totalMl ?? 0), 0);
      const activeDaysInMonth = monthDates.filter((d) => (records[d]?.totalMl ?? 0) > 0).length;
      const monthLabel = targetDate.toLocaleDateString('en', { month: 'short', year: '2-digit' });
      monthlyTrends.push({
        month: monthLabel,
        avg: activeDaysInMonth > 0 ? Math.round(total / activeDaysInMonth) : 0,
        days: activeDaysInMonth,
      });
    }

    // Advanced stats
    const totals = allDates.map((d) => records[d]?.totalMl ?? 0).filter((t) => t > 0);
    const overallAvg = totals.length > 0 ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length) : 0;
    const maxDay = Math.max(...totals, 0);
    const minDay = totals.length > 0 ? Math.min(...totals) : 0;

    // Goal hit rate
    const daysReached = totals.filter((t) => t >= goalMl).length;
    const goalHitRate = totals.length > 0 ? Math.round((daysReached / totals.length) * 100) : 0;

    return { consistencyScore, monthlyTrends, overallAvg, maxDay, minDay, goalHitRate, totalActiveDays: totals.length };
  }, [records, goalMl]);

  if (!insights) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <h2 className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">{t('advancedInsights.title')}</h2>
        <p className="text-xs text-gray-400">{t('advancedInsights.needMoreData')}</p>
      </div>
    );
  }

  const scoreColor =
    insights.consistencyScore >= 80
      ? 'text-green-600 dark:text-green-400'
      : insights.consistencyScore >= 50
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-500 dark:text-red-400';

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{t('advancedInsights.title')}</h2>

      {/* Consistency Score */}
      <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">{t('advancedInsights.consistencyScore')}</p>
            <p className={`text-2xl font-bold ${scoreColor}`}>{insights.consistencyScore}%</p>
          </div>
          <div className="h-12 w-12">
            <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                className="stroke-gray-200 dark:stroke-gray-600"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                className={insights.consistencyScore >= 80 ? 'stroke-green-500' : insights.consistencyScore >= 50 ? 'stroke-amber-500' : 'stroke-red-500'}
                strokeWidth="3"
                strokeDasharray={`${insights.consistencyScore}, 100`}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('advancedInsights.monthlyTrends')}</p>
        <div className="grid grid-cols-3 gap-2">
          {insights.monthlyTrends.map((m) => (
            <div key={m.month} className="rounded-lg bg-gray-50 px-2.5 py-2 text-center dark:bg-gray-700/50">
              <p className="text-xs text-gray-400">{m.month}</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{m.avg.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400">{t('advancedInsights.mlAvg')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatItem label={t('advancedInsights.goalHitRate')} value={`${insights.goalHitRate}%`} />
        <StatItem label={t('advancedInsights.overallAvg')} value={`${insights.overallAvg.toLocaleString()} ml`} />
        <StatItem label={t('advancedInsights.bestDay')} value={`${insights.maxDay.toLocaleString()} ml`} />
        <StatItem label={t('advancedInsights.activeDays')} value={String(insights.totalActiveDays)} />
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-2.5 py-2 dark:bg-gray-700/50">
      <p className="text-sm font-semibold text-gray-800 dark:text-white">{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  );
}

export function AdvancedInsights() {
  return (
    <PremiumGate feature="advanced_insights">
      <AdvancedInsightsContent />
    </PremiumGate>
  );
}
