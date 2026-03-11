import { usePremiumStore } from '../store/usePremiumStore';
import type { PlanType, PremiumFeature } from '../types';
import { trackEvent } from '../services/analyticsService';

export function usePremium() {
  const plan = usePremiumStore((s) => s.plan);
  const setPlan = usePremiumStore((s) => s.setPlan);
  const storeDowngrade = usePremiumStore((s) => s.downgrade);
  const billingCycle = usePremiumStore((s) => s.billingCycle);

  const isPremium = plan !== 'free';

  const hasFeature = (feature: PremiumFeature) => {
    if (isPremium) return true;
    void feature;
    return false;
  };

  const upgrade = (planType: PlanType, cycle?: 'monthly' | 'yearly') => {
    trackEvent('premium_upgrade_clicked');
    setPlan(planType, cycle);
  };

  const upgradeMonthly = () => upgrade('premium_subscription', 'monthly');
  const upgradeYearly = () => upgrade('premium_subscription', 'yearly');
  const upgradeLifetime = () => upgrade('lifetime');
  const downgrade = () => storeDowngrade();

  return { plan, isPremium, hasFeature, upgrade, upgradeMonthly, upgradeYearly, upgradeLifetime, downgrade, billingCycle };
}
