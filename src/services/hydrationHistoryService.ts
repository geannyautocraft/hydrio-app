import type { DayRecord } from '../types';

export interface WeeklyData {
  dateKey: string;
  label: string;
  total: number;
  reached: boolean;
}

export function getWeeklyData(
  records: Record<string, DayRecord>,
  goalMl: number,
  dateKeys: string[]
): WeeklyData[] {
  return dateKeys.map((dateKey) => {
    const record = records[dateKey];
    const total = record
      ? record.entries.reduce((sum, e) => sum + e.amount, 0)
      : 0;
    const date = new Date(dateKey + 'T00:00:00');
    const label = date.toLocaleDateString('en-US', { weekday: 'short' });
    return { dateKey, label, total, reached: total >= goalMl };
  });
}

export function getDayTotal(record: DayRecord | undefined): number {
  if (!record) return 0;
  return record.entries.reduce((sum, e) => sum + e.amount, 0);
}
