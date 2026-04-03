import { useState, useEffect, useCallback } from 'react';
import {
  initBilling,
  purchase,
  restorePurchases,
  getProductInfo,
  productIdToPlan,
  type ProductKey,
  type ProductInfo,
} from '../services/billingService';
import { usePremiumStore } from '../store/usePremiumStore';
import { trackEvent } from '../services/analyticsService';

interface UseBillingReturn {
  ready: boolean;
  loading: boolean;
  error: string | null;
  products: Record<ProductKey, ProductInfo>;
  purchaseProduct: (key: ProductKey) => Promise<void>;
  restore: () => Promise<void>;
}

export function useBilling(): UseBillingReturn {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setPlan = usePremiumStore((s) => s.setPlan);

  const applyOwnedProducts = useCallback((productIds: string[]) => {
    if (productIds.length > 0) {
      const lifetimeOwned = productIds.includes('hydrio_premium_lifetime');
      const yearlyOwned = productIds.includes('hydrio_premium_yearly');

      if (lifetimeOwned) {
        setPlan('lifetime');
      } else if (yearlyOwned) {
        setPlan('premium_subscription', 'yearly');
      } else {
        setPlan('premium_subscription', 'monthly');
      }
    }
  }, [setPlan]);

  useEffect(() => {
    initBilling({
      onPurchaseApproved: (productId) => {
        const result = productIdToPlan(productId);
        if (result) {
          setPlan(result.plan, result.cycle);
          trackEvent('premium_upgrade_clicked');
        }
        setLoading(false);
        setError(null);
      },
      onPurchaseError: (err) => {
        // Don't show cancellation as error
        if (!err.toLowerCase().includes('cancel')) {
          setError(err);
        }
        setLoading(false);
      },
      onRestoreCompleted: (productIds) => {
        applyOwnedProducts(productIds);
        setLoading(false);
      },
    }).then(() => {
      setReady(true);
      // Auto-restore purchases on startup (handles reinstall)
      restorePurchases();
    });
  }, [setPlan, applyOwnedProducts]);

  const purchaseProduct = useCallback(async (key: ProductKey) => {
    setLoading(true);
    setError(null);
    trackEvent('premium_prompt_opened');
    await purchase(key);
    // Result handled by callbacks
  }, []);

  const restore = useCallback(async () => {
    setLoading(true);
    setError(null);
    await restorePurchases();
  }, []);

  const products: Record<ProductKey, ProductInfo> = {
    monthly: getProductInfo('monthly'),
    yearly: getProductInfo('yearly'),
    lifetime: getProductInfo('lifetime'),
  };

  return { ready, loading, error, products, purchaseProduct, restore };
}
