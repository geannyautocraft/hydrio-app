import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../hooks/useNotifications';

const INTERVAL_OPTIONS = [
  { labelKey: 'settings.interval30min', value: 30 },
  { labelKey: 'settings.interval1hr', value: 60 },
  { labelKey: 'settings.interval2hr', value: 120 },
  { labelKey: 'settings.interval3hr', value: 180 },
];

const sectionClass = 'rounded-lg border border-gray-300/50 dark:border-gray-600/50 glass-inner p-3';

export function RemindersScreen() {
  const { t } = useTranslation();
  const notifications = useNotifications();

  const toggle = async () => {
    if (notifications.enabled) notifications.disable();
    else await notifications.enable();
  };

  return (
    <div className="space-y-4">
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {notifications.enabled ? t('settings.remindersOn') : t('settings.remindersOff')}
            </p>
            {!notifications.supported && (
              <p className="text-xs text-gray-500">{t('settings.notSupported')}</p>
            )}
          </div>
          <button
            type="button"
            onClick={toggle}
            disabled={!notifications.supported}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${notifications.enabled ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'} ${!notifications.supported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${notifications.enabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      {notifications.enabled && (
        <div>
          <p className="mb-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200">
            {t('settings.indexRemindersInterval')}
          </p>
          <div className="flex gap-1.5">
            {INTERVAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => notifications.setInterval(opt.value)}
                className={`flex-1 rounded-full px-2.5 py-2 text-xs font-medium transition-colors ${
                  notifications.intervalMinutes === opt.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/50 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
