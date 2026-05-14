import { HeroDashboard } from '../HeroDashboard';
import { HydrationStatusCard } from '../HydrationStatusCard';
import { HydrationInsights } from '../HydrationInsights';
import { QuickAddButtons } from '../QuickAddButtons';
import { CustomWaterInput } from '../CustomWaterInput';
import { DailyLogList } from '../DailyLogList';
import { InstallPrompt } from '../InstallPrompt';
import {
  WeeklyChallenge,
  EndOfDaySummary,
} from '../RetentionCards';

export function TodayScreen() {
  return (
    <>
      <HeroDashboard />

      <div className="space-y-3">
        <HydrationInsights />
        <HydrationStatusCard />
        <QuickAddButtons />
        <CustomWaterInput />
      </div>

      <div className="mt-6 space-y-4">
        <InstallPrompt />
        <EndOfDaySummary />
        <WeeklyChallenge />
        <DailyLogList />
      </div>
    </>
  );
}
