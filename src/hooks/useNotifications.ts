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
const DEFAULT_WAKE_TIME = '07:00';
const DEFAULT_SLEEP_TIME = '23:00';

function parseTimeToMinutes(value: string | undefined, fallback: string): number {
  const source = value && /^\d{2}:\d{2}$/.test(value) ? value : fallback;
  const [hours, minutes] = source.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function isWithinAwakeWindow(date: Date, wakeTime: string, sleepTime: string): boolean {
  const wake = parseTimeToMinutes(wakeTime, DEFAULT_WAKE_TIME);
  const sleep = parseTimeToMinutes(sleepTime, DEFAULT_SLEEP_TIME);
  const current = minutesSinceMidnight(date);

  if (wake === sleep) return true;
  if (wake < sleep) return current >= wake && current < sleep;
  return current >= wake || current < sleep;
}

function nextAwakeStart(from: Date, wakeTime: string): Date {
  const wake = parseTimeToMinutes(wakeTime, DEFAULT_WAKE_TIME);
  const next = new Date(from);
  next.setHours(Math.floor(wake / 60), wake % 60, 0, 0);
  if (next <= from) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

function nextReminderTime(from: Date, intervalMins: number, wakeTime: string, sleepTime: string): Date {
  const candidate = new Date(from.getTime() + intervalMins * 60 * 1000);
  if (isWithinAwakeWindow(candidate, wakeTime, sleepTime)) return candidate;
  return nextAwakeStart(candidate, wakeTime);
}

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
  const { enabled, intervalMinutes, wakeTime, sleepTime } = useHydrationStore((s) => s.notifications);
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

  const scheduleNativeNotifications = useCallback(async (
    intervalMins: number,
    awakeStart: string,
    asleepAt: string
  ) => {
    if (!isNative) return;

    // Cancel existing scheduled notifications
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }

    await ensureNativeChannel();

    const notifications = [];
    let nextTime = nextReminderTime(new Date(), intervalMins, awakeStart, asleepAt);
    const horizon = Date.now() + 36 * 60 * 60 * 1000;

    for (let i = 1; i <= 40 && nextTime.getTime() <= horizon; i++) {
      const keys = i <= 8 ? MESSAGE_KEYS : GENTLE_MESSAGE_KEYS;
      notifications.push({
        id: 1000 + i,
        title: 'Hydrio',
        body: tRef.current(getRandomKey(keys)),
        schedule: { at: nextTime },
        channelId: NOTIFICATION_CHANNEL_ID,
        smallIcon: 'ic_launcher',
        iconColor: '#3B82F6',
      });
      nextTime = nextReminderTime(nextTime, intervalMins, awakeStart, asleepAt);
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  }, [isNative]);

  const enable = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      setNotifications({ enabled: true });
      if (isNative) {
        await scheduleNativeNotifications(intervalMinutes, wakeTime, sleepTime);
      }
    }
    return granted;
  }, [requestPermission, setNotifications, isNative, scheduleNativeNotifications, intervalMinutes, wakeTime, sleepTime]);

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
        scheduleNativeNotifications(minutes, wakeTime, sleepTime);
      }
    },
    [setNotifications, isNative, enabled, scheduleNativeNotifications, wakeTime, sleepTime]
  );

  const setAwakeWindow = useCallback(
    (nextWakeTime: string, nextSleepTime: string) => {
      setNotifications({ wakeTime: nextWakeTime, sleepTime: nextSleepTime });
      if (isNative && enabled) {
        scheduleNativeNotifications(intervalMinutes, nextWakeTime, nextSleepTime);
      }
    },
    [setNotifications, isNative, enabled, scheduleNativeNotifications, intervalMinutes]
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
      if (!isWithinAwakeWindow(new Date(), wakeTime, sleepTime)) return;

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
  }, [isNative, enabled, intervalMinutes, clearTimer, percentage, todayRecord.entries, wakeTime, sleepTime]);

  // Native: reschedule when enabled or interval changes
  useEffect(() => {
    if (!isNative || !enabled) return;
    scheduleNativeNotifications(intervalMinutes, wakeTime, sleepTime);
  }, [isNative, enabled, intervalMinutes, scheduleNativeNotifications, wakeTime, sleepTime]);

  const checkSupported = () => {
    if (isNative) return true;
    return typeof window !== 'undefined' && 'Notification' in window;
  };

  return {
    enabled,
    intervalMinutes,
    wakeTime,
    sleepTime,
    supported: checkSupported(),
    permission: 'default' as NotificationPermission,
    enable,
    disable,
    setInterval: setInterval_,
    setAwakeWindow,
  };
}
