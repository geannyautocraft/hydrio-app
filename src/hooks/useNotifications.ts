import { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
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

const NOTIFICATION_CHANNEL_ID = 'hydrio-reminders';

async function ensureNativeChannel() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: NOTIFICATION_CHANNEL_ID,
      name: 'Hydration Reminders',
      description: 'Reminders to drink water',
      importance: 3,
      visibility: 1,
      vibration: true,
    });
  } catch {
    // Channel may already exist
  }
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

  const isNative = Capacitor.isNativePlatform();

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (isNative) {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    }
    // Browser fallback
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }, [isNative]);

  const scheduleNativeNotifications = useCallback(async (intervalMins: number) => {
    if (!isNative) return;

    // Cancel existing scheduled notifications
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }

    await ensureNativeChannel();

    // Schedule repeating notifications for the next 12 hours
    const notifications = [];
    const now = Date.now();
    const count = Math.floor((12 * 60) / intervalMins);

    for (let i = 1; i <= count; i++) {
      const keys = i <= count * 0.6 ? MESSAGE_KEYS : GENTLE_MESSAGE_KEYS;
      notifications.push({
        id: 1000 + i,
        title: 'Hydrio',
        body: tRef.current(getRandomKey(keys)),
        schedule: { at: new Date(now + i * intervalMins * 60 * 1000) },
        channelId: NOTIFICATION_CHANNEL_ID,
        smallIcon: 'ic_launcher',
        iconColor: '#3B82F6',
      });
    }

    await LocalNotifications.schedule({ notifications });
  }, [isNative]);

  const enable = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      setNotifications({ enabled: true });
      if (isNative) {
        await scheduleNativeNotifications(intervalMinutes);
      }
    }
    return granted;
  }, [requestPermission, setNotifications, isNative, scheduleNativeNotifications, intervalMinutes]);

  const disable = useCallback(async () => {
    setNotifications({ enabled: false });
    clearTimer();
    if (isNative) {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
    }
  }, [setNotifications, clearTimer, isNative]);

  const setInterval_ = useCallback(
    (minutes: number) => {
      setNotifications({ intervalMinutes: minutes });
      if (isNative && enabled) {
        scheduleNativeNotifications(minutes);
      }
    },
    [setNotifications, isNative, enabled, scheduleNativeNotifications]
  );

  const currentMl = todayRecord.totalMl;
  const percentage = goalMl > 0 ? Math.round((currentMl / goalMl) * 100) : 0;

  // Browser notifications (fallback for non-native)
  useEffect(() => {
    if (isNative) return;

    clearTimer();

    if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const sendNotification = () => {
      if (percentage >= 100) return;

      const now = Date.now();
      const entries = todayRecord.entries;
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1];
        const lastTimestamp = new Date(lastEntry.timestamp).getTime();
        const minutesSinceLastLog = (now - lastTimestamp) / (1000 * 60);
        if (minutesSinceLastLog < 15) return;
      }

      const keys = percentage >= 60 ? GENTLE_MESSAGE_KEYS : MESSAGE_KEYS;

      new Notification('Hydrio', {
        body: tRef.current(getRandomKey(keys)),
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      });
    };

    const adjustedInterval = percentage >= 75
      ? intervalMinutes * 2
      : intervalMinutes;

    intervalRef.current = setInterval(sendNotification, adjustedInterval * 60 * 1000);

    return clearTimer;
  }, [isNative, enabled, intervalMinutes, clearTimer, percentage, todayRecord.entries]);

  // Native: reschedule when enabled or interval changes
  useEffect(() => {
    if (!isNative || !enabled) return;
    scheduleNativeNotifications(intervalMinutes);
  }, [isNative, enabled, intervalMinutes, scheduleNativeNotifications]);

  const checkSupported = () => {
    if (isNative) return true;
    return typeof window !== 'undefined' && 'Notification' in window;
  };

  return {
    enabled,
    intervalMinutes,
    supported: checkSupported(),
    permission: 'default' as NotificationPermission,
    enable,
    disable,
    setInterval: setInterval_,
  };
}
