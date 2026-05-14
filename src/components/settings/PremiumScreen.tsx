import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePremium } from '../../hooks/usePremium';
import { useBilling } from '../../hooks/useBilling';
import { UpgradeModal } from '../UpgradeModal';
import { ProfileSwitcher } from '../ProfileSwitcher';

export function PremiumScreen() {
  const { t } = useTranslation();
  const { isPremium } = usePremium();
  const { restore, loading: billingLoading } = useBilling();
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <div className="space-y-4">
      {isPremium ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-center dark:border-green-800 dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            {t('settings.premiumActive')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowUpgrade(true)}
            className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-amber-600 hover:to-orange-600 active:scale-[0.98]"
          >
            {t('settings.upgradePremium')}
          </button>
          <button
            type="button"
            onClick={restore}
            disabled={billingLoading}
            className="w-full rounded-lg py-2 text-xs font-medium text-blue-500 transition-colors hover:text-blue-700 disabled:opacity-50 dark:text-blue-400"
          >
            {t('premium.restorePurchases')}
          </button>
        </div>
      )}

      <ProfileSwitcher />

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
