import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useHydrationStore } from '../store/useHydrationStore';
import { trackEvent } from '../services/analyticsService';
import { BottleIcon } from './BottleIcon';

function getBottleSize(amount: number): 'sm' | 'md' | 'lg' {
  if (amount <= 150) return 'sm';
  if (amount <= 350) return 'md';
  return 'lg';
}

function getFillLevel(amount: number): number {
  if (amount <= 150) return 0.5;
  if (amount <= 350) return 0.7;
  return 0.85;
}

export function QuickAddButtons() {
  const { t } = useTranslation();
  const addEntry = useHydrationStore((s) => s.addEntry);
  const goalMl = useHydrationStore((s) => s.goalMl);
  const presets = useHydrationStore((s) => s.quickPresets);
  const [lastAdded, setLastAdded] = useState<number | null>(null);

  const handleAdd = (amount: number) => {
    const totalBefore = useHydrationStore.getState().records[new Date().toISOString().slice(0, 10)]?.totalMl ?? 0;
    addEntry(amount);
    trackEvent('water_logged', { amount });
    if (totalBefore < goalMl && totalBefore + amount >= goalMl) {
      trackEvent('goal_reached');
    }
    setLastAdded(amount);
    window.setTimeout(() => setLastAdded(null), 650);
  };

  return (
    <div className="relative flex items-end justify-around gap-2 rounded-2xl bg-gradient-to-br from-sky-100/60 to-blue-100/60 p-4 backdrop-blur-sm dark:from-sky-900/30 dark:to-blue-900/30">
      {lastAdded !== null && (
        <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 animate-[ping_0.65s_ease-out_1] rounded-full bg-sky-400/20 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-200">
          +{lastAdded} ml
        </div>
      )}
      {presets.map((amount) => (
        <button
          key={amount}
          onClick={() => handleAdd(amount)}
          className="group flex flex-1 flex-col items-center gap-1.5 rounded-xl px-2 py-2 transition-transform active:scale-90"
          aria-label={`${t('input.add')} ${amount} ${t('onboarding.ml')}`}
        >
          <BottleIcon
            size={getBottleSize(amount)}
            fillLevel={getFillLevel(amount)}
            className="drop-shadow-md transition-transform group-hover:scale-105 group-active:scale-95"
          />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-200">
            {amount}{' '}<span className="text-xs font-medium text-blue-500/80 dark:text-blue-300/80">{t('onboarding.ml')}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
