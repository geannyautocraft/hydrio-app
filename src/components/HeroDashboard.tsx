import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationStore, useTodayRecord } from '../store/useHydrationStore';
import { useHydrationCoach } from '../hooks/useHydrationCoach';
import { usePremium } from '../hooks/usePremium';
import { Mascot, type MascotMood } from './Mascot';
import { UpgradeModal } from './UpgradeModal';
import { trackEvent } from '../services/analyticsService';
import {
  getCachedTodayHealthSummary,
  HEALTH_TODAY_UPDATED_EVENT,
  type HealthTodaySummary,
} from '../services/healthService';

type HydrationStatus = 'under' | 'reached' | 'over' | 'excess';

function getStatus(currentMl: number, goalMl: number): HydrationStatus {
  const ratio = currentMl / goalMl;
  if (ratio >= 1.5) return 'excess';
  if (ratio >= 1.2) return 'over';
  if (ratio >= 1) return 'reached';
  return 'under';
}

function getFeedbackKey(currentMl: number, goalMl: number): { key: string; params?: Record<string, number> } {
  const remaining = goalMl - currentMl;
  const ratio = currentMl / goalMl;
  if (currentMl === 0) return { key: 'progress.startDay' };
  if (ratio >= 1.5) return { key: 'progress.tooMuch' };
  if (ratio >= 1.2) return { key: 'progress.wellHydrated' };
  if (ratio >= 1) return { key: 'progress.goalReached' };
  if (remaining <= 250) return { key: 'progress.almostThere', params: { remaining } };
  return { key: 'progress.needMore', params: { remaining } };
}

const STATUS_PALETTE = {
  under: { from: '#60a5fa', to: '#2563eb', track: 'rgba(148, 163, 184, 0.3)', text: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-500' },
  reached: { from: '#4ade80', to: '#16a34a', track: 'rgba(148, 163, 184, 0.3)', text: 'text-green-600 dark:text-green-400', badge: 'bg-green-500' },
  over: { from: '#fb923c', to: '#ea580c', track: 'rgba(148, 163, 184, 0.3)', text: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-500' },
  excess: { from: '#f87171', to: '#dc2626', track: 'rgba(148, 163, 184, 0.3)', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-500' },
} as const;

const COACH_TYPE_TO_MOOD: Record<string, MascotMood> = {
  behind: 'worried',
  on_track: 'happy',
  drink_now: 'happy',
  prediction: 'thoughtful',
  completed: 'excited',
  rest: 'sleepy',
  activity: 'excited',
};

const COACH_BUBBLE: Record<string, string> = {
  behind: 'bg-amber-100/90 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100',
  on_track: 'bg-green-100/90 text-green-900 dark:bg-green-900/40 dark:text-green-100',
  drink_now: 'bg-sky-100/90 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100',
  prediction: 'bg-purple-100/90 text-purple-900 dark:bg-purple-900/40 dark:text-purple-100',
  completed: 'bg-green-100/90 text-green-900 dark:bg-green-900/40 dark:text-green-100',
  rest: 'bg-slate-100/90 text-slate-800 dark:bg-slate-800/60 dark:text-slate-100',
  activity: 'bg-lime-100/90 text-lime-950 dark:bg-lime-900/40 dark:text-lime-100',
};

function ProgressCircle({ status, currentMl, goalMl }: { status: HydrationStatus; currentMl: number; goalMl: number }) {
  const { t } = useTranslation();
  const rawPercentage = goalMl > 0 ? (currentMl / goalMl) * 100 : 0;
  const displayPercentage = Math.min(rawPercentage, 100);
  const palette = STATUS_PALETTE[status];

  const radius = 64;
  const strokeWidth = 11;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayPercentage / 100) * circumference;
  const gradientId = `hero-grad-${status}`;

  return (
    <div className="relative shrink-0">
      <svg width="160" height="160" className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.from} />
            <stop offset="100%" stopColor={palette.to} />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={radius} fill="none" stroke={palette.track} strokeWidth={strokeWidth} />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">
          {currentMl.toLocaleString()}
        </span>
        <span className="text-[10px] text-gray-500">
          {t('progress.of', { goal: goalMl.toLocaleString() })}
        </span>
        <span className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${palette.badge}`}>
          {Math.round(rawPercentage)}%
        </span>
      </div>
    </div>
  );
}

function CoachBubble({ message, mood, color, tailColor, pulse }: { message: string; mood: MascotMood; color: string; tailColor: string; pulse: boolean }) {
  return (
    <div className="relative flex min-w-0 flex-col items-center">
      <Mascot mood={mood} size={80} className={pulse ? 'animate-[bounce_1.2s_ease-in-out_1]' : ''} />
      <div className={`relative mt-1 w-full rounded-2xl px-3 py-2 text-xs font-medium leading-snug ${color}`}>
        <span aria-hidden className={`absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 ${tailColor}`} />
        {message}
      </div>
    </div>
  );
}

export function HeroDashboard() {
  const { t } = useTranslation();
  const goalMl = useHydrationStore((s) => s.goalMl);
  const todayRecord = useTodayRecord();
  const [healthSummary, setHealthSummary] = useState<HealthTodaySummary | null>(() => getCachedTodayHealthSummary());
  const currentMl = todayRecord.totalMl;
  const activityExtraMl = healthSummary?.extraWaterMl ?? 0;
  const hasActivityExtra = activityExtraMl > 0;
  const dayTargetMl = goalMl + activityExtraMl;
  const status = getStatus(currentMl, goalMl);
  const palette = STATUS_PALETTE[status];
  const { key, params } = getFeedbackKey(currentMl, goalMl);
  const feedback = t(key, params);

  const messages = useHydrationCoach();
  const { isPremium } = usePremium();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const primaryMessage = messages[0];
  const mood: MascotMood = primaryMessage ? (COACH_TYPE_TO_MOOD[primaryMessage.type] ?? 'happy') : 'happy';
  const bubbleColor = primaryMessage ? (COACH_BUBBLE[primaryMessage.type] ?? COACH_BUBBLE.drink_now) : COACH_BUBBLE.drink_now;
  const bubbleBg = bubbleColor.split(' ').filter((c) => c.startsWith('bg-')).join(' ');

  // Premium gating: free users see blurred coach with unlock button
  const showCoach = primaryMessage !== undefined;
  const blurredCoach = showCoach && !isPremium;

  useEffect(() => {
    const handleHealthUpdate = (event: Event) => {
      setHealthSummary((event as CustomEvent<HealthTodaySummary>).detail);
    };

    window.addEventListener(HEALTH_TODAY_UPDATED_EVENT, handleHealthUpdate);
    return () => window.removeEventListener(HEALTH_TODAY_UPDATED_EVENT, handleHealthUpdate);
  }, []);

  return (
    <div className="py-4">
      <div className="flex items-center justify-center gap-3">
        <ProgressCircle status={status} currentMl={currentMl} goalMl={goalMl} />

        {showCoach && (
          <div className="relative flex-1 max-w-[160px]">
            <div className={blurredCoach ? 'pointer-events-none select-none blur-[3px]' : ''}>
              <CoachBubble
                message={blurredCoach ? t('coach.previewMessage') : primaryMessage.text}
                mood={mood}
                color={bubbleColor}
                tailColor={bubbleBg}
                pulse={primaryMessage.type === 'completed' || primaryMessage.type === 'on_track' || primaryMessage.type === 'activity'}
              />
            </div>
            {blurredCoach && (
              <button
                onClick={() => { trackEvent('premium_prompt_opened'); setShowUpgrade(true); }}
                className="absolute inset-x-0 bottom-0 z-10 mx-auto rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-[10px] font-semibold text-white shadow-md transition-all hover:from-amber-600 hover:to-orange-600 active:scale-[0.98]"
              >
                {t('coach.unlockCoach')}
              </button>
            )}
          </div>
        )}
      </div>

      <p className={`mt-4 text-center text-sm font-medium ${palette.text}`}>
        {feedback}
      </p>

      {hasActivityExtra && (
        <div className="mx-auto mt-3 w-full max-w-xs rounded-xl bg-lime-500/10 px-3 py-2 dark:bg-lime-400/10">
          <div className="mb-2 flex items-center justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-500" />
            <span className="text-[11px] font-bold text-lime-800 dark:text-lime-200">
              {t('health.activityConnected')}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{t('health.baseGoal')}</p>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{goalMl.toLocaleString()} ml</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{t('health.activityExtra')}</p>
              <p className="text-xs font-bold text-lime-700 dark:text-lime-200">+{activityExtraMl.toLocaleString()} ml</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{t('health.dayTarget')}</p>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{dayTargetMl.toLocaleString()} ml</p>
            </div>
          </div>
        </div>
      )}

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
