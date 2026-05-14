import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationStore } from '../store/useHydrationStore';
import { Mascot, type MascotMood } from './Mascot';
import { BottleIcon } from './BottleIcon';
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

const STEP_MOOD: Record<typeof STEPS[number], MascotMood> = {
  welcome: 'excited',
  weight: 'happy',
  activity: 'happy',
  goal: 'thoughtful',
  quickadd: 'happy',
  ready: 'excited',
};

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

  const inputClass = 'w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-center text-xl font-bold text-gray-800 backdrop-blur transition-colors focus:border-blue-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/70 dark:text-white';
  const chipClass = 'rounded-full px-3 py-1 text-xs font-medium transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100 p-4 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      <div className="w-full max-w-sm rounded-3xl bg-white/80 p-6 shadow-2xl shadow-blue-900/10 backdrop-blur-xl dark:bg-slate-800/80">
        {/* Progress dots */}
        <div className="mb-5 flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-blue-500' : i < step ? 'w-1.5 bg-blue-500/70' : 'w-1.5 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Mascot — always centered above content */}
        <div className="mb-3 flex justify-center">
          <Mascot mood={STEP_MOOD[current]} size={88} />
        </div>

        {current === 'welcome' && (
          <div className="text-center">
            <h2 className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
              {t('onboarding.welcome')}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t('onboarding.welcomeDesc')}</p>
          </div>
        )}

        {current === 'weight' && (
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('onboarding.weightTitle')}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('onboarding.weightDesc')}</p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <input
                type="number"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="70"
                min={MIN_WEIGHT_KG}
                max={MAX_WEIGHT_KG}
                className={`${inputClass} w-32`}
              />
              <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-sm font-semibold text-blue-600 dark:text-blue-300">
                {t('onboarding.kg')}
              </span>
            </div>
            {hasValidWeight && (
              <div className="mt-4 rounded-2xl bg-blue-50/80 px-4 py-3 dark:bg-blue-900/20">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  💧 {t('onboarding.baseIntake', { amount: baseGoal })}
                </p>
                <p className="mt-0.5 text-xs text-blue-500 dark:text-blue-400">
                  {t('onboarding.basedOn', { weight: weightKg, factor: WEIGHT_TO_ML_FACTOR })}
                </p>
              </div>
            )}
            <p className="mt-3 text-xs text-gray-500">{t('onboarding.optional')}</p>
          </div>
        )}

        {current === 'activity' && (
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('onboarding.activityTitle')}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('onboarding.activityDesc')}</p>
            <div className="mt-5 space-y-2">
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setActivityInput(level)}
                  className={`w-full rounded-2xl px-4 py-3 text-left transition-all ${
                    activityInput === level
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'bg-white/60 text-gray-700 hover:bg-white/80 dark:bg-slate-700/60 dark:text-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <p className="text-sm font-semibold">{t(`activity.${level}`)}</p>
                  <p className={`text-xs ${activityInput === level ? 'text-white/85' : 'text-gray-500 dark:text-gray-400'}`}>
                    {t(`activity.${level}Desc`)}
                  </p>
                </button>
              ))}
            </div>
            {hasValidWeight && (
              <div className="mt-4 rounded-2xl bg-blue-50/80 px-4 py-2 dark:bg-blue-900/20">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {t('onboarding.adjustedRecommendation', { amount: recommendedGoal })}
                </p>
              </div>
            )}
          </div>
        )}

        {current === 'goal' && (
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('onboarding.goalTitle')}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('onboarding.goalDesc')}</p>
            {hasValidWeight && (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => { setUseCustomGoal(false); setGoalInput(String(recommendedGoal)); }}
                  className={`${chipClass} ${!useCustomGoal ? 'bg-blue-500 text-white' : 'bg-white/60 text-gray-700 hover:bg-white/80 dark:bg-slate-700/60 dark:text-gray-300'}`}
                >
                  {t('onboarding.recommendedGoal', { amount: recommendedGoal })}
                </button>
                <button
                  onClick={() => setUseCustomGoal(true)}
                  className={`${chipClass} ${useCustomGoal ? 'bg-blue-500 text-white' : 'bg-white/60 text-gray-700 hover:bg-white/80 dark:bg-slate-700/60 dark:text-gray-300'}`}
                >
                  {t('onboarding.custom')}
                </button>
              </div>
            )}
            <div className="mt-4 flex items-center justify-center gap-3">
              <input
                type="number"
                value={goalInput}
                onChange={(e) => { setGoalInput(e.target.value); if (hasValidWeight) setUseCustomGoal(true); }}
                min={MIN_GOAL_ML}
                max={MAX_GOAL_ML}
                className={`${inputClass} w-32`}
              />
              <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-sm font-semibold text-blue-600 dark:text-blue-300">
                {t('onboarding.mlPerDay')}
              </span>
            </div>
            {(!hasValidWeight || useCustomGoal) && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[1500, 2000, 2500, 3000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setGoalInput(String(preset))}
                    className={`${chipClass} ${goalInput === String(preset) ? 'bg-blue-500 text-white' : 'bg-white/60 text-gray-700 hover:bg-white/80 dark:bg-slate-700/60 dark:text-gray-300'}`}
                  >
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
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('onboarding.quickAddDesc')}</p>
            <div className="mt-5 flex items-end justify-around gap-3 rounded-2xl bg-gradient-to-br from-sky-100/60 to-blue-100/60 p-4 dark:from-sky-900/30 dark:to-blue-900/30">
              {[100, 250, 500].map((amount) => (
                <div key={amount} className="flex flex-col items-center gap-1.5">
                  <BottleIcon
                    size={amount <= 150 ? 'sm' : amount <= 350 ? 'md' : 'lg'}
                    fillLevel={amount <= 150 ? 0.5 : amount <= 350 ? 0.7 : 0.85}
                    className="drop-shadow-md"
                  />
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-200">
                    {amount} {t('onboarding.ml')}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-gray-500">{t('onboarding.customizeLater')}</p>
          </div>
        )}

        {current === 'ready' && (
          <div className="text-center">
            <h2 className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
              {t('onboarding.readyTitle')}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {t('onboarding.readyDesc')}{' '}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {t('onboarding.readyGoal', { amount: goalInput })}
              </span>{' '}
              {t('onboarding.perDay')}
            </p>
            {hasValidWeight && (
              <p className="mt-2 text-xs text-gray-500">
                {t('onboarding.basedOnWeight', { weight: weightKg, activity: t(`activity.${activityInput}`).toLowerCase() })}
              </p>
            )}
          </div>
        )}

        <button
          onClick={next}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-transform hover:from-sky-600 hover:to-blue-700 active:scale-[0.98]"
        >
          {current === 'ready'
            ? t('onboarding.startTracking')
            : current === 'weight' && !weightInput
              ? t('onboarding.skip')
              : t('onboarding.continue')}
        </button>

        {step > 0 && current !== 'ready' && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-2 w-full py-2 text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {t('onboarding.back')}
          </button>
        )}
      </div>
    </div>
  );
}
