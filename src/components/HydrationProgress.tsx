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

const STATUS_GRADIENT = {
  under: { from: '#60a5fa', to: '#2563eb', track: 'rgba(219, 234, 254, 0.4)', text: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-500' },
  reached: { from: '#4ade80', to: '#16a34a', track: 'rgba(220, 252, 231, 0.4)', text: 'text-green-600 dark:text-green-400', badge: 'bg-green-500' },
  over: { from: '#fb923c', to: '#ea580c', track: 'rgba(255, 237, 213, 0.4)', text: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-500' },
  excess: { from: '#f87171', to: '#dc2626', track: 'rgba(254, 226, 226, 0.4)', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-500' },
} as const;

export function HydrationProgress() {
  const { t } = useTranslation();
  const goalMl = useHydrationStore((s) => s.goalMl);
  const todayRecord = useTodayRecord();
  const currentMl = todayRecord.totalMl;

  const rawPercentage = goalMl > 0 ? (currentMl / goalMl) * 100 : 0;
  const displayPercentage = Math.min(rawPercentage, 100);

  const status = getStatus(currentMl, goalMl);
  const palette = STATUS_GRADIENT[status];
  const { key, params } = getFeedbackKey(currentMl, goalMl);
  const feedback = t(key, params);

  const radius = 88;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayPercentage / 100) * circumference;
  const gradientId = `progress-grad-${status}`;

  return (
    <div className="flex flex-col items-center py-6">
      <div className="relative">
        <svg width="220" height="220" className="-rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={palette.from} />
              <stop offset="100%" stopColor={palette.to} />
            </linearGradient>
          </defs>
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={palette.track}
            strokeWidth={strokeWidth}
          />
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tracking-tight text-gray-800 dark:text-white">
            {currentMl.toLocaleString()}
          </span>
          <span className="mt-0.5 text-xs text-gray-500">
            {t('progress.of', { goal: goalMl.toLocaleString() })}
          </span>
          <span className={`mt-2 rounded-full px-3 py-0.5 text-xs font-semibold text-white ${palette.badge}`}>
            {Math.round(rawPercentage)}%
          </span>
        </div>
      </div>

      <p className={`mt-3 text-center text-sm font-medium ${palette.text}`}>
        {feedback}
      </p>
    </div>
  );
}
