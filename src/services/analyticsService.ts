import type { AnalyticsEvent } from '../types';

interface AnalyticsEntry {
  event: AnalyticsEvent;
  timestamp: string;
  data?: Record<string, unknown>;
}

const STORAGE_KEY = 'hydrio-analytics';
const MAX_ENTRIES = 500;

function getEntries(): AnalyticsEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function trackEvent(event: AnalyticsEvent, data?: Record<string, unknown>) {
  const entries = getEntries();
  entries.push({ event, timestamp: new Date().toISOString(), data });

  // Keep only the most recent entries
  const trimmed = entries.slice(-MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full — silently fail
  }
}

export function getEventCount(event: AnalyticsEvent): number {
  return getEntries().filter((e) => e.event === event).length;
}

export function getRecentEvents(event: AnalyticsEvent, limit = 10): AnalyticsEntry[] {
  return getEntries()
    .filter((e) => e.event === event)
    .slice(-limit);
}
