/**
 * Google Play Billing integration via cordova-plugin-purchase (CdvPurchase).
 *
 * Product IDs (must match Google Play Console):
 *   - hydrio_premium_monthly  (subscription, $0.99/month)
 *   - hydrio_premium_yearly   (subscription, $4.99/year)
 *   - hydrio_premium_lifetime (in-app product, $9.99)
 */

import { Capacitor } from '@capacitor/core';

export const PRODUCT_IDS = {
  monthly: 'hydrio_premium_monthly',
  yearly: 'hydrio_premium_yearly',
  lifetime: 'hydrio_premium_lifetime',
} as const;

export type ProductKey = keyof typeof PRODUCT_IDS;

export interface ProductInfo {
  id: string;
  title: string;
  price: string;
  available: boolean;
}

export interface BillingCallbacks {
  onPurchaseApproved: (productId: string) => void;
  onPurchaseError: (error: string) => void;
  onRestoreCompleted: (productIds: string[]) => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    CdvPurchase?: any;
  }
}

let initialized = false;
let callbacks: BillingCallbacks | null = null;
let storeRef: any = null;

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/** Wait for CdvPurchase to be available (Cordova plugin loads async) */
function waitForCdvPurchase(timeout = 10000): Promise<any> {
  return new Promise((resolve) => {
    if (window.CdvPurchase) {
      resolve(window.CdvPurchase);
      return;
    }

    const start = Date.now();
    const check = () => {
      if (window.CdvPurchase) {
        resolve(window.CdvPurchase);
      } else if (Date.now() - start > timeout) {
        console.warn('[Billing] CdvPurchase not available after timeout');
        resolve(null);
      } else {
        setTimeout(check, 200);
      }
    };

    // Also listen for deviceready
    document.addEventListener('deviceready', () => {
      setTimeout(check, 500);
    }, false);

    check();
  });
}

export async function initBilling(cb: BillingCallbacks): Promise<void> {
  callbacks = cb;

  if (!isNative()) {
    initialized = true;
    return;
  }

  if (initialized) return;

  const CdvPurchase = await waitForCdvPurchase();
  if (!CdvPurchase || !CdvPurchase.store) {
    console.warn('[Billing] Plugin not loaded');
    initialized = true;
    return;
  }

  const store = CdvPurchase.store;
  storeRef = store;

  // Use string literals — CdvPurchase constants can be undefined in some versions
  const PLATFORM = CdvPurchase.Platform?.GOOGLE_PLAY ?? 'android-playstore';
  const SUB_TYPE = CdvPurchase.ProductType?.PAID_SUBSCRIPTION ?? 'paid subscription';
  const NON_CONSUMABLE_TYPE = CdvPurchase.ProductType?.NON_CONSUMABLE ?? 'non consumable';
  platformId = PLATFORM;

  console.log('[Billing] Platform:', PLATFORM, 'SubType:', SUB_TYPE, 'NCType:', NON_CONSUMABLE_TYPE);

  try {
    // Register products with explicit string values
    store.register([
      {
        id: PRODUCT_IDS.monthly,
        type: SUB_TYPE,
        platform: PLATFORM,
      },
      {
        id: PRODUCT_IDS.yearly,
        type: SUB_TYPE,
        platform: PLATFORM,
      },
      {
        id: PRODUCT_IDS.lifetime,
        type: NON_CONSUMABLE_TYPE,
        platform: PLATFORM,
      },
    ]);

    console.log('[Billing] Products registered');

    // Handle purchase lifecycle
    store.when()
      .approved((transaction: any) => {
        console.log('[Billing] Purchase approved');
        transaction.finish();
      })
      .verified((receipt: any) => {
        console.log('[Billing] Receipt verified');
        receipt.finish();
      })
      .finished((transaction: any) => {
        const productId = transaction.products?.[0]?.id;
        console.log('[Billing] Transaction finished:', productId);
        if (productId && callbacks?.onPurchaseApproved) {
          callbacks.onPurchaseApproved(productId);
        }
      });

    // Add error handler (suppress user cancellations)
    store.error((err: any) => {
      const msg = String(err?.message || err || '').toLowerCase();
      if (msg.includes('cancel') || msg.includes('user')) return;
      console.error('[Billing] Store error:', err);
    });

    // Initialize
    await store.initialize([PLATFORM]);
    initialized = true;
    console.log('[Billing] Initialized OK');

    // Log registered products for debugging
    for (const key of Object.keys(PRODUCT_IDS) as ProductKey[]) {
      const product = store.get(PRODUCT_IDS[key]);
      console.log(`[Billing] Product ${PRODUCT_IDS[key]}:`, product ? 'found' : 'NOT found');
    }
  } catch (err) {
    console.error('[Billing] Init error:', err);
    initialized = true;
  }
}

// Fallback prices
const FALLBACK_PRODUCTS: Record<ProductKey, ProductInfo> = {
  monthly: { id: PRODUCT_IDS.monthly, title: 'Premium Monthly', price: '$0.99', available: true },
  yearly: { id: PRODUCT_IDS.yearly, title: 'Premium Yearly', price: '$4.99', available: true },
  lifetime: { id: PRODUCT_IDS.lifetime, title: 'Premium Lifetime', price: '$9.99', available: true },
};

// Store the platform string for reuse
let platformId = 'android-playstore';

export function getProductInfo(key: ProductKey): ProductInfo {
  const id = PRODUCT_IDS[key];

  if (isNative() && storeRef) {
    // v13 API: store.get(id, platform) returns a Product
    const product = storeRef.get(id, platformId) || storeRef.get(id);
    if (product) {
      // Price can be on product.pricing or on the first offer
      const price = product.pricing?.price
        || product.offers?.[0]?.pricingPhases?.[0]?.price
        || product.offers?.[0]?.pricing?.price;
      if (price) {
        return {
          id,
          title: product.title || FALLBACK_PRODUCTS[key].title,
          price,
          available: product.canPurchase ?? true,
        };
      }
    }
  }

  return FALLBACK_PRODUCTS[key];
}

export async function purchase(key: ProductKey): Promise<boolean> {
  const id = PRODUCT_IDS[key];

  if (!isNative()) {
    callbacks?.onPurchaseApproved(id);
    return true;
  }

  if (!storeRef) {
    callbacks?.onPurchaseError('Google Play not available. Please try again later.');
    return false;
  }

  try {
    // v13 API: get the product, then get its offer, then order the offer
    const product = storeRef.get(id, platformId) || storeRef.get(id);

    if (!product) {
      callbacks?.onPurchaseError(`Product not found: ${id}. Please restart the app.`);
      return false;
    }

    // Get the first available offer
    const offer = product.getOffer?.() || product.offers?.[0];

    if (!offer) {
      callbacks?.onPurchaseError(`No offer available for: ${id}. Please try again later.`);
      return false;
    }

    // Order the offer (this opens the Google Play purchase dialog)
    const result = await storeRef.order(offer);
    if (result?.isError) {
      const msg = (result.message || '').toLowerCase();
      // User cancelled — must still notify so UI loading state resets.
      // useBilling treats messages containing "cancel" as non-error (no toast),
      // but uses the callback to flip loading=false.
      if (msg.includes('cancel') || msg.includes('user') || result.code === 1) {
        callbacks?.onPurchaseError('Purchase cancelled');
        return false;
      }
      callbacks?.onPurchaseError(result.message || 'Purchase failed. Please try again.');
      return false;
    }
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes('cancel')) {
      callbacks?.onPurchaseError('Purchase cancelled');
      return false;
    }
    callbacks?.onPurchaseError(`Purchase error: ${message}`);
    return false;
  }
}

export async function restorePurchases(): Promise<void> {
  if (!isNative() || !storeRef) {
    callbacks?.onRestoreCompleted([]);
    return;
  }

  try {
    await storeRef.restorePurchases();
    const ownedIds = Object.values(PRODUCT_IDS).filter((id) => storeRef.owned(id));
    callbacks?.onRestoreCompleted(ownedIds);
  } catch (err) {
    console.error('[Billing] Restore error:', err);
    callbacks?.onRestoreCompleted([]);
  }
}

export function isProductOwned(key: ProductKey): boolean {
  if (!isNative() || !storeRef) return false;
  return storeRef.owned(PRODUCT_IDS[key]);
}

export function productIdToPlan(productId: string): { plan: 'premium_subscription' | 'lifetime'; cycle?: 'monthly' | 'yearly' } | null {
  switch (productId) {
    case PRODUCT_IDS.monthly:
      return { plan: 'premium_subscription', cycle: 'monthly' };
    case PRODUCT_IDS.yearly:
      return { plan: 'premium_subscription', cycle: 'yearly' };
    case PRODUCT_IDS.lifetime:
      return { plan: 'lifetime' };
    default:
      return null;
  }
}
