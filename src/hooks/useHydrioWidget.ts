import { useCallback, useEffect } from 'react';
import { useHydrationStore } from '../store/useHydrationStore';
import { consumeWidgetEntries, syncWidgetState } from '../services/widgetService';
import { getTodayKey } from '../utils/date';

export function useHydrioWidget(enabled: boolean) {
  const addExternalEntry = useHydrationStore((s) => s.addExternalEntry);
  const goalMl = useHydrationStore((s) => s.goalMl);
  const records = useHydrationStore((s) => s.records);

  const importPendingEntries = useCallback(() => {
    if (!enabled) return;
    void (async () => {
      const entries = await consumeWidgetEntries();
      for (const entry of entries) {
        addExternalEntry(entry.amount, entry.timestamp);
      }
    })();
  }, [addExternalEntry, enabled]);

  useEffect(() => {
    importPendingEntries();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') importPendingEntries();
    };

    window.addEventListener('focus', importPendingEntries);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', importPendingEntries);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [importPendingEntries]);

  useEffect(() => {
    if (!enabled) return;
    const today = getTodayKey();
    const totalMl = records[today]?.totalMl ?? 0;
    void syncWidgetState(today, totalMl, goalMl);
  }, [enabled, goalMl, records]);
}
