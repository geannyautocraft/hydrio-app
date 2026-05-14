import { useTranslation } from 'react-i18next';
import { CoachCard } from '../CoachCard';
import { AchievementsSection } from '../AchievementsSection';
import { InsightsPanel } from '../InsightsPanel';
import { AdvancedInsights } from '../AdvancedInsights';
import { EmptyState } from '../EmptyState';
import { useHydrationStore } from '../../store/useHydrationStore';

export function InsightsScreen() {
  const { t } = useTranslation();
  const records = useHydrationStore((s) => s.records);
  const daysWithData = Object.values(records).filter((r) => r.totalMl > 0).length;

  if (daysWithData < 1) {
    return (
      <EmptyState
        mood="thoughtful"
        title={t('insights.emptyTitle')}
        description={t('insights.emptyDesc')}
      />
    );
  }

  return (
    <div className="space-y-4">
      <CoachCard />
      <AdvancedInsights />
      <InsightsPanel />
      <AchievementsSection />
    </div>
  );
}
