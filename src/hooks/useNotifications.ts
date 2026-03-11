import { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';

const MESSAGE_KEYS = [
  'notifications.timeToHydrate',
  'notifications.smallSip',
  'notifications.stayHydrated',
  'notifications.bodyNeeds',
  'notifications.hydrationCheck',
];

const GENTLE_MESSAGE_KEYS = [
  'notifications.doingWell',
  'notifications.keepMomentum',
  'notifications.stayConsistent',
];

function getRandomKey(keys: string[]) {
  return keys[Math.floor(Math.random() * keys.length)];
}

export function useNotifications() {
  const { t } = useTranslation();
  const { enabled, intervalMinutes } = useHydrationStore((s) => s.notifications);
  const setNotifications = useHydrationStore((s) => s.setNotifications);
  const goalMl = useHydrationStore((s) => s.goalMl);
  const todayRecord = useTodayRecord();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tRef = useRef(t);
  tRef.current = t;

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
      const keys = percentage >= 60 ? GENTLE_MESSAGE_KEYS : MESSAGE_KEYS;

      new Notification('Hydrio', {
        body: tRef.current(getRandomKey(keys)),
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
