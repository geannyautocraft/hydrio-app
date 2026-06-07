import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import type { DayRecord, UserProfile, NotificationSettings } from '../types';

export interface SyncedHydrationState {
  goalMl: number;
  records: Record<string, DayRecord>;
  quickPresets: number[];
  userProfile: UserProfile;
  notifications: NotificationSettings;
}

function userStateRef(uid: string) {
  return doc(firestore, 'users', uid, 'state', 'hydration');
}

export async function loadHydrationState(uid: string): Promise<SyncedHydrationState | null> {
  const snap = await getDoc(userStateRef(uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (!data || typeof data !== 'object') return null;
  const state = data as SyncedHydrationState;
  const notifications = state.notifications ?? {};
  return {
    ...state,
    notifications: {
      ...notifications,
      wakeTime: notifications.wakeTime ?? '07:00',
      sleepTime: notifications.sleepTime ?? '23:00',
    },
  };
}

export async function saveHydrationState(uid: string, state: SyncedHydrationState): Promise<void> {
  await setDoc(
    userStateRef(uid),
    { ...state, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
