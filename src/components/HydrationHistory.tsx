import { useHydrationStore } from '../store/useHydrationStore';
import { getRecentDateKeys, getDateLabel } from '../utils/date';

export function HydrationHistory() {
  const records = useHydrationStore((s) => s.records);
  const goalMl = useHydrationStore((s) => s.goalMl);

  const dateKeys = getRecentDateKeys(7);
  const history = dateKeys
    .map((dateKey) => {
      const record = records[dateKey];
      const total = record
        ? record.entries.reduce((sum, e) => sum + e.amount, 0)
        : 0;
      return { dateKey, total };
    })
    .filter((d, i) => i === 0 || d.total > 0);

  if (history.length <= 1 && history[0]?.total === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300">History</h2>
      <div className="space-y-2">
        {history.map(({ dateKey, total }) => {
          const percentage = goalMl > 0 ? Math.round((total / goalMl) * 100) : 0;
          const barWidth = Math.min(percentage, 100);
          const reached = percentage >= 100;

          return (
            <div key={dateKey} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
                {getDateLabel(dateKey)}
              </span>
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: reached ? '#22c55e' : '#3b82f6',
                    }}
                  />
                </div>
              </div>
              <span className={`w-16 text-right text-xs font-medium ${reached ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {total > 0 ? `${total} ml` : '—'}
              </span>
              <span className={`w-10 text-right text-xs ${reached ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                {total > 0 ? `${percentage}%` : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
