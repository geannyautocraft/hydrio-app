import { useTranslation } from 'react-i18next';
import { usePremium } from '../hooks/usePremium';
import { PREMIUM_FEATURES } from '../types';
import type { PremiumFeature } from '../types';

interface UpgradeModalProps {
  onClose: () => void;
}

const FEATURE_ICONS: Record<PremiumFeature, string> = {
  advanced_insights: '📊',
  extended_history: '📅',
  data_export: '📤',
  advanced_charts: '📈',
  multiple_profiles: '👥',
};

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  const { t } = useTranslation();
  const { upgrade } = usePremium();

  const handleUpgrade = () => {
    upgrade();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('premium.upgradeTitle')}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('premium.upgradeDesc')}</p>
        </div>

        <div className="mb-5 space-y-2.5">
          {(Object.keys(PREMIUM_FEATURES) as PremiumFeature[]).map((key) => (
            <div key={key} className="flex items-start gap-3 rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-gray-700/50">
              <span className="mt-0.5 text-base">{FEATURE_ICONS[key]}</span>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{t(`premium.${key}`)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t(`premium.${key}_desc`)}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleUpgrade} className="mb-2 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-amber-600 hover:to-orange-600 active:scale-[0.98]">
          {t('premium.unlockFeatures')}
        </button>
        <button onClick={onClose} className="w-full rounded-xl py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          {t('premium.maybeLater')}
        </button>
      </div>
    </div>
  );
}
