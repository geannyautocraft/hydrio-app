import { useState } from 'react';
import { useHydrationStore } from '../store/useHydrationStore';
import { MIN_GOAL_ML, MAX_GOAL_ML, DEFAULT_GOAL_ML } from '../types';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = ['welcome', 'goal', 'quickadd', 'ready'] as const;

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [goalInput, setGoalInput] = useState(String(DEFAULT_GOAL_ML));
  const setGoal = useHydrationStore((s) => s.setGoal);

  const current = STEPS[step];

  const next = () => {
    if (step === 1) {
      const goal = parseInt(goalInput, 10);
      if (!isNaN(goal) && goal >= MIN_GOAL_ML && goal <= MAX_GOAL_ML) {
        setGoal(goal);
      }
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">
        {/* Progress dots */}
        <div className="mb-6 flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i <= step ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {current === 'welcome' && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <svg className="h-10 w-10 text-blue-500" viewBox="0 0 64 64" fill="currentColor">
                <path d="M32 4 C32 4 12 28 12 42 C12 53 21 60 32 60 C43 60 52 53 52 42 C52 28 32 4 32 4Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Welcome to Hydrio</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Your personal hydration tracker. Let's set up your profile in a few quick steps.
            </p>
          </div>
        )}

        {current === 'goal' && (
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Set Your Daily Goal</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              How much water do you want to drink each day?
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                min={MIN_GOAL_ML}
                max={MAX_GOAL_ML}
                className="w-28 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-center text-lg font-semibold text-gray-800 dark:text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
              />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ml / day</span>
            </div>
            <div className="mt-4 flex justify-center gap-2">
              {[1500, 2000, 2500, 3000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setGoalInput(String(preset))}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    goalInput === String(preset)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {preset} ml
                </button>
              ))}
            </div>
          </div>
        )}

        {current === 'quickadd' && (
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Quick Add Buttons</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Tap these buttons on the dashboard to quickly log water intake.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {[100, 250, 500].map((amount) => (
                <div
                  key={amount}
                  className="rounded-xl bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-center"
                >
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">+{amount}</p>
                  <p className="text-xs text-gray-400">ml</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
              You can customize these amounts later in settings.
            </p>
          </div>
        )}

        {current === 'ready' && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">You're All Set!</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Start tracking your hydration and stay healthy. Your goal is{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">{goalInput} ml</span> per day.
            </p>
          </div>
        )}

        <button
          onClick={next}
          className="mt-6 w-full rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
        >
          {current === 'ready' ? 'Start Tracking' : 'Continue'}
        </button>

        {step > 0 && current !== 'ready' && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-2 w-full py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
