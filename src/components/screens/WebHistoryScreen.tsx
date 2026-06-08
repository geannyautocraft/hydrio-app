import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { WeeklyChart } from '../WeeklyChart';
import { HydrationHeatmap } from '../HydrationHeatmap';
import { HydrationStats } from '../HydrationStats';
import { ExtendedHistory } from '../ExtendedHistory';
import { AdvancedCharts } from '../AdvancedCharts';
import { ExportData } from '../ExportData';
import { EmptyState } from '../EmptyState';
import { useHydrationStore } from '../../store/useHydrationStore';
import { getDateLabel, getRecentDateKeys } from '../../utils/date';

export function WebHistoryScreen() {
  const { t } = useTranslation();
  const records = useHydrationStore((s) => s.records);
  const goalMl = useHydrationStore((s) => s.goalMl);
  const hasAnyData = Object.values(records).some((r) => r.totalMl > 0);

  const rows = useMemo(() => {
    return getRecentDateKeys(30)
      .map((dateKey) => {
        const record = records[dateKey];
        const total = record?.totalMl ?? 0;
        const entries = record?.entries.length ?? 0;
        const percentage = goalMl > 0 ? Math.round((total / goalMl) * 100) : 0;
        return { dateKey, total, entries, percentage, reached: total >= goalMl };
      })
      .filter((row, index) => index < 7 || row.total > 0);
  }, [records, goalMl]);

  if (!hasAnyData) {
    return (
      <EmptyState
        mood="sleepy"
        title={t('history.emptyTitle')}
        description={t('history.emptyDesc')}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <WeeklyChart />
        <HydrationStats />
      </div>

      <div className="rounded-2xl glass p-4 shadow-lg shadow-blue-900/5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{t('webApp.historyTable')}</h2>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('webApp.last30Days')}</span>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/40 dark:border-white/10">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-white/45 text-xs uppercase text-gray-500 dark:bg-white/5 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 font-bold">{t('webApp.date')}</th>
                <th className="px-3 py-2 font-bold">{t('webApp.intake')}</th>
                <th className="px-3 py-2 font-bold">{t('webApp.entries')}</th>
                <th className="px-3 py-2 font-bold">{t('webApp.completion')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40 dark:divide-white/10">
              {rows.map((row) => (
                <tr key={row.dateKey} className="bg-white/20 dark:bg-white/[0.03]">
                  <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-100">{getDateLabel(row.dateKey)}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{row.total > 0 ? `${row.total.toLocaleString()} ml` : '-'}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{row.entries}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className={`h-2 rounded-full ${row.reached ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(row.percentage, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${row.reached ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {row.total > 0 ? `${row.percentage}%` : '-'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <HydrationHeatmap />
        <ExportData />
      </div>

      <ExtendedHistory />
      <AdvancedCharts />
    </div>
  );
}
