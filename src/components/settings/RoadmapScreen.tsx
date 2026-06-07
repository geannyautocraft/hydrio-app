import { useTranslation } from 'react-i18next';
import { Mascot } from '../Mascot';

const itemClass = 'rounded-lg border border-gray-300/50 bg-white/35 p-3 dark:border-gray-600/50 dark:bg-white/5';

const ITEMS = [
  {
    titleKey: 'roadmap.aiDropTitle',
    statusKey: 'roadmap.statusPlanned',
    descriptionKey: 'roadmap.aiDropDesc',
    tint: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  },
  {
    titleKey: 'roadmap.smarterWidgetsTitle',
    statusKey: 'roadmap.statusNext',
    descriptionKey: 'roadmap.smarterWidgetsDesc',
    tint: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
  },
  {
    titleKey: 'roadmap.personalRhythmTitle',
    statusKey: 'roadmap.statusResearch',
    descriptionKey: 'roadmap.personalRhythmDesc',
    tint: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  },
];

export function RoadmapScreen() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-blue-200/60 bg-blue-50/70 p-3 dark:border-blue-800/60 dark:bg-blue-950/30">
        <Mascot mood="thoughtful" size={58} className="shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('roadmap.heroTitle')}</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{t('roadmap.heroDesc')}</p>
        </div>
      </div>

      <div className="space-y-2">
        {ITEMS.map((item) => (
          <div key={item.titleKey} className={itemClass}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t(item.titleKey)}</h3>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.tint}`}>
                {t(item.statusKey)}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">{t(item.descriptionKey)}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
        {t('roadmap.footer')}
      </p>
    </div>
  );
}
