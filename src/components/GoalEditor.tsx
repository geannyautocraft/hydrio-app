import { useState } from 'react';
import { useHydrationStore } from '../store/useHydrationStore';
import { MIN_GOAL_ML, MAX_GOAL_ML, MAX_SINGLE_ENTRY_ML } from '../types';

interface GoalEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoalEditor({ isOpen, onClose }: GoalEditorProps) {
  const goalMl = useHydrationStore((s) => s.goalMl);
  const setGoal = useHydrationStore((s) => s.setGoal);
  const quickPresets = useHydrationStore((s) => s.quickPresets);
  const setQuickPresets = useHydrationStore((s) => s.setQuickPresets);

  const [goalValue, setGoalValue] = useState(String(goalMl));
  const [presetValues, setPresetValues] = useState(
    quickPresets.map(String)
  );
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedGoal = parseInt(goalValue, 10);
    if (isNaN(parsedGoal) || parsedGoal < MIN_GOAL_ML || parsedGoal > MAX_GOAL_ML) {
      setError(`Goal must be between ${MIN_GOAL_ML} and ${MAX_GOAL_ML} ml`);
      return;
    }

    const parsedPresets = presetValues.map((v) => parseInt(v, 10));
    const invalidPreset = parsedPresets.some(
      (p) => isNaN(p) || p <= 0 || p > MAX_SINGLE_ENTRY_ML
    );
    if (invalidPreset) {
      setError(`Presets must be between 1 and ${MAX_SINGLE_ENTRY_ML} ml`);
      return;
    }

    setGoal(parsedGoal);
    setQuickPresets(parsedPresets);
    onClose();
  };

  const updatePreset = (index: number, value: string) => {
    const next = [...presetValues];
    next[index] = value;
    setPresetValues(next);
  };

  const addPreset = () => {
    if (presetValues.length >= 5) return;
    setPresetValues([...presetValues, '200']);
  };

  const removePreset = (index: number) => {
    if (presetValues.length <= 1) return;
    setPresetValues(presetValues.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="goal-input" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Daily Goal (ml)
          </label>
          <input
            id="goal-input"
            type="number"
            min={MIN_GOAL_ML}
            max={MAX_GOAL_ML}
            step={50}
            value={goalValue}
            onChange={(e) => { setGoalValue(e.target.value); setError(''); }}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors focus:border-blue-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Quick Add Presets (ml)
          </label>
          <div className="space-y-2">
            {presetValues.map((val, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={MAX_SINGLE_ENTRY_ML}
                  value={val}
                  onChange={(e) => updatePreset(i, e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm transition-colors focus:border-blue-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                />
                {presetValues.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePreset(i)}
                    className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          {presetValues.length < 5 && (
            <button
              type="button"
              onClick={addPreset}
              className="mt-2 text-xs font-medium text-blue-500 transition-colors hover:text-blue-700"
            >
              + Add preset
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-500 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600 active:scale-[0.98]"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
