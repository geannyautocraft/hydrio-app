import { useTranslation } from 'react-i18next';
import { useTodayRecord } from '../store/useHydrationStore';
import { DailyLogItem } from './DailyLogItem';

export function DailyLogList() {
  const { t } = useTranslation();
  const todayRecord = useTodayRecord();
  const entries = [...todayRecord.entries].reverse();

  return (
    <div className="rounded-2xl glass p-4 shadow-lg shadow-blue-900/5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C12 2 5 10 5 15a7 7 0 0014 0c0-5-7-13-7-13z" />
          </svg>
          {t('log.title')}
        </h2>
        {entries.length > 0 && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-500 dark:bg-blue-900/20 dark:text-blue-400">
            {entries.length === 1
              ? t('log.entry', { count: entries.length })
              : t('log.entries', { count: entries.length })}
          </span>
        )}
      </div>
      {entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">{t('log.empty')}</p>
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
