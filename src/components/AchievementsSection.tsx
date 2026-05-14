import { useTranslation } from 'react-i18next';
import { useAchievements } from '../hooks/useAchievements';

export function AchievementsSection() {
  const { t } = useTranslation();
  const { achievements, unlockedCount, total } = useAchievements();

  return (
    <div className="rounded-2xl glass p-4 shadow-lg shadow-blue-900/5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('achievements.title')}</h3>
        <span className="text-xs text-gray-500">{unlockedCount}/{total}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`rounded-xl px-3 py-2.5 transition-all ${
              achievement.unlocked
                ? 'glass-inner ring-1 ring-blue-300/40 dark:ring-blue-500/30'
                : 'glass-inner opacity-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-lg leading-none ${achievement.unlocked ? '' : 'grayscale'}`}>
                {achievement.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-xs font-semibold ${achievement.unlocked ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {t(`achievements.${achievement.id}`)}
                </p>
                <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                  {t(`achievements.${achievement.id}_desc`)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
