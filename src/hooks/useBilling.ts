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
import { savePremium } from '../services/premiumSync';
import { firebaseAuth } from '../lib/firebase';

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

  const writePremiumToFirestore = useCallback((plan: 'premium_subscription' | 'lifetime', cycle: 'monthly' | 'yearly' | null, productIds: string[]) => {
    const uid = firebaseAuth.currentUser?.uid;
    if (!uid) return;
    void savePremium(uid, {
      plan,
      billingCycle: cycle,
      subscribedAt: new Date().toISOString(),
      ownedProductIds: productIds,
    });
  }, []);

  const applyOwnedProducts = useCallback((productIds: string[]) => {
    if (productIds.length === 0) return;
    const lifetimeOwned = productIds.includes('hydrio_premium_lifetime');
    const yearlyOwned = productIds.includes('hydrio_premium_yearly');

    if (lifetimeOwned) {
      setPlan('lifetime');
      writePremiumToFirestore('lifetime', null, productIds);
    } else if (yearlyOwned) {
      setPlan('premium_subscription', 'yearly');
      writePremiumToFirestore('premium_subscription', 'yearly', productIds);
    } else {
      setPlan('premium_subscription', 'monthly');
      writePremiumToFirestore('premium_subscription', 'monthly', productIds);
    }
  }, [setPlan, writePremiumToFirestore]);

  useEffect(() => {
    initBilling({
      onPurchaseApproved: (productId) => {
        const result = productIdToPlan(productId);
        if (result) {
          setPlan(result.plan, result.cycle);
          writePremiumToFirestore(result.plan, result.cycle ?? null, [productId]);
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
  }, [setPlan, applyOwnedProducts, writePremiumToFirestore]);

  const purchaseProduct = useCallback(async (key: ProductKey) => {
    setLoading(true);
    setError(null);
    trackEvent('premium_prompt_opened');
    try {
      await purchase(key);
    } finally {
      // Always reset loading after the order() returns (success/cancel/error).
      // Premium activation will update separately when .approved/.finished fires.
      setLoading(false);
    }
  }, []);

  const restore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await restorePurchases();
    } finally {
      setLoading(false);
    }
  }, []);

  const products: Record<ProductKey, ProductInfo> = {
    monthly: getProductInfo('monthly'),
    yearly: getProductInfo('yearly'),
    lifetime: getProductInfo('lifetime'),
  };

  return { ready, loading, error, products, purchaseProduct, restore };
}
