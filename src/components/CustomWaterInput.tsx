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
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="number"
          min={1}
          max={MAX_SINGLE_ENTRY_ML}
          placeholder={t('input.placeholder')}
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          className="min-w-0 flex-1 rounded-l-xl border border-r-0 border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500"
        />
        <button type="submit" className="rounded-r-xl bg-blue-100 px-5 py-2.5 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-200 active:scale-95 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50">
          {t('input.add')}
        </button>
      </form>
      {error && <p className="mt-1 px-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
