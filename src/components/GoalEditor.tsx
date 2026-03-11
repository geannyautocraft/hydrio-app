import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationStore } from '../store/useHydrationStore';
import { useNotifications } from '../hooks/useNotifications';
import {
  MIN_GOAL_ML,
  MAX_GOAL_ML,
  MAX_SINGLE_ENTRY_ML,
  MIN_WEIGHT_KG,
  MAX_WEIGHT_KG,
  WEIGHT_TO_ML_FACTOR,
} from '../types';

interface GoalEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

const INTERVAL_OPTIONS = [
  { labelKey: 'settings.interval30min', value: 30 },
  { labelKey: 'settings.interval1hr', value: 60 },
  { labelKey: 'settings.interval2hr', value: 120 },
  { labelKey: 'settings.interval3hr', value: 180 },
];

export function GoalEditor({ isOpen, onClose }: GoalEditorProps) {
  const { t } = useTranslation();
  const goalMl = useHydrationStore((s) => s.goalMl);
  const setGoal = useHydrationStore((s) => s.setGoal);
  const quickPresets = useHydrationStore((s) => s.quickPresets);
  const setQuickPresets = useHydrationStore((s) => s.setQuickPresets);
  const userProfile = useHydrationStore((s) => s.userProfile);
  const setWeight = useHydrationStore((s) => s.setWeight);
  const setCustomGoal = useHydrationStore((s) => s.setCustomGoal);

  const notifications = useNotifications();

  const [weightValue, setWeightValue] = useState(
    userProfile.weightKg ? String(userProfile.weightKg) : ''
  );
  const [goalValue, setGoalValue] = useState(String(goalMl));
  const [useRecommended, setUseRecommended] = useState(!userProfile.customGoal);
  const [presetValues, setPresetValues] = useState(quickPresets.map(String));
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const parsedWeight = parseFloat(weightValue);
  const hasValidWeight = !isNaN(parsedWeight) && parsedWeight >= MIN_WEIGHT_KG && parsedWeight <= MAX_WEIGHT_KG;
  const recommendedGoal = hasValidWeight ? Math.round(parsedWeight * WEIGHT_TO_ML_FACTOR) : null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedGoal = parseInt(goalValue, 10);
    if (isNaN(parsedGoal) || parsedGoal < MIN_GOAL_ML || parsedGoal > MAX_GOAL_ML) {
      setError(t('settings.goalError', { min: MIN_GOAL_ML, max: MAX_GOAL_ML }));
      return;
    }

    const parsedPresets = presetValues.map((v) => parseInt(v, 10));
    const invalidPreset = parsedPresets.some(
      (p) => isNaN(p) || p <= 0 || p > MAX_SINGLE_ENTRY_ML
    );
    if (invalidPreset) {
      setError(t('settings.presetError', { max: MAX_SINGLE_ENTRY_ML }));
      return;
    }

    // Save weight
    if (hasValidWeight) {
      setWeight(parsedWeight);
    } else if (!weightValue) {
      setWeight(null);
    }

    // Save goal
    if (useRecommended && hasValidWeight) {
      setCustomGoal(null);
      setGoal(recommendedGoal!);
    } else {
      setCustomGoal(parsedGoal);
      setGoal(parsedGoal);
    }

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
        {/* Weight Input */}
        <div>
          <label htmlFor="weight-input" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('settings.bodyWeight')}
          </label>
          <input
            id="weight-input"
            type="number"
            min={MIN_WEIGHT_KG}
            max={MAX_WEIGHT_KG}
            step={0.5}
            value={weightValue}
            onChange={(e) => {
              setWeightValue(e.target.value);
              setError('');
              const w = parseFloat(e.target.value);
              if (!isNaN(w) && w >= MIN_WEIGHT_KG && w <= MAX_WEIGHT_KG && useRecommended) {
                setGoalValue(String(Math.round(w * WEIGHT_TO_ML_FACTOR)));
              }
            }}
            placeholder={t('settings.weightPlaceholder')}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors focus:border-blue-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
          />
          {hasValidWeight && (
            <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">
              {t('settings.recommendedGoal', { goal: recommendedGoal })}
            </p>
          )}
        </div>

        {/* Goal Input */}
        <div>
          <label htmlFor="goal-input" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('settings.dailyGoal')}
          </label>
          {hasValidWeight && (
            <div className="mb-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setUseRecommended(true);
                  setGoalValue(String(recommendedGoal));
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  useRecommended
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {t('settings.recommended')}
              </button>
              <button
                type="button"
                onClick={() => setUseRecommended(false)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  !useRecommended
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {t('settings.custom')}
              </button>
            </div>
          )}
          <input
            id="goal-input"
            type="number"
            min={MIN_GOAL_ML}
            max={MAX_GOAL_ML}
            step={50}
            value={goalValue}
            onChange={(e) => {
              setGoalValue(e.target.value);
              setUseRecommended(false);
              setError('');
            }}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors focus:border-blue-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
          />
        </div>

        {/* Quick Presets */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('settings.quickPresets')}
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
              {t('settings.addPreset')}
            </button>
          )}
        </div>

        {/* Notification Settings */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('settings.reminders')}
          </label>
          <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {notifications.enabled ? t('settings.remindersOn') : t('settings.remindersOff')}
                </p>
                {!notifications.supported && (
                  <p className="text-xs text-gray-400">{t('settings.notSupported')}</p>
                )}
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (notifications.enabled) {
                    notifications.disable();
                  } else {
                    await notifications.enable();
                  }
                }}
                disabled={!notifications.supported}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  notifications.enabled
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                } ${!notifications.supported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${
                    notifications.enabled ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
            {notifications.enabled && (
              <div className="mt-3 flex gap-1.5">
                {INTERVAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => notifications.setInterval(opt.value)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      notifications.intervalMinutes === opt.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-500 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600 active:scale-[0.98]"
          >
            {t('settings.save')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {t('settings.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
