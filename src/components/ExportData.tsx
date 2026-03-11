import { useState } from 'react';
import { useHydrationStore } from '../store/useHydrationStore';
import { exportAsJSON, exportAsCSV } from '../services/exportService';
import { PremiumGate } from './PremiumGate';

function ExportDataContent() {
  const records = useHydrationStore((s) => s.records);
  const goalMl = useHydrationStore((s) => s.goalMl);
  const [exported, setExported] = useState<string | null>(null);

  const totalDays = Object.keys(records).length;
  const totalEntries = Object.values(records).reduce(
    (sum, r) => sum + r.entries.length,
    0
  );

  const handleExport = (format: 'json' | 'csv') => {
    if (format === 'json') {
      exportAsJSON(records, goalMl);
    } else {
      exportAsCSV(records, goalMl);
    }
    setExported(format.toUpperCase());
    setTimeout(() => setExported(null), 2000);
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
        Export Data
      </h2>

      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        {totalDays} days, {totalEntries} entries
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => handleExport('json')}
          disabled={totalDays === 0}
          className="flex-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition-all hover:bg-blue-100 active:scale-[0.98] disabled:opacity-40 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
        >
          Export JSON
        </button>
        <button
          onClick={() => handleExport('csv')}
          disabled={totalDays === 0}
          className="flex-1 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 transition-all hover:bg-green-100 active:scale-[0.98] disabled:opacity-40 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
        >
          Export CSV
        </button>
      </div>

      {exported && (
        <p className="mt-2 text-center text-xs font-medium text-green-600 dark:text-green-400">
          {exported} exported successfully!
        </p>
      )}
    </div>
  );
}

export function ExportData() {
  return (
    <PremiumGate feature="data_export">
      <ExportDataContent />
    </PremiumGate>
  );
}
