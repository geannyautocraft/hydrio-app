import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { usePremium } from '../../hooks/usePremium';
import { trackEvent } from '../../services/analyticsService';

const FEEDBACK_EMAIL = 'lumedev.co@gmail.com';

type Kind = 'suggestion' | 'bug' | 'improvement' | 'other';

interface OptionDef {
  kind: Kind;
  emoji: string;
  tint: string;
}

const OPTIONS: OptionDef[] = [
  { kind: 'suggestion', emoji: '💡', tint: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  { kind: 'bug', emoji: '🐛', tint: 'bg-red-500/15 text-red-700 dark:text-red-300' },
  { kind: 'improvement', emoji: '✨', tint: 'bg-purple-500/15 text-purple-700 dark:text-purple-300' },
  { kind: 'other', emoji: '💬', tint: 'bg-blue-500/15 text-blue-700 dark:text-blue-300' },
];

function buildMailto(kind: Kind, body: string, meta: Record<string, string>): string {
  const subject = `[Hydrio] ${kind}`;
  const metaBlock = Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join('\n');
  const fullBody = `${body.trim()}\n\n---\n${metaBlock}`;
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`;
}

export function FeedbackScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const [kind, setKind] = useState<Kind>('suggestion');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200';
  const textareaClass = 'w-full rounded-lg border border-gray-300/60 px-3 py-2 text-base text-gray-900 bg-white/60 backdrop-blur-sm transition-colors focus:border-blue-400 focus:outline-none dark:border-gray-600/60 dark:bg-gray-800/60 dark:text-white dark:focus:border-blue-500';

  const send = () => {
    if (!message.trim()) return;
    trackEvent('feedback_sent', { kind, length: message.length });
    const meta = {
      'App version': '0.1.0',
      'Platform': 'Android',
      'Locale': i18n.language,
      'Plan': isPremium ? 'Premium' : 'Free',
      'User ID': user?.uid ?? 'anonymous',
      'User type': user?.isAnonymous ? 'Anonymous' : 'Signed in',
    };
    const href = buildMailto(kind, message, meta);
    window.location.href = href;
    setSent(true);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {t('feedback.intro')}
      </p>

      <div>
        <label className={labelClass}>{t('feedback.kind')}</label>
        <div className="grid grid-cols-2 gap-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.kind}
              type="button"
              onClick={() => setKind(opt.kind)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all ${
                kind === opt.kind
                  ? 'border-blue-400 bg-blue-50/80 text-blue-700 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-200'
                  : 'border-transparent bg-white/40 text-gray-700 hover:bg-white/60 dark:bg-slate-700/40 dark:text-gray-200 dark:hover:bg-slate-700/60'
              }`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${opt.tint}`}>
                {opt.emoji}
              </span>
              <span className="truncate">{t(`feedback.kind_${opt.kind}`)}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="feedback-message" className={labelClass}>
          {t('feedback.message')}
        </label>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(e) => { setMessage(e.target.value); setSent(false); }}
          rows={5}
          placeholder={t('feedback.placeholder')}
          className={textareaClass}
        />
      </div>

      <button
        type="button"
        onClick={send}
        disabled={!message.trim()}
        className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-transform hover:from-sky-600 hover:to-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
      >
        {t('feedback.send')}
      </button>

      {sent && (
        <div className="rounded-xl bg-green-50/80 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
          {t('feedback.sentHint')}
        </div>
      )}

      <p className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        {t('feedback.directEmail')}{' '}
        <a
          href={`mailto:${FEEDBACK_EMAIL}`}
          className="font-semibold text-blue-500 hover:text-blue-700 dark:text-blue-400"
        >
          {FEEDBACK_EMAIL}
        </a>
      </p>
    </div>
  );
}
