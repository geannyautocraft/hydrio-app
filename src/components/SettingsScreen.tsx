import { useState } from 'react';
import { useHydrationStore } from '../store/useHydrationStore';
import { useNotifications } from '../hooks/useNotifications';
import { useAdaptiveGoal } from '../hooks/useAdaptiveGoal';
import { useThemeStore } from '../store/useThemeStore';
import { getActivityLabel } from '../services/hydrationRecommendationService';
import type { ActivityLevel } from '../types';
import {
  MIN_GOAL_ML,
  MAX_GOAL_ML,
  MAX_SINGLE_ENTRY_ML,
  MIN_WEIGHT_KG,
  MAX_WEIGHT_KG,
} from '../types';

interface SettingsScreenProps {
  onClose: () => void;
}

const INTERVAL_OPTIONS = [
  { label: '30 min', value: 30 },
  { label: '1 hr', value: 60 },
  { label: '2 hr', value: 120 },
  { label: '3 hr', value: 180 },
];

const ACTIVITY_LEVELS: ActivityLevel[] = ['sedentary', 'moderate', 'active'];

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const goalMl = useHydrationStore((s) => s.goalMl);
  const setGoal = useHydrationStore((s) => s.setGoal);
  const quickPresets = useHydrationStore((s) => s.quickPresets);
  const setQuickPresets = useHydrationStore((s) => s.setQuickPresets);
  const userProfile = useHydrationStore((s) => s.userProfile);
  const setWeight = useHydrationStore((s) => s.setWeight);
  const setCustomGoal = useHydrationStore((s) => s.setCustomGoal);
  const setActivityLevel = useHydrationStore((s) => s.setActivityLevel);
  const setWeatherAdjust = useHydrationStore((s) => s.setWeatherAdjust);

  const notifications = useNotifications();
  const breakdown = useAdaptiveGoal();
  const dark = useThemeStore((s) => s.dark);
  const toggleDark = useThemeStore((s) => s.toggle);

  const [weightValue, setWeightValue] = useState(
    userProfile.weightKg ? String(userProfile.weightKg) : ''
  );
  const [goalValue, setGoalValue] = useState(String(goalMl));
  const [useRecommended, setUseRecommended] = useState(!userProfile.customGoal);
  const [presetValues, setPresetValues] = useState(quickPresets.map(String));
  const [error, setError] = useState('');

  const parsedWeight = parseFloat(weightValue);
  const hasValidWeight = !isNaN(parsedWeight) && parsedWeight >= MIN_WEIGHT_KG && parsedWeight <= MAX_WEIGHT_KG;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedGoal = parseInt(goalValue, 10);
    if (!useRecommended && (isNaN(parsedGoal) || parsedGoal < MIN_GOAL_ML || parsedGoal > MAX_GOAL_ML)) {
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

    if (hasValidWeight) {
      setWeight(parsedWeight);
    } else if (!weightValue) {
      setWeight(null);
    }

    if (useRecommended && hasValidWeight) {
      setCustomGoal(null);
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

  const sectionClass = 'rounded-lg border border-gray-200 dark:border-gray-600 p-3';
  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';
  const inputClass = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors focus:border-blue-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500';

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Settings</h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Body Weight */}
        <div>
          <label htmlFor="settings-weight" className={labelClass}>Body Weight (kg)</label>
          <input
            id="settings-weight"
            type="number"
            min={MIN_WEIGHT_KG}
            max={MAX_WEIGHT_KG}
            step={0.5}
            value={weightValue}
            onChange={(e) => {
              setWeightValue(e.target.value);
              setError('');
            }}
            placeholder="e.g. 70"
            className={inputClass}
          />
        </div>

        {/* Activity Level */}
        <div>
          <label className={labelClass}>Activity Level</label>
          <div className="flex gap-1.5">
            {ACTIVITY_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setActivityLevel(level)}
                className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                  userProfile.activityLevel === level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {getActivityLabel(level)}
              </button>
            ))}
          </div>
        </div>

        {/* Weather Adjustment */}
        <div className={sectionClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Weather adjustment</p>
              <p className="text-xs text-gray-400">Add 10% for hot/humid days</p>
            </div>
            <button
              type="button"
              onClick={() => setWeatherAdjust(!userProfile.weatherAdjust)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                userProfile.weatherAdjust ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              } cursor-pointer`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  userProfile.weatherAdjust ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Goal Breakdown */}
        {hasValidWeight && (
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Recommended Goal: {breakdown.finalGoal} ml/day
            </p>
            <div className="mt-1.5 space-y-0.5 text-[11px] text-blue-600 dark:text-blue-400">
              <p>Base: {breakdown.baseGoal} ml ({parsedWeight} kg x 35 ml)</p>
              {breakdown.activityAdjustment > 0 && (
                <p>Activity: +{breakdown.activityAdjustment} ml</p>
              )}
              {breakdown.weatherAdjustment > 0 && (
                <p>Weather: +{breakdown.weatherAdjustment} ml</p>
              )}
            </div>
          </div>
        )}

        {/* Daily Goal */}
        <div>
          <label htmlFor="settings-goal" className={labelClass}>Daily Goal (ml)</label>
          {hasValidWeight && (
            <div className="mb-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setUseRecommended(true);
                  setGoalValue(String(breakdown.finalGoal));
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  useRecommended
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                Recommended
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
                Custom
              </button>
            </div>
          )}
          <input
            id="settings-goal"
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
            disabled={useRecommended && hasValidWeight}
            className={`${inputClass} ${useRecommended && hasValidWeight ? 'opacity-50' : ''}`}
          />
        </div>

        {/* Quick Presets */}
        <div>
          <label className={labelClass}>Quick Add Presets (ml)</label>
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

        {/* Hydration Reminders */}
        <div>
          <label className={labelClass}>Hydration Reminders</label>
          <div className={sectionClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {notifications.enabled ? 'Reminders on' : 'Reminders off'}
                </p>
                {!notifications.supported && (
                  <p className="text-xs text-gray-400">Not supported in this browser</p>
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
                  notifications.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                } ${!notifications.supported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
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
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dark Mode */}
        <div className={sectionClass}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 dark:text-gray-300">Dark mode</p>
            <button
              type="button"
              onClick={toggleDark}
              className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${
                dark ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  dark ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

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
