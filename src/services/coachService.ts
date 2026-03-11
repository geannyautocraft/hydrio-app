import type { DayRecord } from '../types';

export interface CoachSuggestion {
  message: string;
  messageKey: string;
  messageParams?: Record<string, string | number>;
  type: 'behind' | 'on_track' | 'drink_now' | 'prediction' | 'completed';
  priority: number;
}

interface CoachInput {
  currentMl: number;
  goalMl: number;
  weightKg: number | null;
  entries: DayRecord['entries'];
}

export function generateCoachSuggestions(input: CoachInput): CoachSuggestion[] {
  const { currentMl, goalMl, entries } = input;
  const suggestions: CoachSuggestion[] = [];
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const ratio = goalMl > 0 ? currentMl / goalMl : 0;
  const remaining = goalMl - currentMl;

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
  const elapsed = Math.max(0, Math.min(currentHour - activeStart, activeWindow));
  const expectedRatio = elapsed / activeWindow;

  if (ratio < expectedRatio * 0.7 && currentHour > activeStart) {
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
    const recommendedNow = Math.min(Math.round(remaining / Math.max(hoursLeft / 1.5, 1)), 500);
    const roundedAmount = Math.round(recommendedNow / 50) * 50;

    if (roundedAmount >= 50) {
      suggestions.push({
        message: '',
        messageKey: 'coach.drinkNow',
        messageParams: { amount: roundedAmount },
        type: 'drink_now',
        priority: 2,
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
