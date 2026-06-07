import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Onboarding } from './components/Onboarding';
import { BottomTabBar, type TabKey } from './components/BottomTabBar';
import { TodayScreen } from './components/screens/TodayScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { InsightsScreen } from './components/screens/InsightsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { useMidnightReset } from './hooks/useMidnightReset';
import { useNotifications } from './hooks/useNotifications';
import { useBilling } from './hooks/useBilling';
import { useAuth } from './hooks/useAuth';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import { usePremiumSync } from './hooks/usePremiumSync';
import { useThemeStore } from './store/useThemeStore';
import { useTextSizeStore } from './store/useTextSizeStore';
import { usePremium } from './hooks/usePremium';
import { useHydrioWidget } from './hooks/useHydrioWidget';
import { setAnalyticsUser, trackScreenView } from './services/analyticsService';
import { installGlobalErrorHandlers, setCrashUserId } from './services/crashService';

const ONBOARDING_KEY = 'hydrio-onboarding-complete';

export default function App() {
  const [tab, setTab] = useState<TabKey>('today');
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY)
  );

  useMidnightReset();
  useNotifications();
  useBilling();
  const { user } = useAuth();
  const sync = useFirestoreSync(user?.uid ?? null);
  usePremiumSync(user?.uid ?? null);
  const { isPremium } = usePremium();
  useHydrioWidget(!sync.loading);

  useEffect(() => {
    if (import.meta.env.DEV && user) {
      console.log('[auth] signed in as', user.uid, user.isAnonymous ? '(anonymous)' : '');
    }
    if (user) {
      void setAnalyticsUser(user.uid, {
        is_anonymous: user.isAnonymous ? 'true' : 'false',
        is_premium: isPremium ? 'true' : 'false',
      });
      void setCrashUserId(user.uid);
    }
  }, [user, isPremium]);

  useEffect(() => {
    trackScreenView(tab);
  }, [tab]);

  useEffect(() => {
    installGlobalErrorHandlers();
    const dark = useThemeStore.getState().dark;
    document.documentElement.classList.toggle('dark', dark);
    const size = useTextSizeStore.getState().size;
    document.documentElement.classList.add(`text-size-${size}`);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  if (sync.loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">Hydrio</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderTab = () => {
    switch (tab) {
      case 'today': return <TodayScreen />;
      case 'history': return <HistoryScreen />;
      case 'insights': return <InsightsScreen />;
      case 'settings': return <SettingsScreen />;
    }
  };

  return (
    <>
      <div className="mx-auto max-w-md px-4 pb-24">
        <Header />
        {renderTab()}
      </div>
      <BottomTabBar active={tab} onChange={setTab} />
    </>
  );
}
