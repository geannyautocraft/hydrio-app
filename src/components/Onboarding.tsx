import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationStore } from '../store/useHydrationStore';
import type { ActivityLevel } from '../types';
import {
  MIN_GOAL_ML, MAX_GOAL_ML, DEFAULT_GOAL_ML, MIN_WEIGHT_KG, MAX_WEIGHT_KG,
  WEIGHT_TO_ML_FACTOR, ACTIVITY_MULTIPLIERS,
} from '../types';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = ['welcome', 'weight', 'activity', 'goal', 'quickadd', 'ready'] as const;
const ACTIVITY_LEVELS: ActivityLevel[] = ['sedentary', 'moderate', 'active'];

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [weightInput, setWeightInput] = useState('');
  const [activityInput, setActivityInput] = useState<ActivityLevel>('moderate');
  const [goalInput, setGoalInput] = useState(String(DEFAULT_GOAL_ML));
  const [useCustomGoal, setUseCustomGoal] = useState(false);
  const setGoal = useHydrationStore((s) => s.setGoal);
  const setWeight = useHydrationStore((s) => s.setWeight);
  const setCustomGoal = useHydrationStore((s) => s.setCustomGoal);
  const setActivityLevel = useHydrationStore((s) => s.setActivityLevel);

  const current = STEPS[step];
  const weightKg = parseFloat(weightInput);
  const hasValidWeight = !isNaN(weightKg) && weightKg >= MIN_WEIGHT_KG && weightKg <= MAX_WEIGHT_KG;
  const baseGoal = hasValidWeight ? Math.round(weightKg * WEIGHT_TO_ML_FACTOR) : DEFAULT_GOAL_ML;
  const recommendedGoal = Math.round(baseGoal * ACTIVITY_MULTIPLIERS[activityInput]);

  const next = () => {
    if (current === 'weight' && hasValidWeight) setWeight(weightKg);
    if (current === 'activity') {
      setActivityLevel(activityInput);
      if (!useCustomGoal) setGoalInput(String(recommendedGoal));
    }
    if (current === 'goal') {
      const goal = parseInt(goalInput, 10);
      if (!isNaN(goal) && goal >= MIN_GOAL_ML && goal <= MAX_GOAL_ML) {
        if (useCustomGoal || !hasValidWeight) setCustomGoal(goal);
        setGoal(goal);
      }
    }
    if (step < STEPS.length - 1) setStep(step + 1);
    else onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">
        <div className="mb-6 flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-2 w-2 rounded-full transition-colors ${i <= step ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'}`} />
          ))}
        </div>

        {current === 'welcome' && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <svg className="h-10 w-10 text-blue-500" viewBox="0 0 64 64" fill="currentColor">
                <path d="M32 4 C32 4 12 28 12 42 C12 53 21 60 32 60 C43 60 52 53 52 42 C52 28 32 4 32 4Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('onboarding.welcome')}</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('onboarding.welcomeDesc')}</p>
          </div>
        )}

        {current === 'weight' && (
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('onboarding.weightTitle')}</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('onboarding.weightDesc')}</p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <input type="number" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} placeholder="70" min={MIN_WEIGHT_KG} max={MAX_WEIGHT_KG} className="w-28 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-center text-lg font-semibold text-gray-800 dark:text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900" />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('onboarding.kg')}</span>
            </div>
            {hasValidWeight && (
              <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-4 py-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">{t('onboarding.baseIntake', { amount: baseGoal })}</p>
                <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">{t('onboarding.basedOn', { weight: weightKg, factor: WEIGHT_TO_ML_FACTOR })}</p>
              </div>
            )}
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">{t('onboarding.optional')}</p>
          </div>
        )}

        {current === 'activity' && (
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('onboarding.activityTitle')}</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('onboarding.activityDesc')}</p>
            <div className="mt-6 space-y-2">
              {ACTIVITY_LEVELS.map((level) => (
                <button key={level} onClick={() => setActivityInput(level)} className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${activityInput === level ? 'bg-blue-50 border-2 border-blue-500 dark:bg-blue-900/20 dark:border-blue-400' : 'bg-gray-50 border-2 border-transparent dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                  <p className={`text-sm font-semibold ${activityInput === level ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>{t(`activity.${level}`)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{t(`activity.${level}Desc`)}</p>
                </button>
              ))}
            </div>
            {hasValidWeight && (
              <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-4 py-2">
                <p className="text-xs text-blue-600 dark:text-blue-400">{t('onboarding.adjustedRecommendation', { amount: recommendedGoal })}</p>
              </div>
            )}
          </div>
        )}

        {current === 'goal' && (
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('onboarding.goalTitle')}</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('onboarding.goalDesc')}</p>
            {hasValidWeight && (
              <div className="mt-4 flex justify-center gap-2">
                <button onClick={() => { setUseCustomGoal(false); setGoalInput(String(recommendedGoal)); }} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!useCustomGoal ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                  {t('onboarding.recommendedGoal', { amount: recommendedGoal })}
                </button>
                <button onClick={() => setUseCustomGoal(true)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${useCustomGoal ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                  {t('onboarding.custom')}
                </button>
              </div>
            )}
            <div className="mt-4 flex items-center justify-center gap-2">
              <input type="number" value={goalInput} onChange={(e) => { setGoalInput(e.target.value); if (hasValidWeight) setUseCustomGoal(true); }} min={MIN_GOAL_ML} max={MAX_GOAL_ML} className="w-28 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-center text-lg font-semibold text-gray-800 dark:text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900" />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('onboarding.mlPerDay')}</span>
            </div>
            {(!hasValidWeight || useCustomGoal) && (
              <div className="mt-4 flex justify-center gap-2">
                {[1500, 2000, 2500, 3000].map((preset) => (
                  <button key={preset} onClick={() => setGoalInput(String(preset))} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${goalInput === String(preset) ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                    {preset} ml
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {current === 'quickadd' && (
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('onboarding.quickAddTitle')}</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('onboarding.quickAddDesc')}</p>
            <div className="mt-6 flex justify-center gap-3">
              {[100, 250, 500].map((amount) => (
                <div key={amount} className="rounded-xl bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-center">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">+{amount}</p>
                  <p className="text-xs text-gray-500">{t('onboarding.ml')}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">{t('onboarding.customizeLater')}</p>
          </div>
        )}

        {current === 'ready' && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('onboarding.readyTitle')}</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('onboarding.readyDesc')}{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">{t('onboarding.readyGoal', { amount: goalInput })}</span> {t('onboarding.perDay')}
            </p>
            {hasValidWeight && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {t('onboarding.basedOnWeight', { weight: weightKg, activity: t(`activity.${activityInput}`).toLowerCase() })}
              </p>
            )}
          </div>
        )}

        <button onClick={next} className="mt-6 w-full rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600 active:bg-blue-700">
          {current === 'ready' ? t('onboarding.startTracking') : current === 'weight' && !weightInput ? t('onboarding.skip') : t('onboarding.continue')}
        </button>

        {step > 0 && current !== 'ready' && (
          <button onClick={() => setStep(step - 1)} className="mt-2 w-full py-2 text-sm text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            {t('onboarding.back')}
          </button>
        )}
      </div>
    </div>
  );
}
