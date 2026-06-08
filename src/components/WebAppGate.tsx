import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { AccountSection } from './AccountSection';

interface WebAppGateProps {
  user: User | null;
  isPremium: boolean;
  children: ReactNode;
}

const WEB_PRO_ALLOWLIST = new Set([
  'geanny.mrodrigues@gmail.com',
  'gerodrigues.games@gmail.com',
]);

export function isAppWebRoute(): boolean {
  return window.location.pathname.startsWith('/appweb');
}

export function WebAppGate({ user, isPremium, children }: WebAppGateProps) {
  const { t } = useTranslation();
  const needsLogin = !user || user.isAnonymous;
  const hasWebAccess = isPremium || (user?.email ? WEB_PRO_ALLOWLIST.has(user.email.toLowerCase()) : false);

  if (!needsLogin && hasWebAccess) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-4 py-8">
      <div className="rounded-2xl glass-strong p-5 shadow-lg shadow-blue-900/5">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 text-2xl font-black text-white">
            H
          </div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">{t('webApp.title')}</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {needsLogin ? t('webApp.loginDesc') : t('webApp.premiumDesc')}
          </p>
        </div>

        {needsLogin ? (
          <AccountSection />
        ) : (
          <div className="rounded-xl border border-amber-300/60 bg-amber-50/80 p-4 dark:border-amber-500/30 dark:bg-amber-900/20">
            <p className="text-center text-sm font-bold text-amber-900 dark:text-amber-100">{t('webApp.premiumRequired')}</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-800/80 dark:text-amber-100/80">
              {t('webApp.premiumHint')}
            </p>
            <div className="mt-4 grid gap-2 text-xs text-amber-900 dark:text-amber-100">
              <div className="rounded-lg bg-white/45 px-3 py-2 dark:bg-white/10">{t('webApp.benefitDashboard')}</div>
              <div className="rounded-lg bg-white/45 px-3 py-2 dark:bg-white/10">{t('webApp.benefitHistory')}</div>
              <div className="rounded-lg bg-white/45 px-3 py-2 dark:bg-white/10">{t('webApp.benefitSync')}</div>
            </div>
            <a
              href="https://play.google.com/store/apps/details?id=com.hydrio.app"
              target="_blank"
              rel="noreferrer"
              className="mt-4 block rounded-lg bg-amber-500 px-3 py-2 text-center text-sm font-bold text-white transition-colors hover:bg-amber-600"
            >
              {t('webApp.openAndroid')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
