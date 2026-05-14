import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import type { PlanType } from '../types';

export interface SyncedPremiumState {
  plan: PlanType;
  billingCycle: 'monthly' | 'yearly' | null;
  subscribedAt: string | null;
  ownedProductIds: string[];
}

function premiumRef(uid: string) {
  return doc(firestore, 'users', uid, 'state', 'premium');
}

export async function loadPremium(uid: string): Promise<SyncedPremiumState | null> {
  try {
    const snap = await getDoc(premiumRef(uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (!data || typeof data !== 'object') return null;
    const plan = (data.plan as PlanType) ?? 'free';
    if (plan === 'free') return null;
    return {
      plan,
      billingCycle: (data.billingCycle as 'monthly' | 'yearly' | null) ?? null,
      subscribedAt: (data.subscribedAt as string | null) ?? null,
      ownedProductIds: Array.isArray(data.ownedProductIds) ? data.ownedProductIds : [],
    };
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[premiumSync] load failed', err);
    return null;
  }
}

export async function savePremium(uid: string, state: SyncedPremiumState): Promise<void> {
  try {
    await setDoc(premiumRef(uid), { ...state, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[premiumSync] save failed', err);
  }
}
