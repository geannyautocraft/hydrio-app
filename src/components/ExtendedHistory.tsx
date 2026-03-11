import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationStore } from '../store/useHydrationStore';
import { getDateLabel, getRecentDateKeys } from '../utils/date';
import { usePremium } from '../hooks/usePremium';
import { UpgradeModal } from './UpgradeModal';
import { trackEvent } from '../services/analyticsService';

type TimeRange = '7d' | '30d' | 'all';

const FREE_HISTORY_DAYS = 3;

export function ExtendedHistory() {
  const { t } = useTranslation();
  const { isPremium } = usePremium();
  const [range, setRange] = useState<TimeRange>('7d');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const records = useHydrationStore((s) => s.records);
  const goalMl = useHydrationStore((s) => s.goalMl);

  const effectiveRange = isPremium ? range : '7d';

  const { history, hasMore, stats } = useMemo(() => {
    let dateKeys: string[];
    if (effectiveRange === 'all') {
      dateKeys = Object.keys(records).sort().reverse();
    } else {
      const count = effectiveRange === '7d' ? 7 : 30;
      dateKeys = getRecentDateKeys(count);
    }

    const historyData = dateKeys
      .map((dateKey) => {
        const record = records[dateKey];
        const total = record ? record.totalMl : 0;
        return { dateKey, total };
      })
      .filter((d) => d.total > 0 || effectiveRange === '7d');

    const totals = historyData.filter((d) => d.total > 0);
    const totalMl = totals.reduce((sum, d) => sum + d.total, 0);
    const avgMl = totals.length > 0 ? Math.round(totalMl / totals.length) : 0;
    const daysReached = totals.filter((d) => d.total >= goalMl).length;
    const completionRate = totals.length > 0 ? Math.round((daysReached / totals.length) * 100) : 0;

    const visibleHistory = isPremium ? historyData.slice(0, 50) : historyData.slice(0, FREE_HISTORY_DAYS);

    return {
      history: visibleHistory,
      hasMore: !isPremium && historyData.length > FREE_HISTORY_DAYS,
      stats: { totalMl, avgMl, daysReached, totalDays: totals.length, completionRate },
    };
  }, [records, goalMl, effectiveRange, isPremium]);

  const tabs: { key: TimeRange; labelKey: string; premium: boolean }[] = [
    { key: '7d', labelKey: 'extendedHistory.7days', premium: false },
    { key: '30d', labelKey: 'extendedHistory.30days', premium: true },
    { key: 'all', labelKey: 'extendedHistory.allTime', premium: true },
  ];

  return (
    <>
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <h2 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{t('extendedHistory.title')}</h2>

        <div className="mb-3 flex gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.premium && !isPremium) {
                  trackEvent('premium_prompt_opened');
                  setShowUpgrade(true);
                } else {
                  setRange(tab.key);
                }
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                effectiveRange === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              } ${tab.premium && !isPremium ? 'opacity-60' : ''}`}
            >
              {t(tab.labelKey)} {tab.premium && !isPremium ? '🔒' : ''}
            </button>
          ))}
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-gray-50 px-2.5 py-2 text-center dark:bg-gray-700/50">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{stats.avgMl.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400">{t('extendedHistory.avgPerDay')}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-2.5 py-2 text-center dark:bg-gray-700/50">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{stats.totalMl.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400">{t('extendedHistory.totalMl')}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-2.5 py-2 text-center dark:bg-gray-700/50">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{stats.completionRate}%</p>
            <p className="text-[10px] text-gray-400">{t('extendedHistory.goalRate')}</p>
          </div>
        </div>

        <div className="max-h-64 space-y-1.5 overflow-y-auto">
          {history.length === 0 ? (
            <p className="py-4 text-center text-xs text-gray-400">{t('extendedHistory.noData')}</p>
          ) : (
            history.map(({ dateKey, total }) => {
              const percentage = goalMl > 0 ? Math.round((total / goalMl) * 100) : 0;
              const barWidth = Math.min(percentage, 100);
              const reached = percentage >= 100;
              return (
                <div key={dateKey} className="flex items-center gap-2.5">
                  <span className="w-20 shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">{getDateLabel(dateKey)}</span>
                  <div className="flex-1">
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                      <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${barWidth}%`, backgroundColor: reached ? '#22c55e' : '#3b82f6' }} />
                    </div>
                  </div>
                  <span className={`w-14 text-right text-xs font-medium ${reached ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {total > 0 ? `${total} ml` : '—'}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {hasMore && (
          <button
            onClick={() => {
              trackEvent('premium_prompt_opened');
              setShowUpgrade(true);
            }}
            className="mt-3 w-full rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 py-2 text-xs font-medium text-amber-600 transition-colors hover:from-amber-500/20 hover:to-orange-500/20 dark:text-amber-400"
          >
            🔓 {t('extendedHistory.unlockFull')}
          </button>
        )}
      </div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
