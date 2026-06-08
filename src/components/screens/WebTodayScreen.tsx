import { useTranslation } from 'react-i18next';
import { HeroDashboard } from '../HeroDashboard';
import { QuickAddButtons } from '../QuickAddButtons';
import { CustomWaterInput } from '../CustomWaterInput';
import { HydrationInsights } from '../HydrationInsights';
import { HydrationStatusCard } from '../HydrationStatusCard';
import { DailyLogList } from '../DailyLogList';
import { WeeklyChallenge } from '../RetentionCards';
import { WeeklyChart } from '../WeeklyChart';
import { useHydrationStats } from '../../hooks/useHydrationStats';
import { useHydrationStore, useTodayRecord } from '../../store/useHydrationStore';

function MetricCard({ label, value, tone = 'blue' }: { label: string; value: string; tone?: 'blue' | 'green' | 'amber' }) {
  const toneClass = {
    blue: 'text-blue-700 dark:text-blue-300 bg-blue-500/10',
    green: 'text-green-700 dark:text-green-300 bg-green-500/10',
    amber: 'text-amber-700 dark:text-amber-300 bg-amber-500/10',
  }[tone];

  return (
    <div className={`rounded-xl px-4 py-3 ${toneClass}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

export function WebTodayScreen() {
  const { t } = useTranslation();
  const todayRecord = useTodayRecord();
  const goalMl = useHydrationStore((s) => s.goalMl);
  const stats = useHydrationStats();
  const remaining = Math.max(0, goalMl - todayRecord.totalMl);
  const percentage = goalMl > 0 ? Math.round((todayRecord.totalMl / goalMl) * 100) : 0;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
      <section className="space-y-4">
        <div className="rounded-2xl glass-strong p-5 shadow-lg shadow-blue-900/5">
          <HeroDashboard />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label={t('webApp.todayIntake')} value={`${todayRecord.totalMl.toLocaleString()} ml`} />
          <MetricCard label={t('webApp.remaining')} value={`${remaining.toLocaleString()} ml`} tone={remaining === 0 ? 'green' : 'amber'} />
          <MetricCard label={t('webApp.goalProgress')} value={`${percentage}%`} tone={percentage >= 100 ? 'green' : 'blue'} />
        </div>

        <div className="rounded-2xl glass p-4 shadow-lg shadow-blue-900/5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{t('webApp.quickActions')}</h2>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('webApp.desktopReady')}</span>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1fr_0.95fr]">
            <QuickAddButtons />
            <CustomWaterInput />
          </div>
        </div>

        <WeeklyChart />
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl glass p-4 shadow-lg shadow-blue-900/5">
          <h2 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">{t('webApp.dailyBrief')}</h2>
          <div className="space-y-3">
            <HydrationInsights />
            <HydrationStatusCard />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <MetricCard label={t('stats.dailyAvg')} value={`${stats.averageMl.toLocaleString()} ml`} />
          <MetricCard label={t('stats.bestDay')} value={`${stats.bestDayMl.toLocaleString()} ml`} tone="green" />
          <MetricCard label={t('stats.streak')} value={stats.streak > 0 ? String(stats.streak) : '-'} tone="amber" />
        </div>

        <WeeklyChallenge />
        <DailyLogList />
      </aside>
    </div>
  );
}
