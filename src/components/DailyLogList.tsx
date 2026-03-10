import { useTodayRecord } from '../store/useHydrationStore';
import { DailyLogItem } from './DailyLogItem';

export function DailyLogList() {
  const todayRecord = useTodayRecord();
  const entries = [...todayRecord.entries].reverse();

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C12 2 5 10 5 15a7 7 0 0014 0c0-5-7-13-7-13z" />
          </svg>
          Today's Log
        </h2>
        {entries.length > 0 && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-500 dark:bg-blue-900/20 dark:text-blue-400">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        )}
      </div>
      {entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          No water logged yet today.
        </p>
      ) : (
        <ul className="max-h-72 space-y-1.5 overflow-y-auto">
          {entries.map((entry) => (
            <DailyLogItem key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  );
}
