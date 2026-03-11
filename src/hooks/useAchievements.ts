import { useState, useEffect, useCallback } from 'react';
import { useHydrationStore } from '../store/useHydrationStore';
import {
  ACHIEVEMENTS,
  loadAchievements,
  saveAchievements,
  checkAchievements,
  type AchievementDef,
} from '../services/achievementService';

export interface AchievementWithStatus extends AchievementDef {
  unlocked: boolean;
  unlockedAt: string | null;
}

export function useAchievements() {
  const records = useHydrationStore((s) => s.records);
  const goalMl = useHydrationStore((s) => s.goalMl);
  const [progress, setProgress] = useState(loadAchievements);

  const refresh = useCallback(() => {
    const current = loadAchievements();
    const updated = checkAchievements(records, goalMl, current);
    saveAchievements(updated);
    setProgress(updated);
  }, [records, goalMl]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const achievements: AchievementWithStatus[] = ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: !!progress[a.id],
    unlockedAt: progress[a.id] ?? null,
  }));

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return { achievements, unlockedCount, total: ACHIEVEMENTS.length };
}
