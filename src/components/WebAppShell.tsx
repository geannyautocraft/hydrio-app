import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { DarkModeToggle } from './DarkModeToggle';
import { PremiumBadge } from './PremiumBadge';
import type { TabKey } from './BottomTabBar';
import { useAuth } from '../hooks/useAuth';
import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';
import { signOut } from '../services/auth';
import { formatDate, getTodayKey } from '../utils/date';

interface WebAppShellProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  children: ReactNode;
}

const WEB_TABS: Array<{
  key: TabKey;
  labelKey: string;
  icon: ReactNode;
}> = [
  {
    key: 'today',
    labelKey: 'tabs.today',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5c2.5 4 6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 3.5-7 6-11z" />
      </svg>
    ),
  },
  {
    key: 'history',
    labelKey: 'tabs.history',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
      </svg>
    ),
  },
  {
    key: 'insights',
    labelKey: 'tabs.insights',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    key: 'settings',
    labelKey: 'tabs.settings',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      </svg>
    ),
  },
];

export function WebAppShell({ active, onChange, children }: WebAppShellProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const todayRecord = useTodayRecord();
  const goalMl = useHydrationStore((s) => s.goalMl);
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const percentage = goalMl > 0 ? Math.round((todayRecord.totalMl / goalMl) * 100) : 0;

  return (
    <div className="min-h-[100dvh] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-2xl glass-strong p-4 shadow-lg shadow-blue-900/5">
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-lg font-black text-white">
                H
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-black text-gray-900 dark:text-white">Hydrio</p>
                  <PremiumBadge />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Web PRO</p>
              </div>
            </div>

            <nav className="space-y-1">
              {WEB_TABS.map((tab) => {
                const isActive = tab.key === active;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => onChange(tab.key)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'text-gray-600 hover:bg-white/45 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    {t(tab.labelKey)}
                  </button>
                );
              })}
            </nav>

            <a
              href="https://play.google.com/store/apps/details?id=com.hydrio.app"
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex items-center justify-center rounded-xl border border-blue-200/70 bg-blue-50/70 px-3 py-2 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800/40 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-900/40"
            >
              {t('webApp.continueAndroid')}
            </a>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="mb-5 rounded-2xl glass-strong px-4 py-3 shadow-lg shadow-blue-900/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 lg:hidden">
                  <h1 className="text-xl font-black text-gray-900 dark:text-white">Hydrio</h1>
                  <PremiumBadge />
                </div>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {todayRecord.totalMl > 0
                    ? t('dashboard.mlToday', { current: todayRecord.totalMl.toLocaleString(locale), percentage })
                    : formatDate(getTodayKey(), locale)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden min-w-0 text-right sm:block">
                  <p className="truncate text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {user?.email}
                  </p>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="text-[11px] font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300"
                  >
                    {t('account.signOut')}
                  </button>
                </div>
                <DarkModeToggle />
              </div>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {WEB_TABS.map((tab) => {
                const isActive = tab.key === active;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => onChange(tab.key)}
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/45 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                    }`}
                  >
                    {tab.icon}
                    {t(tab.labelKey)}
                  </button>
                );
              })}
            </div>
          </header>

          <div className="mx-auto max-w-4xl pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
