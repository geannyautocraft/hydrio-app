import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
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

// Firebase Analytics only accepts string/number/boolean param values.
function sanitizeParams(data?: Record<string, unknown>): Record<string, string | number | boolean> | undefined {
  if (!data) return undefined;
  const sanitized: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (value != null) {
      sanitized[key] = String(value);
    }
  }
  return sanitized;
}

function logToFirebase(event: AnalyticsEvent, data?: Record<string, unknown>) {
  FirebaseAnalytics.logEvent({ name: event, params: sanitizeParams(data) }).catch((err) => {
    if (import.meta.env.DEV) console.warn('[analytics] logEvent failed', err);
  });
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

  // Forward to Firebase Analytics (native on Android, JS SDK on web fallback).
  logToFirebase(event, data);
}

export function trackScreenView(screenName: string) {
  FirebaseAnalytics.setCurrentScreen({ screenName }).catch((err) => {
    if (import.meta.env.DEV) console.warn('[analytics] setCurrentScreen failed', err);
  });
}

export async function setAnalyticsUser(userId: string | null, properties?: Record<string, string | null>) {
  try {
    await FirebaseAnalytics.setUserId({ userId });
    if (properties) {
      for (const [key, value] of Object.entries(properties)) {
        await FirebaseAnalytics.setUserProperty({ key, value });
      }
    }
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[analytics] setUser failed', err);
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
