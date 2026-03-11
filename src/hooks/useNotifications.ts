import { useEffect, useRef, useCallback } from 'react';
import { useHydrationStore } from '../store/useHydrationStore';

const MESSAGES = [
  'Time to hydrate 💧',
  'A small sip keeps you on track.',
  'Stay hydrated! Drink some water.',
  'Your body needs water — take a sip!',
  'Hydration check! Have you had water recently?',
];

function getRandomMessage() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

export function useNotifications() {
  const { enabled, intervalMinutes } = useHydrationStore((s) => s.notifications);
  const setNotifications = useHydrationStore((s) => s.setNotifications);
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

  useEffect(() => {
    clearTimer();

    if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const sendNotification = () => {
      new Notification('Hydrio', {
        body: getRandomMessage(),
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      });
    };

    intervalRef.current = setInterval(sendNotification, intervalMinutes * 60 * 1000);

    return clearTimer;
  }, [enabled, intervalMinutes, clearTimer]);

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
