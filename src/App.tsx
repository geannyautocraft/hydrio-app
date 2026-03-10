import { useState } from 'react';
import { Header } from './components/Header';
import { GoalEditor } from './components/GoalEditor';
import { HydrationProgress } from './components/HydrationProgress';
import { HydrationInsights } from './components/HydrationInsights';
import { QuickAddButtons } from './components/QuickAddButtons';
import { CustomWaterInput } from './components/CustomWaterInput';
import { DailyLogList } from './components/DailyLogList';
import { HydrationHistory } from './components/HydrationHistory';
import { HydrationStats } from './components/HydrationStats';
import { useMidnightReset } from './hooks/useMidnightReset';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  useMidnightReset();

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
        <HydrationHistory />
        <HydrationStats />
      </div>
    </div>
  );
}
