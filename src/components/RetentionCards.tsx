import { useMemo } from 'react';
import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';
import { getRecentDateKeys } from '../utils/date';

export function WeeklyChallenge() {
  const records = useHydrationStore((s) => s.records);
  const goalMl = useHydrationStore((s) => s.goalMl);

  const { daysCompleted, totalDays } = useMemo(() => {
    const keys = getRecentDateKeys(7);
    let completed = 0;
    for (const key of keys) {
      const record = records[key];
      if (record && record.totalMl >= goalMl) completed++;
    }
    return { daysCompleted: completed, totalDays: 7 };
  }, [records, goalMl]);

  const dots = Array.from({ length: totalDays }, (_, i) => i < daysCompleted);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            Weekly Goal Challenge
          </h2>
          <p className="mt-0.5 text-xs text-gray-400">
            {daysCompleted === totalDays
              ? 'Perfect week! Amazing work!'
              : `You completed your goal ${daysCompleted} out of ${totalDays} days`}
          </p>
        </div>
        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {daysCompleted}/{totalDays}
        </span>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {dots.map((filled, i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-full transition-colors ${
              filled
                ? 'bg-green-500'
                : 'bg-gray-200 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
      {daysCompleted >= 5 && daysCompleted < 7 && (
        <p className="mt-2 text-center text-xs font-medium text-amber-600 dark:text-amber-400">
          Almost there! Keep going for a perfect week!
        </p>
      )}
    </div>
  );
}

export function EndOfDaySummary() {
  const todayRecord = useTodayRecord();
  const goalMl = useHydrationStore((s) => s.goalMl);

  const currentHour = new Date().getHours();
  const totalMl = todayRecord.totalMl;
  const entryCount = todayRecord.entries.length;
  const percentage = goalMl > 0 ? Math.round((totalMl / goalMl) * 100) : 0;
  const reached = totalMl >= goalMl;

  // Only show after 6 PM
  if (currentHour < 18) return null;
  // Don't show if no entries today
  if (entryCount === 0) return null;

  return (
    <div className={`rounded-xl p-4 shadow-sm ${
      reached
        ? 'bg-green-50 dark:bg-green-900/20'
        : 'bg-amber-50 dark:bg-amber-900/20'
    }`}>
      <h2 className={`text-sm font-semibold ${
        reached ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'
      }`}>
        {reached ? 'Great job today!' : 'End of Day Summary'}
      </h2>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800 dark:text-white">
            {totalMl.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-400">ml total</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800 dark:text-white">
            {entryCount}
          </p>
          <p className="text-[10px] text-gray-400">entries</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold ${
            reached ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
          }`}>
            {percentage}%
          </p>
          <p className="text-[10px] text-gray-400">of goal</p>
        </div>
      </div>
      {!reached && (
        <p className="mt-2 text-center text-xs text-amber-600 dark:text-amber-400">
          {goalMl - totalMl} ml left to reach your goal
        </p>
      )}
    </div>
  );
}

export function ConsistencyMessage() {
  const records = useHydrationStore((s) => s.records);
  const goalMl = useHydrationStore((s) => s.goalMl);

  const message = useMemo(() => {
    const keys = getRecentDateKeys(7);
    let daysWithData = 0;
    let daysReached = 0;

    for (const key of keys) {
      const record = records[key];
      if (record && record.totalMl > 0) {
        daysWithData++;
        if (record.totalMl >= goalMl) daysReached++;
      }
    }

    if (daysWithData < 2) return null;
    if (daysReached === 7) return 'Perfect hydration consistency this week!';
    if (daysReached >= 5) return 'Great consistency! You\'re building a strong habit.';
    if (daysReached >= 3) return 'Good progress! Try to stay consistent every day.';
    if (daysWithData >= 5) return 'You\'re tracking regularly. Try to hit your goal more often!';
    return null;
  }, [records, goalMl]);

  if (!message) return null;

  return (
    <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-900/20">
      <p className="text-center text-xs font-medium text-blue-700 dark:text-blue-400">
        {message}
      </p>
    </div>
  );
}
