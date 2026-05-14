import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationCoach } from '../hooks/useHydrationCoach';
import { usePremium } from '../hooks/usePremium';
import { UpgradeModal } from './UpgradeModal';
import { Mascot, type MascotMood } from './Mascot';
import { trackEvent } from '../services/analyticsService';

const TYPE_TO_MOOD: Record<string, MascotMood> = {
  behind: 'worried',
  on_track: 'happy',
  drink_now: 'happy',
  prediction: 'thoughtful',
  completed: 'excited',
};

const TYPE_BUBBLE: Record<string, string> = {
  behind: 'bg-amber-50/90 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
  on_track: 'bg-green-50/90 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  drink_now: 'bg-blue-50/90 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  prediction: 'bg-purple-50/90 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
  completed: 'bg-green-50/90 text-green-800 dark:bg-green-900/30 dark:text-green-200',
};

function SpeechBubble({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className={`relative rounded-2xl px-4 py-3 text-sm font-medium ${color}`}>
      {/* Tail pointing left to the mascot */}
      <span
        aria-hidden
        className={`absolute -left-1.5 top-5 h-3 w-3 rotate-45 ${color.split(' ').filter((c) => c.startsWith('bg-')).join(' ')}`}
      />
      {children}
    </div>
  );
}

export function CoachCard() {
  const { t } = useTranslation();
  const { isPremium } = usePremium();
  const messages = useHydrationCoach();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (messages.length === 0) return null;

  // Free users see a preview with upgrade prompt
  if (!isPremium) {
    return (
      <>
        <div className="relative overflow-hidden rounded-2xl glass p-4 shadow-lg shadow-blue-900/5">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('coach.title')}</h3>
            <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
              PRO
            </span>
          </div>
          <div className="pointer-events-none flex items-start gap-3 select-none blur-[3px]">
            <Mascot mood="happy" size={64} />
            <div className="flex-1 pt-1">
              <SpeechBubble color={TYPE_BUBBLE.drink_now}>
                {t('coach.previewMessage')}
              </SpeechBubble>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center rounded-b-2xl bg-gradient-to-t from-white via-white/95 to-transparent pb-3 pt-10 dark:from-gray-800 dark:via-gray-800/95">
            <button
              onClick={() => {
                trackEvent('premium_prompt_opened');
                setShowUpgrade(true);
              }}
              className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:from-amber-600 hover:to-orange-600 active:scale-[0.98]"
            >
              {t('coach.unlockCoach')}
            </button>
          </div>
        </div>
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </>
    );
  }

  const primary = messages[0];
  const rest = messages.slice(1);

  return (
    <div className="rounded-2xl glass p-4 shadow-lg shadow-blue-900/5">
      <div className="flex items-start gap-3">
        <Mascot mood={TYPE_TO_MOOD[primary.type] ?? 'happy'} size={72} />
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <SpeechBubble color={TYPE_BUBBLE[primary.type] ?? TYPE_BUBBLE.drink_now}>
            {primary.text}
          </SpeechBubble>
          {rest.map((msg, i) => (
            <p
              key={i}
              className="rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-400 bg-white/30 dark:bg-white/5"
            >
              {msg.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
