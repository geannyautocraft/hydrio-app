import { useTranslation } from 'react-i18next';
import { usePremium } from '../hooks/usePremium';
import { trackEvent } from '../services/analyticsService';

interface UpgradeModalProps {
  onClose: () => void;
}

const HIGHLIGHT_FEATURES = [
  { icon: '🧠', key: 'smart_coach' },
  { icon: '📊', key: 'advanced_insights' },
  { icon: '📅', key: 'extended_history' },
  { icon: '📈', key: 'advanced_charts' },
  { icon: '📤', key: 'data_export' },
  { icon: '👥', key: 'multiple_profiles' },
] as const;

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  const { t } = useTranslation();
  const { upgradeMonthly, upgradeYearly, upgradeLifetime } = usePremium();

  const handleUpgrade = (action: () => void) => {
    trackEvent('premium_upgrade_clicked');
    action();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('premium.upgradeTitle')}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('premium.upgradeDesc')}</p>
        </div>

        {/* Features */}
        <div className="mb-5 space-y-2">
          {HIGHLIGHT_FEATURES.map(({ icon, key }) => (
            <div key={key} className="flex items-start gap-3 rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-gray-700/50">
              <span className="mt-0.5 text-base">{icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{t(`premium.${key}`)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t(`premium.${key}_desc`)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Buttons */}
        <div className="mb-3 space-y-2">
          {/* Yearly - Best Value */}
          <button
            onClick={() => handleUpgrade(upgradeYearly)}
            className="relative w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-amber-600 hover:to-orange-600 active:scale-[0.98]"
          >
            <span className="absolute -top-2 right-3 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              {t('premium.bestValue')}
            </span>
            <div>{t('premium.upgradeYearly')}</div>
            <div className="text-xs font-normal opacity-90">$14.99/{t('premium.year')} · {t('premium.save58')}</div>
          </button>

          {/* Monthly */}
          <button
            onClick={() => handleUpgrade(upgradeMonthly)}
            className="w-full rounded-xl border-2 border-amber-300 bg-amber-50 py-3 text-sm font-semibold text-amber-700 transition-all hover:bg-amber-100 active:scale-[0.98] dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30"
          >
            <div>{t('premium.upgradeMonthly')}</div>
            <div className="text-xs font-normal opacity-75">$2.99/{t('premium.month')}</div>
          </button>

          {/* Lifetime */}
          <button
            onClick={() => handleUpgrade(upgradeLifetime)}
            className="w-full rounded-xl border-2 border-purple-300 bg-purple-50 py-3 text-sm font-semibold text-purple-700 transition-all hover:bg-purple-100 active:scale-[0.98] dark:border-purple-600 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30"
          >
            <div>{t('premium.lifetimeAccess')}</div>
            <div className="text-xs font-normal opacity-75">$9.99 {t('premium.oneTime')}</div>
          </button>
        </div>

        <button onClick={onClose} className="w-full rounded-xl py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          {t('premium.maybeLater')}
        </button>
      </div>
    </div>
  );
}
