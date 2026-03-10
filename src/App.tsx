import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GoalEditor } from './components/GoalEditor';
import { HydrationProgress } from './components/HydrationProgress';
import { HydrationInsights } from './components/HydrationInsights';
import { QuickAddButtons } from './components/QuickAddButtons';
import { CustomWaterInput } from './components/CustomWaterInput';
import { DailyLogList } from './components/DailyLogList';
import { HydrationHistory } from './components/HydrationHistory';
import { HydrationStats } from './components/HydrationStats';
import { WeeklyChart } from './components/WeeklyChart';
import { Onboarding } from './components/Onboarding';
import { useMidnightReset } from './hooks/useMidnightReset';
import { useThemeStore } from './store/useThemeStore';

const ONBOARDING_KEY = 'hydrio-onboarding-complete';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY)
  );

  useMidnightReset();

  // Initialize dark mode class on mount
  useEffect(() => {
    const dark = useThemeStore.getState().dark;
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-10">
      <Header
        onToggleSettings={() => setShowSettings((s) => !s)}
        settingsOpen={showSettings}
      />

      {showSettings && (
        <div className="mb-4">
          <GoalEditor isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div>
      )}

      <HydrationProgress />

      <div className="mt-2 space-y-3">
        <HydrationInsights />
        <QuickAddButtons />
        <CustomWaterInput />
      </div>

      <div className="mt-6 space-y-4">
        <DailyLogList />
        <WeeklyChart />
        <HydrationHistory />
        <HydrationStats />
      </div>
    </div>
  );
}
