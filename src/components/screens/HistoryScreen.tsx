import { useTranslation } from 'react-i18next';
import { WeeklyChart } from '../WeeklyChart';
import { HydrationHeatmap } from '../HydrationHeatmap';
import { HydrationHistory } from '../HydrationHistory';
import { HydrationStats } from '../HydrationStats';
import { ExtendedHistory } from '../ExtendedHistory';
import { AdvancedCharts } from '../AdvancedCharts';
import { ExportData } from '../ExportData';
import { EmptyState } from '../EmptyState';
import { useHydrationStore } from '../../store/useHydrationStore';

export function HistoryScreen() {
  const { t } = useTranslation();
  const records = useHydrationStore((s) => s.records);
  const hasAnyData = Object.values(records).some((r) => r.totalMl > 0);

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
    <div className="space-y-4">
      <WeeklyChart />
      <HydrationHeatmap />
      <HydrationHistory />
      <HydrationStats />
      <ExtendedHistory />
      <AdvancedCharts />
      <ExportData />
    </div>
  );
}
