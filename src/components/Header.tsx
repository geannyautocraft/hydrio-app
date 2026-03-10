import { formatDate, getTodayKey } from '../utils/date';
import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';

interface HeaderProps {
  onToggleSettings: () => void;
  settingsOpen: boolean;
}

export function Header({ onToggleSettings, settingsOpen }: HeaderProps) {
  const todayRecord = useTodayRecord();
  const goalMl = useHydrationStore((s) => s.goalMl);
  const currentMl = todayRecord.totalMl;
  const percentage = goalMl > 0 ? Math.round((currentMl / goalMl) * 100) : 0;

  const subtitle = currentMl === 0
    ? formatDate(getTodayKey())
    : `${currentMl.toLocaleString()} ml today · ${percentage}%`;

  return (
    <header className="flex items-center justify-between pb-2 pt-4">
      <div>
        <h1 className="text-2xl font-bold text-blue-600">Hydrio</h1>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSettings}
          className={`rounded-lg p-2 transition-colors ${
            settingsOpen
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
          aria-label="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
