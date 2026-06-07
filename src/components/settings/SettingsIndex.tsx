import { useTranslation } from 'react-i18next';
import { useHydrationStore } from '../../store/useHydrationStore';
import { useNotifications } from '../../hooks/useNotifications';
import { useThemeStore } from '../../store/useThemeStore';
import { usePremium } from '../../hooks/usePremium';
import { useAuth } from '../../hooks/useAuth';
import type { SettingsScreenKey } from './types';

interface SettingsIndexProps {
  onNavigate: (screen: SettingsScreenKey) => void;
}

interface RowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
  iconBg: string;
}

function Row({ icon, title, subtitle, onClick, iconBg }: RowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/40 active:bg-white/60 dark:hover:bg-white/5 dark:active:bg-white/10"
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-gray-800 dark:text-gray-100">{title}</span>
        {subtitle && (
          <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{subtitle}</span>
        )}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

export function SettingsIndex({ onNavigate }: SettingsIndexProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const userProfile = useHydrationStore((s) => s.userProfile);
  const goalMl = useHydrationStore((s) => s.goalMl);
  const notifications = useNotifications();
  const dark = useThemeStore((s) => s.dark);
  const { isPremium } = usePremium();

  const accountSubtitle = user?.isAnonymous || !user
    ? t('account.anonymousShort')
    : user.email ?? user.displayName ?? t('account.signedIn');

  const profileSubtitle = userProfile.weightKg
    ? `${userProfile.weightKg} kg · ${t(`activity.${userProfile.activityLevel}`)}`
    : t('settings.indexProfileEmpty');

  const goalSubtitle = `${goalMl.toLocaleString()} ml/${t('settings.indexDayShort')}`;

  const remindersSubtitle = notifications.enabled
    ? t('settings.indexRemindersOnWithWindow', {
        minutes: notifications.intervalMinutes,
        wake: notifications.wakeTime,
        sleep: notifications.sleepTime,
      })
    : t('settings.indexRemindersOff');

  const appearanceSubtitle = `${dark ? t('settings.indexAppearanceDark') : t('settings.indexAppearanceLight')}`;

  const languageLabel = i18n.language === 'pt' ? 'Português' : i18n.language === 'es' ? 'Español' : 'English';

  const premiumSubtitle = isPremium ? t('settings.indexPremiumActive') : t('settings.indexPremiumFree');

  return (
    <div className="space-y-1">
      <Row
        iconBg="bg-blue-500/15 text-blue-600 dark:text-blue-400"
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5z" /></svg>}
        title={t('settings.indexAccount')}
        subtitle={accountSubtitle}
        onClick={() => onNavigate('account')}
      />
      <Row
        iconBg="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        title={t('settings.indexProfile')}
        subtitle={profileSubtitle}
        onClick={() => onNavigate('profile')}
      />
      <Row
        iconBg="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>}
        title={t('settings.indexGoal')}
        subtitle={goalSubtitle}
        onClick={() => onNavigate('goal')}
      />
      <Row
        iconBg="bg-orange-500/15 text-orange-600 dark:text-orange-400"
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0" /></svg>}
        title={t('settings.indexReminders')}
        subtitle={remindersSubtitle}
        onClick={() => onNavigate('reminders')}
      />
      <Row
        iconBg="bg-lime-500/15 text-lime-700 dark:text-lime-300"
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a4 4 0 0 0 0 8h4m4-8h4a4 4 0 0 1 0 8h-4M8 10h8" /></svg>}
        title={t('settings.indexConnections')}
        subtitle={t('settings.indexConnectionsHint')}
        onClick={() => onNavigate('connections')}
      />
      <Row
        iconBg="bg-purple-500/15 text-purple-600 dark:text-purple-400"
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z" /></svg>}
        title={t('settings.indexAppearance')}
        subtitle={appearanceSubtitle}
        onClick={() => onNavigate('appearance')}
      />
      <Row
        iconBg="bg-pink-500/15 text-pink-600 dark:text-pink-400"
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 0 1 6.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>}
        title={t('settings.indexLanguage')}
        subtitle={languageLabel}
        onClick={() => onNavigate('language')}
      />
      <Row
        iconBg="bg-amber-500/15 text-amber-600 dark:text-amber-400"
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3l1.5 5.5L12 10l-5.5 1.5L5 17l-1.5-5.5L-2 10l5.5-1.5L5 3zm14 4l1 3.5 3.5 1-3.5 1L19 16l-1-3.5-3.5-1 3.5-1L19 7z" /></svg>}
        title={t('settings.indexPremium')}
        subtitle={premiumSubtitle}
        onClick={() => onNavigate('premium')}
      />
      <Row
        iconBg="bg-teal-500/15 text-teal-600 dark:text-teal-400"
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 18h6M10 22h4M7 14a5 5 0 1 1 10 0c0 1.7-.9 2.7-1.8 3.6-.6.6-1.2 1.2-1.2 2.4h-4c0-1.2-.6-1.8-1.2-2.4C7.9 16.7 7 15.7 7 14z" /></svg>}
        title={t('settings.indexRoadmap')}
        subtitle={t('settings.indexRoadmapHint')}
        onClick={() => onNavigate('roadmap')}
      />
      <Row
        iconBg="bg-rose-500/15 text-rose-600 dark:text-rose-400"
        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
        title={t('settings.indexFeedback')}
        subtitle={t('settings.indexFeedbackHint')}
        onClick={() => onNavigate('feedback')}
      />
    </div>
  );
}
