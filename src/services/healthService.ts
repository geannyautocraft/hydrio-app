import { Capacitor, registerPlugin } from '@capacitor/core';
import { getTodayKey } from '../utils/date';

export interface HealthStatus {
  available: boolean;
  requiresInstall: boolean;
  status: number;
  granted: boolean;
  grantedCount: number;
  requiredCount: number;
}

export interface HealthSession {
  title: string;
  exerciseType: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface HealthTodaySummary {
  date: string;
  steps: number;
  activeCaloriesKcal: number;
  totalCaloriesKcal: number;
  distanceMeters: number;
  exerciseCount: number;
  extraWaterMl: number;
  sessions: HealthSession[];
}

interface HydrioHealthPlugin {
  getStatus(): Promise<HealthStatus>;
  requestHealthPermissions(): Promise<{ granted: boolean; grantedCount: number; requiredCount: number }>;
  readToday(): Promise<HealthTodaySummary>;
  openHealthConnect(): Promise<void>;
}

const HydrioHealth = registerPlugin<HydrioHealthPlugin>('HydrioHealth');
const HEALTH_TODAY_CACHE_KEY = 'hydrio.health.todaySummary';
export const HEALTH_TODAY_UPDATED_EVENT = 'hydrio:health-today-updated';

export function getCachedTodayHealthSummary(): HealthTodaySummary | null {
  try {
    const raw = localStorage.getItem(HEALTH_TODAY_CACHE_KEY);
    if (!raw) return null;

    const summary = JSON.parse(raw) as HealthTodaySummary;
    return summary.date === getTodayKey() ? summary : null;
  } catch {
    return null;
  }
}

export function saveTodayHealthSummary(summary: HealthTodaySummary): void {
  localStorage.setItem(HEALTH_TODAY_CACHE_KEY, JSON.stringify(summary));
  window.dispatchEvent(new CustomEvent<HealthTodaySummary>(HEALTH_TODAY_UPDATED_EVENT, { detail: summary }));
}

export function isHealthConnectAvailableOnPlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export async function getHealthStatus(): Promise<HealthStatus> {
  if (!isHealthConnectAvailableOnPlatform()) {
    return {
      available: false,
      requiresInstall: false,
      status: 0,
      granted: false,
      grantedCount: 0,
      requiredCount: 5,
    };
  }

  return HydrioHealth.getStatus();
}

export async function requestHealthPermissions() {
  return HydrioHealth.requestHealthPermissions();
}

export async function readTodayHealthSummary(): Promise<HealthTodaySummary> {
  const summary = await HydrioHealth.readToday();
  saveTodayHealthSummary(summary);
  return summary;
}

export async function openHealthConnectSettings(): Promise<void> {
  return HydrioHealth.openHealthConnect();
}
