import type { DayRecord } from '../types';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_log', title: 'First Drop', description: 'Log your first water entry', icon: '💧' },
  { id: 'goal_reached', title: 'Goal Crusher', description: 'Reach your daily goal', icon: '🎯' },
  { id: 'streak_3', title: 'Hat Trick', description: 'Reach your goal 3 days in a row', icon: '🔥' },
  { id: 'streak_7', title: 'Week Warrior', description: 'Reach your goal 7 days in a row', icon: '⚡' },
  { id: 'morning_log', title: 'Early Bird', description: 'Log water before 8 AM', icon: '🌅' },
  { id: 'best_day', title: 'Overachiever', description: 'Drink 150% of your goal in a day', icon: '🏆' },
  { id: 'perfect_week', title: 'Perfect Week', description: 'Reach your goal every day for a week', icon: '⭐' },
];

const STORAGE_KEY = 'hydrio-achievements';

export function loadAchievements(): Record<string, string | null> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  const initial: Record<string, string | null> = {};
  for (const a of ACHIEVEMENTS) initial[a.id] = null;
  return initial;
}

export function saveAchievements(achievements: Record<string, string | null>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
}

export function checkAchievements(
  records: Record<string, DayRecord>,
  goalMl: number,
  current: Record<string, string | null>
): Record<string, string | null> {
  const updated = { ...current };
  const now = new Date().toISOString();
  const dates = Object.keys(records).sort();

  // First log
  if (!updated.first_log) {
    const hasAnyEntry = dates.some(d => records[d].entries.length > 0);
    if (hasAnyEntry) updated.first_log = now;
  }

  // Goal reached today
  if (!updated.goal_reached) {
    const today = formatDateKey(new Date());
    const todayRecord = records[today];
    if (todayRecord && todayRecord.totalMl >= goalMl) {
      updated.goal_reached = now;
    }
  }

  // Morning log (before 8 AM)
  if (!updated.morning_log) {
    for (const d of dates) {
      for (const entry of records[d].entries) {
        const hour = new Date(entry.timestamp).getHours();
        if (hour < 8) {
          updated.morning_log = now;
          break;
        }
      }
      if (updated.morning_log) break;
    }
  }

  // Best day (150%+ of goal)
  if (!updated.best_day) {
    for (const d of dates) {
      if (records[d].totalMl >= goalMl * 1.5) {
        updated.best_day = now;
        break;
      }
    }
  }

  // Streak calculations
  const streak = calculateStreak(records, goalMl);

  if (!updated.streak_3 && streak >= 3) updated.streak_3 = now;
  if (!updated.streak_7 && streak >= 7) updated.streak_7 = now;

  // Perfect week: any 7 consecutive days all reaching goal
  if (!updated.perfect_week) {
    const sortedDates = dates.sort();
    let consecutive = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      const d = sortedDates[i];
      if (records[d].totalMl >= goalMl) {
        consecutive++;
        if (consecutive >= 7) {
          // Verify they are truly consecutive
          const last7 = sortedDates.slice(i - 6, i + 1);
          if (areDatesConsecutive(last7)) {
            updated.perfect_week = now;
            break;
          }
        }
      } else {
        consecutive = 0;
      }
    }
  }

  return updated;
}

function calculateStreak(records: Record<string, DayRecord>, goalMl: number): number {
  let streak = 0;
  const date = new Date();
  // Start from yesterday (today is still in progress)
  date.setDate(date.getDate() - 1);

  for (let i = 0; i < 365; i++) {
    const key = formatDateKey(date);
    const record = records[key];
    if (record && record.totalMl >= goalMl) {
      streak++;
    } else {
      break;
    }
    date.setDate(date.getDate() - 1);
  }

  // Check if today also reaches the goal (extends streak)
  const todayKey = formatDateKey(new Date());
  const todayRecord = records[todayKey];
  if (todayRecord && todayRecord.totalMl >= goalMl) {
    streak++;
  }

  return streak;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function areDatesConsecutive(dates: string[]): boolean {
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + 'T00:00:00');
    const curr = new Date(dates[i] + 'T00:00:00');
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (Math.round(diff) !== 1) return false;
  }
  return true;
}
