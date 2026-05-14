import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationStore } from '../../store/useHydrationStore';
import type { ActivityLevel } from '../../types';
import { MIN_WEIGHT_KG, MAX_WEIGHT_KG } from '../../types';

const ACTIVITY_LEVELS: ActivityLevel[] = ['sedentary', 'moderate', 'active'];

const sectionClass = 'rounded-lg border border-gray-300/50 dark:border-gray-600/50 glass-inner p-3';
const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200';
const inputClass = 'w-full rounded-lg border border-gray-300/60 px-3 py-2 text-base text-gray-900 bg-white/60 backdrop-blur-sm transition-colors focus:border-blue-400 focus:outline-none dark:border-gray-600/60 dark:bg-gray-800/60 dark:text-white dark:focus:border-blue-500';

export function ProfileScreen() {
  const { t } = useTranslation();
  const userProfile = useHydrationStore((s) => s.userProfile);
  const setWeight = useHydrationStore((s) => s.setWeight);
  const setActivityLevel = useHydrationStore((s) => s.setActivityLevel);
  const setWeatherAdjust = useHydrationStore((s) => s.setWeatherAdjust);

  const [weightValue, setWeightValue] = useState(userProfile.weightKg ? String(userProfile.weightKg) : '');
  const [error, setError] = useState('');

  useEffect(() => {
    setWeightValue(userProfile.weightKg ? String(userProfile.weightKg) : '');
  }, [userProfile.weightKg]);

  const commitWeight = () => {
    if (!weightValue.trim()) {
      setWeight(null);
      setError('');
      return;
    }
    const parsed = parseFloat(weightValue);
    if (isNaN(parsed) || parsed < MIN_WEIGHT_KG || parsed > MAX_WEIGHT_KG) {
      setError(t('settings.weightError', { min: MIN_WEIGHT_KG, max: MAX_WEIGHT_KG }));
      return;
    }
    setError('');
    setWeight(parsed);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="profile-weight" className={labelClass}>{t('settings.bodyWeight')}</label>
        <input
          id="profile-weight"
          type="number"
          min={MIN_WEIGHT_KG}
          max={MAX_WEIGHT_KG}
          step={0.5}
          value={weightValue}
          onChange={(e) => { setWeightValue(e.target.value); setError(''); }}
          onBlur={commitWeight}
          placeholder={t('settings.weightPlaceholder')}
          className={inputClass}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      <div>
        <label className={labelClass}>{t('settings.activityLevel')}</label>
        <div className="flex gap-1.5">
          {ACTIVITY_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setActivityLevel(level)}
              className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                userProfile.activityLevel === level
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/50 text-gray-700 hover:bg-white/70 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15'
              }`}
            >
              {t(`activity.${level}`)}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">{t(`activity.${userProfile.activityLevel}Desc`)}</p>
      </div>

      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('settings.weatherAdjustment')}</p>
            <p className="text-xs text-gray-500">{t('settings.weatherDescription')}</p>
          </div>
          <button
            type="button"
            onClick={() => setWeatherAdjust(!userProfile.weatherAdjust)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${userProfile.weatherAdjust ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'} cursor-pointer`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${userProfile.weatherAdjust ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
