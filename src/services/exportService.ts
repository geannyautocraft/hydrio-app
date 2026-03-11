import type { DayRecord } from '../types';

interface ExportData {
  exportDate: string;
  goalMl: number;
  totalDays: number;
  days: {
    date: string;
    totalMl: number;
    goalReached: boolean;
    entries: { amount: number; timestamp: string }[];
  }[];
}

function buildExportData(
  records: Record<string, DayRecord>,
  goalMl: number
): ExportData {
  const sortedDates = Object.keys(records).sort();
  return {
    exportDate: new Date().toISOString(),
    goalMl,
    totalDays: sortedDates.length,
    days: sortedDates.map((date) => {
      const record = records[date];
      return {
        date,
        totalMl: record.totalMl,
        goalReached: record.totalMl >= goalMl,
        entries: record.entries.map((e) => ({
          amount: e.amount,
          timestamp: e.timestamp,
        })),
      };
    }),
  };
}

export function exportAsJSON(
  records: Record<string, DayRecord>,
  goalMl: number
): void {
  const data = buildExportData(records, goalMl);
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, 'hydrio-data.json', 'application/json');
}

export function exportAsCSV(
  records: Record<string, DayRecord>,
  goalMl: number
): void {
  const data = buildExportData(records, goalMl);
  const lines: string[] = [
    'Date,Total (ml),Goal (ml),Goal Reached,Entries',
  ];

  for (const day of data.days) {
    const entriesStr = day.entries
      .map((e) => `${e.amount}ml@${e.timestamp}`)
      .join('; ');
    lines.push(
      `${day.date},${day.totalMl},${goalMl},${day.goalReached},\"${entriesStr}\"`
    );
  }

  downloadFile(lines.join('\n'), 'hydrio-data.csv', 'text/csv');
}

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
