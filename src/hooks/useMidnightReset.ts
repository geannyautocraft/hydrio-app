import { useEffect, useState } from 'react';
import { getTodayKey, getMsUntilMidnight } from '../utils/date';

export function useMidnightReset() {
  const [todayKey, setTodayKey] = useState(getTodayKey);

  useEffect(() => {
    const scheduleReset = () => {
      const ms = getMsUntilMidnight();
      return setTimeout(() => {
        setTodayKey(getTodayKey());
        scheduleReset();
      }, ms + 100);
    };

    const timer = scheduleReset();
    return () => clearTimeout(timer);
  }, []);

  return todayKey;
}
