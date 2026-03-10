import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';

export interface HydrationInsight {
  message: string;
  type: 'info' | 'success' | 'warning';
}

export function useHydrationInsights(): HydrationInsight {
  const goalMl = useHydrationStore((s) => s.goalMl);
  const todayRecord = useTodayRecord();
  const presets = useHydrationStore((s) => s.quickPresets);
  const currentMl = todayRecord.totalMl;
  const remaining = goalMl - currentMl;
  const ratio = goalMl > 0 ? currentMl / goalMl : 0;

  if (currentMl === 0) {
    return { message: 'Start your day with a glass of water!', type: 'info' };
  }

  if (ratio >= 2) {
    return { message: "You're significantly above your goal. Stay balanced.", type: 'warning' };
  }

  if (ratio >= 1.5) {
    return { message: "That's well above your goal. You're very hydrated!", type: 'warning' };
  }

  if (ratio >= 1) {
    return { message: 'Goal reached 🎉 Great hydration today!', type: 'success' };
  }

  // Smart suggestion: find a preset that would reach or get close to the goal
  const bestPreset = presets.find((p) => p >= remaining);
  if (bestPreset) {
    return {
      message: `If you drink ${bestPreset} ml now, you'll reach your goal!`,
      type: 'info',
    };
  }

  if (remaining <= 250) {
    return { message: `Almost there! Only ${remaining} ml to go.`, type: 'info' };
  }

  return { message: `You need ${remaining} ml to reach your goal.`, type: 'info' };
}
