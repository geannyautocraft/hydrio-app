import { PREMIUM_PRICING } from '../types';
import type { PlanType } from '../types';

export function getPlanLabel(plan: PlanType, billingCycle: 'monthly' | 'yearly' | null): string {
  switch (plan) {
    case 'premium_subscription':
      return billingCycle === 'yearly' ? 'Premium (Yearly)' : 'Premium (Monthly)';
    case 'lifetime':
      return 'Premium (Lifetime)';
    default:
      return 'Free';
  }
}

export function getPricing() {
  return PREMIUM_PRICING;
}

export function calculateSavings(): string {
  const monthlyAnnual = PREMIUM_PRICING.monthly.price * 12;
  const yearlyCost = PREMIUM_PRICING.yearly.price;
  const savings = Math.round(((monthlyAnnual - yearlyCost) / monthlyAnnual) * 100);
  return `${savings}%`;
}
