import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationStore } from '../store/useHydrationStore';

interface HeatmapDay {
  dateKey: string;
  dayOfMonth: number;
  percentage: number;
  level: 0 | 1 | 2 | 3 | 4;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLevel(percentage: number): 0 | 1 | 2 | 3 | 4 {
  if (percentage === 0) return 0;
  if (percentage < 25) return 1;
  if (percentage < 50) return 2;
  if (percentage < 100) return 3;
  return 4;
}

const LEVEL_COLORS = {
  light: ['bg-gray-100', 'bg-blue-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-600'],
  dark: ['dark:bg-gray-700', 'dark:bg-blue-900/40', 'dark:bg-blue-800/60', 'dark:bg-blue-600/80', 'dark:bg-blue-500'],
};

export function HydrationHeatmap() {
  const { t } = useTranslation();
  const records = useHydrationStore((s) => s.records);
  const goalMl = useHydrationStore((s) => s.goalMl);

  const days: HeatmapDay[] = useMemo(() => {
    const result: HeatmapDay[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = formatDateKey(date);
      const record = records[dateKey];
      const totalMl = record?.totalMl ?? 0;
      const percentage = goalMl > 0 ? Math.round((totalMl / goalMl) * 100) : 0;
      result.push({ dateKey, dayOfMonth: date.getDate(), percentage, level: getLevel(percentage) });
    }
    return result;
  }, [records, goalMl]);

  return (
    <div className="rounded-2xl glass p-4 shadow-lg shadow-blue-900/5">
      <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('heatmap.title')}</h3>
      <div className="grid grid-cols-6 gap-1 min-[360px]:grid-cols-7 min-[400px]:grid-cols-10">
        {days.map((day) => (
          <div key={day.dateKey} title={`${day.dateKey}: ${day.percentage}%`} className={`flex aspect-square min-h-[28px] items-center justify-center rounded text-[10px] font-medium transition-colors ${LEVEL_COLORS.light[day.level]} ${LEVEL_COLORS.dark[day.level]} ${day.level >= 3 ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
            {day.dayOfMonth}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5">
        <span className="text-[10px] text-gray-500">{t('heatmap.less')}</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div key={level} className={`h-3 w-3 rounded-sm ${LEVEL_COLORS.light[level]} ${LEVEL_COLORS.dark[level]}`} />
        ))}
        <span className="text-[10px] text-gray-500">{t('heatmap.more')}</span>
      </div>
    </div>
  );
}
