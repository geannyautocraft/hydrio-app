import { useEffect, useRef, useCallback } from 'react';
import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';

const MESSAGES = [
  'Time to hydrate 💧',
  'A small sip keeps you on track.',
  'Stay hydrated! Drink some water.',
  'Your body needs water — take a sip!',
  'Hydration check! Have you had water recently?',
];

const GENTLE_MESSAGES = [
  "You're doing well! A sip won't hurt though 💧",
  'Keep the momentum going!',
  'Stay consistent — have some water.',
];

function getRandomMessage(messages: string[]) {
  return messages[Math.floor(Math.random() * messages.length)];
}

export function useNotifications() {
  const { enabled, intervalMinutes } = useHydrationStore((s) => s.notifications);
  const setNotifications = useHydrationStore((s) => s.setNotifications);
  const goalMl = useHydrationStore((s) => s.goalMl);
  const todayRecord = useTodayRecord();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }, []);

  const enable = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      setNotifications({ enabled: true });
    }
    return granted;
  }, [requestPermission, setNotifications]);

  const disable = useCallback(() => {
    setNotifications({ enabled: false });
    clearTimer();
  }, [setNotifications, clearTimer]);

  const setInterval_ = useCallback(
    (minutes: number) => {
      setNotifications({ intervalMinutes: minutes });
    },
    [setNotifications]
  );

  const currentMl = todayRecord.totalMl;
  const percentage = goalMl > 0 ? Math.round((currentMl / goalMl) * 100) : 0;

  useEffect(() => {
    clearTimer();

    if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const sendNotification = () => {
      // Skip if goal already completed
      if (percentage >= 100) return;

      // Check if user recently logged water (within last 15 minutes)
      const now = Date.now();
      const entries = todayRecord.entries;
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1];
        const lastTimestamp = new Date(lastEntry.timestamp).getTime();
        const minutesSinceLastLog = (now - lastTimestamp) / (1000 * 60);
        if (minutesSinceLastLog < 15) return;
      }

      // Choose message based on progress
      const messages = percentage >= 60 ? GENTLE_MESSAGES : MESSAGES;

      new Notification('Hydrio', {
        body: getRandomMessage(messages),
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      });
    };

    // Adjust interval based on progress:
    // If doing well (>=75%), double the interval
    // If behind (<25%), use standard interval
    const adjustedInterval = percentage >= 75
      ? intervalMinutes * 2
      : intervalMinutes;

    intervalRef.current = setInterval(sendNotification, adjustedInterval * 60 * 1000);

    return clearTimer;
  }, [enabled, intervalMinutes, clearTimer, percentage, todayRecord.entries]);

  return {
    enabled,
    intervalMinutes,
    supported: typeof window !== 'undefined' && 'Notification' in window,
    permission: typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'denied' as NotificationPermission,
    enable,
    disable,
    setInterval: setInterval_,
  };
}
