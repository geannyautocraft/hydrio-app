import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationStore } from '../store/useHydrationStore';
import { MAX_SINGLE_ENTRY_ML } from '../types';

export function CustomWaterInput() {
  const { t } = useTranslation();
  const addEntry = useHydrationStore((s) => s.addEntry);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseInt(value, 10);
    if (isNaN(amount) || amount <= 0) {
      setError(t('input.invalidAmount'));
      return;
    }
    if (amount > MAX_SINGLE_ENTRY_ML) {
      setError(t('input.maxAmount', { max: MAX_SINGLE_ENTRY_ML }));
      return;
    }

    addEntry(amount);
    setValue('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-2xl bg-white/40 p-1.5 pl-3 backdrop-blur-sm dark:bg-slate-800/40">
        <span className="text-lg leading-none" aria-hidden>💧</span>
        <input
          type="number"
          min={1}
          max={MAX_SINGLE_ENTRY_ML}
          placeholder={t('input.placeholder')}
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          className="min-w-0 flex-1 bg-transparent py-2 text-base text-gray-900 placeholder-gray-500 focus:outline-none dark:text-white dark:placeholder-gray-400"
        />
        <button
          type="submit"
          className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-600 active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          {t('input.add')}
        </button>
      </form>
      {error && <p className="mt-1.5 px-3 text-xs text-red-500">{error}</p>}
    </div>
  );
}
