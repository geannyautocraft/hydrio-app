import { useTranslation } from 'react-i18next';
import { useHydrationStats } from '../hooks/useHydrationStats';

export function HydrationStats() {
  const { t } = useTranslation();
  const stats = useHydrationStats();

  if (stats.totalDays < 2) return null;

  const streakValue = stats.streak > 0
    ? (stats.streak === 1 ? t('stats.day', { count: stats.streak }) : t('stats.days', { count: stats.streak }))
    : '—';

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{t('stats.title')}</h2>
      <div className="grid grid-cols-3 gap-3">
        <StatItem label={t('stats.dailyAvg')} value={`${stats.averageMl.toLocaleString()} ml`} />
        <StatItem label={t('stats.bestDay')} value={`${stats.bestDayMl.toLocaleString()} ml`} />
        <StatItem label={t('stats.streak')} value={streakValue} />
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2.5 text-center dark:bg-gray-700/50">
      <p className="text-sm font-semibold text-gray-800 dark:text-white">{value}</p>
      <p className="mt-0.5 text-xs text-gray-400">{label}</p>
    </div>
  );
}
