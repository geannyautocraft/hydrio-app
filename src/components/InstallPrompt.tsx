import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem('hydrio-install-dismissed'));
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (isInstalled || dismissed || !deferredPrompt) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('hydrio-install-dismissed', 'true');
    setDismissed(true);
  };

  return (
    <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 shadow-sm dark:border-blue-800 dark:from-blue-900/20 dark:to-cyan-900/20">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-2xl">📱</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800 dark:text-white">{t('install.title')}</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{t('install.description')}</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleInstall}
              className="rounded-lg bg-blue-500 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-blue-600 active:scale-[0.98]"
            >
              {t('install.button')}
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {t('install.dismiss')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
