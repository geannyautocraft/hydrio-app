import { useEffect } from 'react';
import { usePremiumStore } from '../store/usePremiumStore';
import { loadPremium } from '../services/premiumSync';

/**
 * Pulls Premium status from Firestore whenever the user's uid changes.
 * - If Firestore has Premium AND local is free → restore local from cloud
 * - If Firestore has no Premium doc → don't touch local (local Play Store
 *   purchase still wins via useBilling's auto-restore)
 *
 * When a new user signs in (different uid), we explicitly reset local Premium
 * before loading, so previous user's Premium doesn't leak.
 */
export function usePremiumSync(uid: string | null) {
  const setPlan = usePremiumStore((s) => s.setPlan);
  const downgrade = usePremiumStore((s) => s.downgrade);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;

    // On uid change, reset local then attempt to restore from cloud.
    downgrade();

    void (async () => {
      const remote = await loadPremium(uid);
      if (cancelled) return;
      if (remote && remote.plan !== 'free') {
        if (remote.plan === 'lifetime') {
          setPlan('lifetime');
        } else if (remote.plan === 'premium_subscription') {
          setPlan('premium_subscription', remote.billingCycle ?? 'monthly');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid, setPlan, downgrade]);
}
