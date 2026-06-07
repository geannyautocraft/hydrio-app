import { Capacitor, registerPlugin } from '@capacitor/core';

interface WidgetEntry {
  amount: number;
  timestamp: string;
}

interface HydrioWidgetPlugin {
  syncState(options: { date: string; totalMl: number; goalMl: number }): Promise<void>;
  getPendingEntries(): Promise<{ entries: WidgetEntry[] }>;
  clearPendingEntries(): Promise<void>;
}

const HydrioWidget = registerPlugin<HydrioWidgetPlugin>('HydrioWidget');

export function isWidgetAvailable(): boolean {
  return Capacitor.isNativePlatform();
}

export async function syncWidgetState(date: string, totalMl: number, goalMl: number): Promise<void> {
  if (!isWidgetAvailable()) return;
  try {
    await HydrioWidget.syncState({ date, totalMl, goalMl });
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[widget] sync failed', err);
  }
}

export async function consumeWidgetEntries(): Promise<WidgetEntry[]> {
  if (!isWidgetAvailable()) return [];
  try {
    const result = await HydrioWidget.getPendingEntries();
    const entries = Array.isArray(result.entries) ? result.entries : [];
    if (entries.length > 0) {
      await HydrioWidget.clearPendingEntries();
    }
    return entries.filter((entry) => Number.isFinite(entry.amount) && entry.amount > 0);
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[widget] consume failed', err);
    return [];
  }
}
