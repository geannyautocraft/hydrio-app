import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';

type HydrationStatus = 'under' | 'reached' | 'over' | 'excess';

function getStatus(currentMl: number, goalMl: number): HydrationStatus {
  const ratio = currentMl / goalMl;
  if (ratio >= 1.5) return 'excess';
  if (ratio >= 1.2) return 'over';
  if (ratio >= 1) return 'reached';
  return 'under';
}

function getFeedback(currentMl: number, goalMl: number): string {
  const remaining = goalMl - currentMl;
  const ratio = currentMl / goalMl;

  if (currentMl === 0) return 'Start your day with a glass of water';
  if (ratio >= 1.5) return 'That\'s a lot! Stay balanced';
  if (ratio >= 1.2) return 'You\'re well hydrated today';
  if (ratio >= 1) return 'Goal reached! Great job';
  if (remaining <= 250) return `Almost there! Only ${remaining} ml left`;
  return `You need ${remaining} ml to reach your goal`;
}

const STATUS_CONFIG = {
  under: { color: '#3b82f6', trackColor: '#dbeafe' },
  reached: { color: '#22c55e', trackColor: '#dcfce7' },
  over: { color: '#f97316', trackColor: '#ffedd5' },
  excess: { color: '#ef4444', trackColor: '#fee2e2' },
} as const;

export function HydrationProgress() {
  const goalMl = useHydrationStore((s) => s.goalMl);
  const todayRecord = useTodayRecord();
  const currentMl = todayRecord.totalMl;

  const rawPercentage = goalMl > 0 ? (currentMl / goalMl) * 100 : 0;
  const displayPercentage = Math.min(rawPercentage, 100);
  const remaining = Math.max(goalMl - currentMl, 0);

  const status = getStatus(currentMl, goalMl);
  const { color, trackColor } = STATUS_CONFIG[status];
  const feedback = getFeedback(currentMl, goalMl);

  const radius = 85;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayPercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center py-5">
      <div className="relative">
        <svg width="200" height="200" className="-rotate-90">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="progress-ring transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white">
            {currentMl.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400">of {goalMl.toLocaleString()} ml</span>
          <span
            className="mt-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {Math.round(rawPercentage)}%
          </span>
        </div>
      </div>

      <p className="mt-2 text-sm font-medium" style={{ color }}>
        {feedback}
      </p>
      {remaining > 0 && remaining !== goalMl && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <div
            className="h-1 rounded-full"
            style={{
              width: '60px',
              backgroundColor: trackColor,
            }}
          >
            <div
              className="h-1 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${displayPercentage}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <span className="text-xs text-gray-400">{remaining} ml left</span>
        </div>
      )}
    </div>
  );
}
