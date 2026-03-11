import { usePremiumStore } from '../store/usePremiumStore';
import type { PremiumFeature } from '../types';

export function usePremium() {
  const plan = usePremiumStore((s) => s.plan);
  const setPlan = usePremiumStore((s) => s.setPlan);

  const isPremium = plan === 'premium';

  const hasFeature = (feature: PremiumFeature) => {
    if (isPremium) return true;
    // Free users don't get premium features
    void feature;
    return false;
  };

  const upgrade = () => setPlan('premium');
  const downgrade = () => setPlan('free');

  return { plan, isPremium, hasFeature, upgrade, downgrade };
}
