import type { DayRecord } from '../types';

export interface CoachSuggestion {
  message: string;
  messageKey: string;
  messageParams?: Record<string, string | number>;
  type: 'behind' | 'on_track' | 'drink_now' | 'prediction' | 'completed' | 'rest' | 'activity';
  priority: number;
}

interface ActivityHydrationInput {
  activeCaloriesKcal: number;
  extraWaterMl: number;
  exerciseCount: number;
}

interface CoachInput {
  currentMl: number;
  goalMl: number;
  weightKg: number | null;
  entries: DayRecord['entries'];
  activity?: ActivityHydrationInput | null;
}

export function generateCoachSuggestions(input: CoachInput): CoachSuggestion[] {
  const { currentMl, goalMl, entries, activity } = input;
  const suggestions: CoachSuggestion[] = [];
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const ratio = goalMl > 0 ? currentMl / goalMl : 0;
  const remaining = Math.max(0, goalMl - currentMl);
  const lastEntry = entries[entries.length - 1];
  const minutesSinceLastLog = lastEntry
    ? (now.getTime() - new Date(lastEntry.timestamp).getTime()) / (1000 * 60)
    : null;

  if (ratio >= 1) {
    suggestions.push({
      message: '',
      messageKey: 'coach.goalCompleted',
      type: 'completed',
      priority: 1,
    });
    return suggestions;
  }

  // Calculate expected progress based on time of day (assuming 7am-11pm active window)
  const activeStart = 7;
  const activeEnd = 23;
  const activeWindow = activeEnd - activeStart;

  if (currentHour < activeStart || currentHour >= activeEnd) {
    suggestions.push({
      message: '',
      messageKey: ratio >= 1 ? 'coach.restCompleted' : 'coach.restMode',
      type: 'rest',
      priority: 1,
    });
    return suggestions;
  }

  if (minutesSinceLastLog !== null && minutesSinceLastLog < 15 && ratio < 1) {
    suggestions.push({
      message: '',
      messageKey: 'coach.recentSip',
      type: 'on_track',
      priority: 1,
    });
  }

  if (activity && activity.extraWaterMl >= 100 && (activity.activeCaloriesKcal > 0 || activity.exerciseCount > 0)) {
    const activityTarget = goalMl + activity.extraWaterMl;
    const activityRemaining = Math.max(0, activityTarget - currentMl);
    const suggestedActivityAmount = Math.min(
      activity.extraWaterMl,
      activityRemaining,
      500
    );
    const roundedActivityAmount = Math.max(50, Math.round(suggestedActivityAmount / 50) * 50);

    if (activityRemaining >= 100 && roundedActivityAmount >= 100) {
      suggestions.push({
        message: '',
        messageKey: 'coach.activityHydration',
        messageParams: {
          amount: roundedActivityAmount,
          calories: Math.round(activity.activeCaloriesKcal),
        },
        type: 'activity',
        priority: 1,
      });
    }
  }

  if (entries.length === 0 && currentHour < activeStart + 2) {
    suggestions.push({
      message: '',
      messageKey: 'coach.morningStart',
      type: 'drink_now',
      priority: 2,
    });
  }

  const elapsed = Math.max(0, Math.min(currentHour - activeStart, activeWindow));
  const expectedRatio = elapsed / activeWindow;
  const expectedMl = goalMl * expectedRatio;
  const scheduleDeficit = Math.max(0, expectedMl - currentMl);
  const isBehindSchedule = ratio < expectedRatio * 0.7 && currentHour > activeStart;
  let roundedAmount = 0;

  if (remaining > 0 && currentHour < activeEnd) {
    const hoursLeft = activeEnd - currentHour;
    const pacingAmount = remaining / Math.max(hoursLeft / 1.5, 1);
    const recommendedNow = Math.min(isBehindSchedule ? scheduleDeficit : pacingAmount, remaining, 500);
    roundedAmount = Math.min(remaining, Math.max(50, Math.round(recommendedNow / 50) * 50));
  }

  if (isBehindSchedule && roundedAmount < 50) {
    suggestions.push({
      message: '',
      messageKey: 'coach.behindSchedule',
      type: 'behind',
      priority: 1,
    });
  }

  // Drink recommendation based on remaining and time
  if (remaining > 0 && currentHour < activeEnd) {
    const hoursLeft = activeEnd - currentHour;
    const mlPerHour = Math.round(remaining / hoursLeft);

    if (roundedAmount >= 50) {
      suggestions.push({
        message: '',
        messageKey: isBehindSchedule ? 'coach.catchUpDrink' : 'coach.drinkNow',
        messageParams: { amount: roundedAmount },
        type: 'drink_now',
        priority: isBehindSchedule ? 1 : 2,
      });
    }

    // Prediction
    if (entries.length >= 2) {
      const firstEntry = new Date(entries[0].timestamp);
      const startHour = firstEntry.getHours() + firstEntry.getMinutes() / 60;
      const hoursElapsed = currentHour - startHour;

      if (hoursElapsed > 0) {
        const ratePerHour = currentMl / hoursElapsed;
        if (ratePerHour > 0) {
          const hoursNeeded = remaining / ratePerHour;
          const completionHour = currentHour + hoursNeeded;

          if (completionHour <= activeEnd) {
            const h = Math.floor(completionHour);
            const m = Math.round((completionHour - h) * 60);
            const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            suggestions.push({
              message: '',
              messageKey: 'coach.paceEstimate',
              messageParams: { time: timeStr },
              type: 'prediction',
              priority: 3,
            });
          } else {
            suggestions.push({
              message: '',
              messageKey: 'coach.needToPickUp',
              messageParams: { mlPerHour },
              type: 'behind',
              priority: 3,
            });
          }
        }
      }
    }
  }

  if (ratio >= expectedRatio * 0.9 && ratio < 1 && suggestions.every((s) => s.type !== 'behind')) {
    suggestions.push({
      message: '',
      messageKey: 'coach.onTrack',
      type: 'on_track',
      priority: 4,
    });
  }

  return suggestions.sort((a, b) => a.priority - b.priority);
}
