import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrationCoach } from '../hooks/useHydrationCoach';
import { usePremium } from '../hooks/usePremium';
import { UpgradeModal } from './UpgradeModal';
import { trackEvent } from '../services/analyticsService';

const TYPE_ICONS: Record<string, string> = {
  behind: '⚡',
  on_track: '✅',
  drink_now: '💧',
  prediction: '🕐',
  completed: '🎉',
};

const TYPE_COLORS: Record<string, string> = {
  behind: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
  on_track: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
  drink_now: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
  prediction: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20',
  completed: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
};

const TYPE_TEXT: Record<string, string> = {
  behind: 'text-amber-700 dark:text-amber-300',
  on_track: 'text-green-700 dark:text-green-300',
  drink_now: 'text-blue-700 dark:text-blue-300',
  prediction: 'text-purple-700 dark:text-purple-300',
  completed: 'text-green-700 dark:text-green-300',
};

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
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('coach.title')}</h3>
            <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
              PRO
            </span>
          </div>
          <div className="pointer-events-none select-none blur-[3px]">
            <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-900/20">
              <span className="text-sm">💧</span>
              <p className="text-sm text-blue-700 dark:text-blue-300">{t('coach.previewMessage')}</p>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center rounded-b-xl bg-gradient-to-t from-white via-white/95 to-transparent pb-3 pt-8 dark:from-gray-800 dark:via-gray-800/95">
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

  return (
    <div className="rounded-2xl glass p-4 shadow-lg shadow-blue-900/5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🧠</span>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('coach.title')}</h3>
      </div>
      <div className="space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 ${TYPE_COLORS[msg.type] ?? ''}`}
          >
            <span className="text-sm leading-none">{TYPE_ICONS[msg.type] ?? '💡'}</span>
            <p className={`text-sm font-medium ${TYPE_TEXT[msg.type] ?? ''}`}>{msg.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
