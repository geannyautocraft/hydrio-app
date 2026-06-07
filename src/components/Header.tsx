import { useTranslation } from 'react-i18next';
import { formatDate, getTodayKey } from '../utils/date';
import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';
import { DarkModeToggle } from './DarkModeToggle';
import { PremiumBadge } from './PremiumBadge';

export function Header() {
  const { t, i18n } = useTranslation();
  const todayRecord = useTodayRecord();
  const goalMl = useHydrationStore((s) => s.goalMl);
  const currentMl = todayRecord.totalMl;
  const percentage = goalMl > 0 ? Math.round((currentMl / goalMl) * 100) : 0;
  const locale = i18n.resolvedLanguage ?? i18n.language;

  const subtitle = currentMl === 0
    ? formatDate(getTodayKey(), locale)
    : t('dashboard.mlToday', { current: currentMl.toLocaleString(locale), percentage });

  return (
    <header className="flex items-center justify-between pb-2 pt-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent dark:from-sky-300 dark:via-blue-400 dark:to-indigo-400">
            Hydrio
          </h1>
          <PremiumBadge />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
      <DarkModeToggle />
    </header>
  );
}
