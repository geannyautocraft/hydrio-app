import { useTranslation } from 'react-i18next';
import { useHydrationStore } from '../store/useHydrationStore';
import { trackEvent } from '../services/analyticsService';

export function QuickAddButtons() {
  const { t } = useTranslation();
  const addEntry = useHydrationStore((s) => s.addEntry);
  const goalMl = useHydrationStore((s) => s.goalMl);
  const presets = useHydrationStore((s) => s.quickPresets);

  const handleAdd = (amount: number) => {
    const totalBefore = useHydrationStore.getState().records[new Date().toISOString().slice(0, 10)]?.totalMl ?? 0;
    addEntry(amount);
    trackEvent('water_logged', { amount });
    if (totalBefore < goalMl && totalBefore + amount >= goalMl) {
      trackEvent('goal_reached');
    }
  };

  return (
    <div className="flex gap-2">
      {presets.map((amount) => (
        <button
          key={amount}
          onClick={() => handleAdd(amount)}
          className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-600 hover:shadow-md active:scale-95 active:shadow-sm dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          +{amount} {t('onboarding.ml')}
        </button>
      ))}
    </div>
  );
}
