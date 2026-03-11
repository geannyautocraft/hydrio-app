import { useState } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useHydrationStore } from '../store/useHydrationStore';
import { PremiumGate } from './PremiumGate';
import type { HydrationProfile, ActivityLevel } from '../types';

function ProfileSwitcherContent() {
  const profiles = useProfileStore((s) => s.profiles);
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile);
  const addProfile = useProfileStore((s) => s.addProfile);
  const removeProfile = useProfileStore((s) => s.removeProfile);

  const setGoal = useHydrationStore((s) => s.setGoal);
  const setActivityLevel = useHydrationStore((s) => s.setActivityLevel);
  const setNotifications = useHydrationStore((s) => s.setNotifications);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGoal, setNewGoal] = useState('2500');

  const handleSwitch = (profile: HydrationProfile) => {
    setActiveProfile(profile.id);
    setGoal(profile.goalMl);
    setActivityLevel(profile.activityLevel);
    setNotifications({ intervalMinutes: profile.reminderInterval });
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const id = crypto.randomUUID();
    const profile: HydrationProfile = {
      id,
      name: newName.trim(),
      goalMl: parseInt(newGoal, 10) || 2500,
      activityLevel: 'moderate' as ActivityLevel,
      reminderInterval: 120,
      icon: '💧',
    };
    addProfile(profile);
    setShowAdd(false);
    setNewName('');
    setNewGoal('2500');
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
        Hydration Profiles
      </h2>

      <div className="space-y-1.5">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
              activeProfileId === profile.id
                ? 'bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:ring-blue-800'
                : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700'
            }`}
          >
            <button
              onClick={() => handleSwitch(profile)}
              className="flex flex-1 items-center gap-2 text-left"
            >
              <span className="text-base">{profile.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {profile.name}
                </p>
                <p className="text-[10px] text-gray-400">
                  {profile.goalMl} ml · {profile.activityLevel}
                </p>
              </div>
            </button>
            <div className="flex items-center gap-1.5">
              {activeProfileId === profile.id && (
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                  Active
                </span>
              )}
              {profile.id !== 'default' && (
                <button
                  onClick={() => removeProfile(profile.id)}
                  className="rounded p-1 text-gray-400 transition-colors hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAdd ? (
        <div className="mt-3 space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-600">
          <input
            type="text"
            placeholder="Profile name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="number"
            placeholder="Goal (ml)"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 rounded-lg bg-blue-500 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
            >
              Add
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs text-gray-600 dark:border-gray-600 dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="mt-2 text-xs font-medium text-blue-500 transition-colors hover:text-blue-700"
        >
          + Add Profile
        </button>
      )}
    </div>
  );
}

export function ProfileSwitcher() {
  return (
    <PremiumGate feature="multiple_profiles">
      <ProfileSwitcherContent />
    </PremiumGate>
  );
}
