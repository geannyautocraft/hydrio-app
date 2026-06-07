import { Capacitor, registerPlugin } from '@capacitor/core';
import type { DayRecord } from '../types';

interface HydrioExportPlugin {
  saveFile(options: { filename: string; content: string; mimeType: string }): Promise<{ uri: string; path: string }>;
}

export interface ExportResult {
  filename: string;
  path: string;
}

const HydrioExport = registerPlugin<HydrioExportPlugin>('HydrioExport');

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
): Promise<ExportResult> {
  const data = buildExportData(records, goalMl);
  const json = JSON.stringify(data, null, 2);
  return saveOrDownload(json, exportFilename('json'), 'application/json');
}

export async function exportAsCSV(
  records: Record<string, DayRecord>,
  goalMl: number
): Promise<ExportResult> {
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

  return saveOrDownload(lines.join('\n'), exportFilename('csv'), 'text/csv');
}

function exportFilename(extension: 'json' | 'csv'): string {
  const date = new Date().toISOString().slice(0, 10);
  return `hydrio-data-${date}.${extension}`;
}

async function saveOrDownload(content: string, filename: string, type: string): Promise<ExportResult> {
  if (Capacitor.isNativePlatform()) {
    const result = await HydrioExport.saveFile({
      filename,
      content,
      mimeType: type,
    });
    return { filename, path: result.path };
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
    return { filename, path: filename };
  }
}
