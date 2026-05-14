import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationStore } from '../../store/useHydrationStore';
import { useAdaptiveGoal } from '../../hooks/useAdaptiveGoal';
import {
  MIN_GOAL_ML, MAX_GOAL_ML, MAX_SINGLE_ENTRY_ML, MIN_WEIGHT_KG, MAX_WEIGHT_KG,
} from '../../types';

const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200';
const inputClass = 'w-full rounded-lg border border-gray-300/60 px-3 py-2 text-base text-gray-900 bg-white/60 backdrop-blur-sm transition-colors focus:border-blue-400 focus:outline-none dark:border-gray-600/60 dark:bg-gray-800/60 dark:text-white dark:focus:border-blue-500';

export function GoalScreen() {
  const { t } = useTranslation();
  const goalMl = useHydrationStore((s) => s.goalMl);
  const setGoal = useHydrationStore((s) => s.setGoal);
  const setCustomGoal = useHydrationStore((s) => s.setCustomGoal);
  const userProfile = useHydrationStore((s) => s.userProfile);
  const quickPresets = useHydrationStore((s) => s.quickPresets);
  const setQuickPresets = useHydrationStore((s) => s.setQuickPresets);
  const breakdown = useAdaptiveGoal();

  const [goalValue, setGoalValue] = useState(String(goalMl));
  const [useRecommended, setUseRecommended] = useState(!userProfile.customGoal);
  const [presetValues, setPresetValues] = useState(quickPresets.map(String));
  const [goalError, setGoalError] = useState('');
  const [presetError, setPresetError] = useState('');

  useEffect(() => { setGoalValue(String(goalMl)); }, [goalMl]);
  useEffect(() => { setUseRecommended(!userProfile.customGoal); }, [userProfile.customGoal]);
  useEffect(() => { setPresetValues(quickPresets.map(String)); }, [quickPresets]);

  const hasValidWeight = userProfile.weightKg !== null
    && userProfile.weightKg >= MIN_WEIGHT_KG
    && userProfile.weightKg <= MAX_WEIGHT_KG;

  const commitGoal = () => {
    const parsed = parseInt(goalValue, 10);
    if (isNaN(parsed) || parsed < MIN_GOAL_ML || parsed > MAX_GOAL_ML) {
      setGoalError(t('settings.goalError', { min: MIN_GOAL_ML, max: MAX_GOAL_ML }));
      return;
    }
    setGoalError('');
    setCustomGoal(parsed);
    setGoal(parsed);
  };

  const commitPreset = (index: number) => {
    const parsed = parseInt(presetValues[index], 10);
    if (isNaN(parsed) || parsed <= 0 || parsed > MAX_SINGLE_ENTRY_ML) {
      setPresetError(t('settings.presetError', { max: MAX_SINGLE_ENTRY_ML }));
      return;
    }
    setPresetError('');
    const next = [...quickPresets];
    next[index] = parsed;
    setQuickPresets(next);
  };

  const updatePreset = (index: number, value: string) => {
    const next = [...presetValues];
    next[index] = value;
    setPresetValues(next);
  };

  const addPreset = () => {
    if (presetValues.length >= 5) return;
    const nextValues = [...presetValues, '200'];
    setPresetValues(nextValues);
    setQuickPresets(nextValues.map((v) => parseInt(v, 10)));
  };

  const removePreset = (index: number) => {
    if (presetValues.length <= 1) return;
    const nextValues = presetValues.filter((_, i) => i !== index);
    setPresetValues(nextValues);
    setQuickPresets(nextValues.map((v) => parseInt(v, 10)));
  };

  return (
    <div className="space-y-4">
      {hasValidWeight && (
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
            {t('settings.recommendedGoal', { goal: breakdown.finalGoal })}
          </p>
          <div className="mt-1.5 space-y-0.5 text-[11px] text-blue-600 dark:text-blue-400">
            <p>{t('settings.baseGoal', { base: breakdown.baseGoal, weight: userProfile.weightKg })}</p>
            {breakdown.activityAdjustment > 0 && <p>{t('settings.activityAdjustmentAmount', { amount: breakdown.activityAdjustment })}</p>}
            {breakdown.weatherAdjustment > 0 && <p>{t('settings.weatherAdjustmentAmount', { amount: breakdown.weatherAdjustment })}</p>}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="goal-input" className={labelClass}>{t('settings.dailyGoal')}</label>
        {hasValidWeight && (
          <div className="mb-2 flex gap-2">
            <button
              type="button"
              onClick={() => { setUseRecommended(true); setCustomGoal(null); setGoalError(''); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${useRecommended ? 'bg-blue-500 text-white' : 'bg-white/50 dark:bg-white/10 text-gray-700 dark:text-gray-300'}`}
            >
              {t('settings.recommended')}
            </button>
            <button
              type="button"
              onClick={() => setUseRecommended(false)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!useRecommended ? 'bg-blue-500 text-white' : 'bg-white/50 dark:bg-white/10 text-gray-700 dark:text-gray-300'}`}
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
          onChange={(e) => { setGoalValue(e.target.value); setUseRecommended(false); setGoalError(''); }}
          onBlur={commitGoal}
          disabled={useRecommended && hasValidWeight}
          className={`${inputClass} ${useRecommended && hasValidWeight ? 'opacity-50' : ''}`}
        />
        {goalError && <p className="mt-1 text-xs text-red-500">{goalError}</p>}
      </div>

      <div>
        <label className={labelClass}>{t('settings.quickPresets')}</label>
        <div className="space-y-2">
          {presetValues.map((val, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={MAX_SINGLE_ENTRY_ML}
                value={val}
                onChange={(e) => updatePreset(i, e.target.value)}
                onBlur={() => commitPreset(i)}
                className="flex-1 rounded-lg border border-gray-300/60 bg-white/60 px-3 py-1.5 text-base text-gray-900 transition-colors focus:border-blue-400 focus:outline-none dark:border-gray-600/60 dark:bg-gray-800/60 dark:text-white dark:focus:border-blue-500"
              />
              {presetValues.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePreset(i)}
                  className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  aria-label={t('settings.cancel')}
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
        {presetError && <p className="mt-1 text-xs text-red-500">{presetError}</p>}
      </div>
    </div>
  );
}
