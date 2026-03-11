import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SettingsScreen } from './components/SettingsScreen';
import { HydrationProgress } from './components/HydrationProgress';
import { HydrationInsights } from './components/HydrationInsights';
import { HydrationStatusCard } from './components/HydrationStatusCard';
import { InsightsPanel } from './components/InsightsPanel';
import { QuickAddButtons } from './components/QuickAddButtons';
import { CustomWaterInput } from './components/CustomWaterInput';
import { DailyLogList } from './components/DailyLogList';
import { HydrationHistory } from './components/HydrationHistory';
import { HydrationStats } from './components/HydrationStats';
import { WeeklyChart } from './components/WeeklyChart';
import { HydrationHeatmap } from './components/HydrationHeatmap';
import { AchievementsSection } from './components/AchievementsSection';
import { Onboarding } from './components/Onboarding';
import { ExtendedHistory } from './components/ExtendedHistory';
import { AdvancedCharts } from './components/AdvancedCharts';
import { ExportData } from './components/ExportData';
import { CoachCard } from './components/CoachCard';
import { AdvancedInsights } from './components/AdvancedInsights';
import { InstallPrompt } from './components/InstallPrompt';
import { WeeklyChallenge, EndOfDaySummary, ConsistencyMessage } from './components/RetentionCards';
import { useMidnightReset } from './hooks/useMidnightReset';
import { useNotifications } from './hooks/useNotifications';
import { useThemeStore } from './store/useThemeStore';

const ONBOARDING_KEY = 'hydrio-onboarding-complete';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY)
  );

  useMidnightReset();
  useNotifications();

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
          <SettingsScreen onClose={() => setShowSettings(false)} />
        </div>
      )}

      <HydrationProgress />

      <div className="mt-2 space-y-3">
        <HydrationStatusCard />
        <ConsistencyMessage />
        <CoachCard />
        <HydrationInsights />
        <QuickAddButtons />
        <CustomWaterInput />
      </div>

      <div className="mt-6 space-y-4">
        <InstallPrompt />
        <EndOfDaySummary />
        <WeeklyChallenge />
        <DailyLogList />
        <WeeklyChart />
        <AdvancedCharts />
        <HydrationHeatmap />
        <AchievementsSection />
        <HydrationHistory />
        <ExtendedHistory />
        <AdvancedInsights />
        <ExportData />
        <InsightsPanel />
        <HydrationStats />
      </div>
    </div>
  );
}
