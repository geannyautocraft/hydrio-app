import { useEffect, useState } from 'react';
import { useHydrationStore } from '../store/useHydrationStore';
import { loadHydrationState, saveHydrationState, type SyncedHydrationState } from '../services/sync';
import {
  DEFAULT_GOAL_ML,
  DEFAULT_PRESETS,
  DEFAULT_REMINDER_INTERVAL,
  type ActivityLevel,
} from '../types';

function getDefaultSyncedState(): SyncedHydrationState {
  return {
    goalMl: DEFAULT_GOAL_ML,
    records: {},
    quickPresets: DEFAULT_PRESETS,
    userProfile: {
      weightKg: null,
      recommendedGoal: DEFAULT_GOAL_ML,
      customGoal: null,
      activityLevel: 'moderate' as ActivityLevel,
      weatherAdjust: false,
    },
    notifications: {
      enabled: false,
      intervalMinutes: DEFAULT_REMINDER_INTERVAL,
    },
  };
}

interface SyncState {
  loading: boolean;
  error: Error | null;
}

const WRITE_DEBOUNCE_MS = 800;

function pickSyncedState(state: ReturnType<typeof useHydrationStore.getState>): SyncedHydrationState {
  return {
    goalMl: state.goalMl,
    records: state.records,
    quickPresets: state.quickPresets,
    userProfile: state.userProfile,
    notifications: state.notifications,
  };
}

export function useFirestoreSync(uid: string | null): SyncState {
  const [state, setState] = useState<SyncState>({ loading: true, error: null });

  useEffect(() => {
    if (!uid) {
      setState({ loading: true, error: null });
      return;
    }

    let cancelled = false;
    let writeTimer: ReturnType<typeof setTimeout> | null = null;
    let unsubscribeStore: (() => void) | null = null;
    let hydrated = false;

    console.log('[sync] effect START for uid=', uid);

    // Reset store to defaults immediately on uid change — prevents stale data
    // from previous user from being visible (or written back) during the load.
    useHydrationStore.setState((prev) => ({ ...prev, ...getDefaultSyncedState() }));
    console.log('[sync] store reset to defaults');

    (async () => {
      try {
        const remote = await loadHydrationState(uid);
        if (cancelled) {
          console.log('[sync] effect cancelled before applying remote, uid=', uid);
          return;
        }
        console.log('[sync] loaded remote for uid=', uid, 'weightKg=', remote?.userProfile?.weightKg, 'exists=', !!remote);

        if (remote) {
          useHydrationStore.setState((prev) => ({ ...prev, ...remote }));
          console.log('[sync] applied remote to store, weight now=', useHydrationStore.getState().userProfile.weightKg);
        }
        hydrated = true;
        setState({ loading: false, error: null });

        unsubscribeStore = useHydrationStore.subscribe((s) => {
          if (!hydrated) return;
          if (writeTimer) clearTimeout(writeTimer);
          writeTimer = setTimeout(() => {
            console.log('[sync] WRITE uid=', uid, 'weightKg=', s.userProfile.weightKg);
            saveHydrationState(uid, pickSyncedState(s)).catch((err) => {
              if (import.meta.env.DEV) console.warn('[sync] save failed', err);
            });
          }, WRITE_DEBOUNCE_MS);
        });
      } catch (error) {
        if (cancelled) return;
        setState({ loading: false, error: error as Error });
      }
    })();

    return () => {
      console.log('[sync] effect CLEANUP for uid=', uid);
      cancelled = true;
      if (writeTimer) clearTimeout(writeTimer);
      if (unsubscribeStore) unsubscribeStore();
    };
  }, [uid]);

  return state;
}
