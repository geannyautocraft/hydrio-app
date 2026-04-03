import { useTranslation } from 'react-i18next';
import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';

type HydrationStatus = 'under' | 'reached' | 'over' | 'excess';

function getStatus(currentMl: number, goalMl: number): HydrationStatus {
  const ratio = currentMl / goalMl;
  if (ratio >= 1.5) return 'excess';
  if (ratio >= 1.2) return 'over';
  if (ratio >= 1) return 'reached';
  return 'under';
}

function getFeedbackKey(currentMl: number, goalMl: number): { key: string; params?: Record<string, number> } {
  const remaining = goalMl - currentMl;
  const ratio = currentMl / goalMl;

  if (currentMl === 0) return { key: 'progress.startDay' };
  if (ratio >= 1.5) return { key: 'progress.tooMuch' };
  if (ratio >= 1.2) return { key: 'progress.wellHydrated' };
  if (ratio >= 1) return { key: 'progress.goalReached' };
  if (remaining <= 250) return { key: 'progress.almostThere', params: { remaining } };
  return { key: 'progress.needMore', params: { remaining } };
}

const STATUS_CONFIG = {
  under: { color: '#3b82f6', trackColor: '#dbeafe' },
  reached: { color: '#22c55e', trackColor: '#dcfce7' },
  over: { color: '#f97316', trackColor: '#ffedd5' },
  excess: { color: '#ef4444', trackColor: '#fee2e2' },
} as const;

export function HydrationProgress() {
  const { t } = useTranslation();
  const goalMl = useHydrationStore((s) => s.goalMl);
  const todayRecord = useTodayRecord();
  const currentMl = todayRecord.totalMl;

  const rawPercentage = goalMl > 0 ? (currentMl / goalMl) * 100 : 0;
  const displayPercentage = Math.min(rawPercentage, 100);
  const remaining = Math.max(goalMl - currentMl, 0);

  const status = getStatus(currentMl, goalMl);
  const { color, trackColor } = STATUS_CONFIG[status];
  const { key, params } = getFeedbackKey(currentMl, goalMl);
  const feedback = t(key, params);

  const radius = 85;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayPercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center py-5">
      <div className="relative">
        <svg width="200" height="200" className="-rotate-90">
          <circle cx="100" cy="100" r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
          <circle cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="progress-ring transition-all duration-700 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white">
            {currentMl.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500">{t('progress.of', { goal: goalMl.toLocaleString() })}</span>
          <span className="mt-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: color }}>
            {Math.round(rawPercentage)}%
          </span>
        </div>
      </div>

      <p className="mt-2 text-sm font-medium" style={{ color }}>{feedback}</p>
      {remaining > 0 && remaining !== goalMl && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="h-1 rounded-full" style={{ width: '60px', backgroundColor: trackColor }}>
            <div className="h-1 rounded-full transition-all duration-700 ease-out" style={{ width: `${displayPercentage}%`, backgroundColor: color }} />
          </div>
          <span className="text-xs text-gray-500">{t('progress.mlLeft', { remaining })}</span>
        </div>
      )}
    </div>
  );
}
