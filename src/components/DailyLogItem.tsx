import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationStore } from '../store/useHydrationStore';
import type { WaterEntry } from '../types';
import { MAX_SINGLE_ENTRY_ML } from '../types';
import { formatTime } from '../utils/date';

interface DailyLogItemProps {
  entry: WaterEntry;
}

export function DailyLogItem({ entry }: DailyLogItemProps) {
  const { t } = useTranslation();
  const removeEntry = useHydrationStore((s) => s.removeEntry);
  const editEntry = useHydrationStore((s) => s.editEntry);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(entry.amount));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    const parsed = parseInt(editValue, 10);
    if (isNaN(parsed) || parsed <= 0 || parsed > MAX_SINGLE_ENTRY_ML) {
      setEditValue(String(entry.amount));
      setIsEditing(false);
      return;
    }
    editEntry(entry.id, parsed);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    removeEntry(entry.id);
  };

  return (
    <li className="flex items-center justify-between rounded-lg glass-inner px-3 py-2.5 transition-colors hover:bg-white/40 dark:hover:bg-white/10">
      <div className="flex items-center gap-2.5">
        <span className="text-base leading-none">💧</span>
        <span className="text-xs font-medium text-gray-500">{formatTime(entry.timestamp)}</span>
        {isEditing ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex items-center gap-1">
            <input type="number" min={1} max={MAX_SINGLE_ENTRY_ML} value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus className="w-20 rounded border border-blue-300 px-2 py-1.5 text-base focus:outline-none dark:border-blue-600 dark:bg-gray-600 dark:text-white" onBlur={handleSave} />
            <span className="text-xs text-gray-500">ml</span>
          </form>
        ) : (
          <button onClick={() => setIsEditing(true)} className="min-h-[44px] flex items-center text-sm font-semibold text-gray-700 underline decoration-gray-300 decoration-dashed underline-offset-2 transition-colors hover:text-blue-600 hover:decoration-blue-400 dark:text-gray-200 dark:decoration-gray-500" title={t('log.clickToEdit')}>
            {entry.amount} ml
          </button>
        )}
      </div>

      <div className="flex items-center">
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button onClick={handleDelete} className="rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30">
              {t('log.deleteConfirm')}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="rounded-lg px-2.5 py-2 text-xs text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300">
              {t('log.no')}
            </button>
          </div>
        ) : (
          <button onClick={handleDelete} className="-mr-1 rounded-lg p-2.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-900/20 dark:hover:text-red-400" aria-label={t('log.deleteConfirm')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </li>
  );
}
