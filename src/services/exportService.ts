import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
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

export async function exportAsJSON(
  records: Record<string, DayRecord>,
  goalMl: number
): Promise<void> {
  const data = buildExportData(records, goalMl);
  const json = JSON.stringify(data, null, 2);
  await shareOrDownload(json, 'hydrio-data.json', 'application/json');
}

export async function exportAsCSV(
  records: Record<string, DayRecord>,
  goalMl: number
): Promise<void> {
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

  await shareOrDownload(lines.join('\n'), 'hydrio-data.csv', 'text/csv');
}

async function shareOrDownload(content: string, filename: string, type: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    // Native: save to cache dir and share via Android share sheet
    const result = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });

    await Share.share({
      title: filename,
      url: result.uri,
    });
  } else {
    // Browser: standard download
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
}
