import { useTranslation } from 'react-i18next';
import { HealthConnectScreen } from './HealthConnectScreen';

const cardClass = 'rounded-lg border border-gray-300/50 bg-white/35 p-3 dark:border-gray-600/50 dark:bg-white/5';

function ComingSoonConnection({ title, description }: { title: string; description: string }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-white/35 px-3 py-2.5 dark:bg-white/5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{description}</p>
      </div>
      <span className="shrink-0 rounded-full bg-gray-500/15 px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:text-gray-300">
        {t('connections.soon')}
      </span>
    </div>
  );
}

export function ConnectionsScreen() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <HealthConnectScreen />

      <div className={cardClass}>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('connections.nextTitle')}</p>
        <div className="mt-3 space-y-2">
          <ComingSoonConnection title={t('connections.stravaTitle')} description={t('connections.stravaDesc')} />
          <ComingSoonConnection title={t('connections.googleFitTitle')} description={t('connections.googleFitDesc')} />
          <ComingSoonConnection title={t('connections.aiDropTitle')} description={t('connections.aiDropDesc')} />
        </div>
      </div>

      <div className={cardClass}>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('connections.privacyTitle')}</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
          {t('connections.privacyDesc')}
        </p>
      </div>
    </div>
  );
}
