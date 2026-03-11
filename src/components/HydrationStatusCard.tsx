import { useTranslation } from 'react-i18next';
import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';
import { useHydrationPrediction } from '../hooks/useHydrationPrediction';

function getMotivationalKey(percentage: number, currentMl: number): string {
  if (currentMl === 0) return 'status.startJourney';
  if (percentage >= 100) return 'status.goalCompleted';
  if (percentage >= 75) return 'status.doingGreat';
  if (percentage >= 50) return 'status.halfway';
  if (percentage >= 25) return 'status.goodStart';
  return 'status.everySip';
}

export function HydrationStatusCard() {
  const { t } = useTranslation();
  const goalMl = useHydrationStore((s) => s.goalMl);
  const todayRecord = useTodayRecord();
  const prediction = useHydrationPrediction();

  const currentMl = todayRecord.totalMl;
  const remaining = Math.max(goalMl - currentMl, 0);
  const percentage = goalMl > 0 ? Math.min(Math.round((currentMl / goalMl) * 100), 100) : 0;
  const isComplete = currentMl >= goalMl;
  const message = t(getMotivationalKey(percentage, currentMl));

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <p className={`mb-3 text-xs font-medium ${
        isComplete
          ? 'text-green-600 dark:text-green-400'
          : currentMl === 0
            ? 'text-gray-400'
            : 'text-blue-600 dark:text-blue-400'
      }`}>
        {message}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-800 dark:text-white">{currentMl.toLocaleString()}</span>
            <span className="text-sm text-gray-400">/ {goalMl.toLocaleString()} ml</span>
          </div>

          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div className={`h-2.5 rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${percentage}%` }} />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className={`text-xs font-semibold ${isComplete ? 'text-green-500' : 'text-blue-500'}`}>{percentage}%</span>
            {remaining > 0 && (
              <span className="text-xs text-gray-400">
                {t('status.mlRemaining', { remaining: remaining.toLocaleString() })}
              </span>
            )}
          </div>
        </div>
      </div>

      {prediction && (
        <div className={`mt-3 rounded-lg px-3 py-2 text-xs font-medium ${
          prediction.onTrack
            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
            : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
        }`}>
          {prediction.message}
        </div>
      )}
    </div>
  );
}
