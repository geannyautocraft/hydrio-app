import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBilling } from '../hooks/useBilling';
import { Mascot } from './Mascot';

interface UpgradeModalProps {
  onClose: () => void;
}

interface FeatureDef {
  key: 'smart_coach' | 'advanced_insights' | 'extended_history' | 'advanced_charts' | 'data_export' | 'multiple_profiles';
  icon: string;
  tint: string;
}

const HIGHLIGHT_FEATURES: FeatureDef[] = [
  { key: 'smart_coach', icon: '🧠', tint: 'bg-pink-500/15 text-pink-600 dark:text-pink-300' },
  { key: 'advanced_insights', icon: '📊', tint: 'bg-blue-500/15 text-blue-600 dark:text-blue-300' },
  { key: 'extended_history', icon: '📅', tint: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' },
  { key: 'advanced_charts', icon: '📈', tint: 'bg-amber-500/15 text-amber-600 dark:text-amber-300' },
  { key: 'data_export', icon: '📤', tint: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300' },
  { key: 'multiple_profiles', icon: '👥', tint: 'bg-purple-500/15 text-purple-600 dark:text-purple-300' },
];

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  const { t } = useTranslation();
  const { loading, error, ready, products, purchaseProduct, restore } = useBilling();
  const [debugInfo, setDebugInfo] = useState('');

  const handlePurchase = async (key: 'monthly' | 'yearly' | 'lifetime') => {
    setDebugInfo(t('premium.connecting') || 'Connecting...');
    try {
      await purchaseProduct(key);
      setDebugInfo('');
    } catch (err) {
      setDebugInfo(`${err}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-0 sm:items-center sm:p-4">
      <div className="relative max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 sm:rounded-3xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/70 p-1.5 text-gray-500 backdrop-blur transition-colors hover:bg-white hover:text-gray-800 dark:bg-slate-800/70 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-100"
          aria-label={t('premium.maybeLater')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Hero header with gradient bg */}
        <div className="relative overflow-hidden bg-gradient-to-br from-sky-200 via-blue-200 to-indigo-200 px-6 pb-5 pt-8 dark:from-sky-900/40 dark:via-blue-900/40 dark:to-indigo-900/40">
          <div className="relative flex flex-col items-center text-center">
            <Mascot mood="excited" size={80} />
            <h2 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
              {t('premium.upgradeTitle')}
            </h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
              {t('premium.upgradeDesc')}
            </p>
          </div>
        </div>

        <div className="px-5 pb-5 pt-4">
          {/* Features list */}
          <div className="mb-5 space-y-1.5">
            {HIGHLIGHT_FEATURES.map(({ key, icon, tint }) => (
              <div key={key} className="flex items-center gap-3 rounded-xl px-2 py-1.5">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${tint}`}>
                  {icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {t(`premium.${key}`)}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {t(`premium.${key}_desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Status messages */}
          {debugInfo && (
            <p className="mb-2 rounded-lg bg-blue-50 px-3 py-2 text-center text-[11px] text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              {debugInfo}
            </p>
          )}
          {!ready && (
            <p className="mb-2 rounded-lg bg-amber-50/70 px-3 py-2 text-center text-[11px] text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              {t('premium.billingLoading') || 'Conectando ao Google Play...'}
            </p>
          )}
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </p>
          )}

          {/* Pricing — Yearly featured */}
          <div className="space-y-2.5">
            <button
              onClick={() => handlePurchase('yearly')}
              disabled={loading || !ready}
              className="relative w-full rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-[2px] shadow-lg shadow-orange-500/30 transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <span className="absolute -top-2.5 right-3 z-10 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md">
                {t('premium.bestValue')}
              </span>
              <div className="rounded-[14px] bg-gradient-to-br from-amber-500 to-orange-500 px-4 py-3 text-left">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-base font-bold text-white">{t('premium.upgradeYearly')}</span>
                  <span className="text-lg font-extrabold text-white">{products.yearly.price}</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-white/90">
                  <span>{t('premium.save58')}</span>
                  <span>/{t('premium.year')}</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => handlePurchase('monthly')}
              disabled={loading || !ready}
              className="w-full rounded-2xl bg-white px-4 py-3 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-60 dark:bg-slate-800"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-white">{t('premium.upgradeMonthly')}</span>
                <span className="text-base font-bold text-gray-800 dark:text-white">{products.monthly.price}</span>
              </div>
              <div className="mt-0.5 flex items-center justify-end text-[11px] text-gray-500 dark:text-gray-400">
                <span>/{t('premium.month')}</span>
              </div>
            </button>

            <button
              onClick={() => handlePurchase('lifetime')}
              disabled={loading || !ready}
              className="w-full rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 px-4 py-3 text-left shadow-sm ring-1 ring-purple-200 transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-60 dark:bg-gradient-to-br dark:from-violet-900/30 dark:to-purple-900/30 dark:ring-purple-700/50"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-200">
                  {t('premium.lifetimeAccess')}
                </span>
                <span className="text-base font-bold text-purple-700 dark:text-purple-200">
                  {products.lifetime.price}
                </span>
              </div>
              <div className="mt-0.5 flex items-center justify-end text-[11px] text-purple-500 dark:text-purple-300">
                <span>{t('premium.oneTime')}</span>
              </div>
            </button>
          </div>

          {/* Footer actions */}
          <div className="mt-4 flex flex-col items-center gap-1.5">
            <button
              onClick={restore}
              disabled={loading}
              className="text-xs font-medium text-blue-500 transition-colors hover:text-blue-700 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('premium.restorePurchases')}
            </button>
            <button
              onClick={onClose}
              className="text-xs font-medium text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              {t('premium.maybeLater')}
            </button>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500/30 border-t-orange-500" />
          </div>
        )}
      </div>
    </div>
  );
}
