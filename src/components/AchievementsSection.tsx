import { useTranslation } from 'react-i18next';
import { useAchievements } from '../hooks/useAchievements';

export function AchievementsSection() {
  const { t } = useTranslation();
  const { achievements, unlockedCount, total } = useAchievements();

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('achievements.title')}</h3>
        <span className="text-xs text-gray-400">{unlockedCount}/{total}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`rounded-lg border px-3 py-2.5 transition-colors ${
              achievement.unlocked
                ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                : 'border-gray-100 bg-gray-50 opacity-50 dark:border-gray-700 dark:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">{achievement.icon}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold truncate ${achievement.unlocked ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                  {t(`achievements.${achievement.id}`)}
                </p>
                <p className={`text-[10px] truncate ${achievement.unlocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}>
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
