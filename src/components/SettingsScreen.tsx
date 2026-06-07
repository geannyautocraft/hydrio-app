import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountSection } from './AccountSection';
import { SettingsIndex } from './settings/SettingsIndex';
import { ProfileScreen } from './settings/ProfileScreen';
import { GoalScreen } from './settings/GoalScreen';
import { RemindersScreen } from './settings/RemindersScreen';
import { ConnectionsScreen } from './settings/ConnectionsScreen';
import { AppearanceScreen } from './settings/AppearanceScreen';
import { LanguageScreen } from './settings/LanguageScreen';
import { PremiumScreen } from './settings/PremiumScreen';
import { RoadmapScreen } from './settings/RoadmapScreen';
import { FeedbackScreen } from './settings/FeedbackScreen';
import type { SettingsScreenKey } from './settings/types';

export function SettingsScreen() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<SettingsScreenKey>('index');

  const titleKey: Record<SettingsScreenKey, string> = {
    index: 'settings.title',
    account: 'settings.indexAccount',
    profile: 'settings.indexProfile',
    goal: 'settings.indexGoal',
    reminders: 'settings.indexReminders',
    connections: 'settings.indexConnections',
    appearance: 'settings.indexAppearance',
    language: 'settings.indexLanguage',
    premium: 'settings.indexPremium',
    roadmap: 'settings.indexRoadmap',
    feedback: 'settings.indexFeedback',
  };

  const renderContent = () => {
    switch (screen) {
      case 'account': return <AccountSection />;
      case 'profile': return <ProfileScreen />;
      case 'goal': return <GoalScreen />;
      case 'reminders': return <RemindersScreen />;
      case 'connections': return <ConnectionsScreen />;
      case 'appearance': return <AppearanceScreen />;
      case 'language': return <LanguageScreen />;
      case 'premium': return <PremiumScreen />;
      case 'roadmap': return <RoadmapScreen />;
      case 'feedback': return <FeedbackScreen />;
      default: return <SettingsIndex onNavigate={setScreen} />;
    }
  };

  return (
    <div className="rounded-2xl glass-strong p-5 shadow-lg shadow-blue-900/5">
      <div className="mb-4 flex items-center gap-2">
        {screen !== 'index' && (
          <button
            onClick={() => setScreen('index')}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label={t('settings.back')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h2 className="truncate text-lg font-bold text-gray-800 dark:text-white">
          {t(titleKey[screen])}
        </h2>
      </div>

      <div className="min-h-[8rem]">{renderContent()}</div>
    </div>
  );
}
