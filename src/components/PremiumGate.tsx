import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { usePremium } from '../hooks/usePremium';
import { UpgradeModal } from './UpgradeModal';
import type { PremiumFeature } from '../types';

interface PremiumGateProps {
  feature: PremiumFeature;
  children: ReactNode;
}

export function PremiumGate({ feature, children }: PremiumGateProps) {
  const { t } = useTranslation();
  const { hasFeature } = usePremium();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="pointer-events-none select-none opacity-30 blur-[2px]">
          <div className="h-24" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white/80 dark:bg-gray-800/80">
          <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {t('premium.label')}
          </span>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {t(`premium.${feature}`)}
          </p>
          <button
            onClick={() => setShowUpgrade(true)}
            className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:from-amber-600 hover:to-orange-600 active:scale-[0.98]"
          >
            {t('premium.unlock')}
          </button>
        </div>
      </div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
