import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getHealthStatus,
  isHealthConnectAvailableOnPlatform,
  openHealthConnectSettings,
  readTodayHealthSummary,
  requestHealthPermissions,
  type HealthStatus,
  type HealthTodaySummary,
} from '../../services/healthService';

const cardClass = 'rounded-lg border border-gray-300/50 bg-white/35 p-3 dark:border-gray-600/50 dark:bg-white/5';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/45 px-3 py-2 dark:bg-white/10">
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

export function HealthConnectScreen() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [summary, setSummary] = useState<HealthTodaySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = async () => {
    const next = await getHealthStatus();
    setStatus(next);
    return next;
  };

  useEffect(() => {
    void refreshStatus();
  }, []);

  const connect = async () => {
    setLoading(true);
    setError(null);
    try {
      const current = await refreshStatus();
      if (!current.available) {
        await openHealthConnectSettings();
        setError(t(current.requiresInstall ? 'health.installOpened' : 'health.unavailable'));
        return;
      }

      const permissionResult = await requestHealthPermissions();
      const next = await refreshStatus();
      if (!permissionResult.granted && !next.granted) {
        setError(t('health.permissionNotGranted'));
      }
    } catch {
      setError(t('health.errorPermission'));
    } finally {
      setLoading(false);
    }
  };

  const syncToday = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await readTodayHealthSummary();
      setSummary(data);
    } catch {
      setError(t('health.errorRead'));
    } finally {
      setLoading(false);
    }
  };

  if (!isHealthConnectAvailableOnPlatform()) {
    return (
      <div className={cardClass}>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('health.androidOnlyTitle')}</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{t('health.androidOnlyDesc')}</p>
      </div>
    );
  }

  const connected = !!status?.available && !!status?.granted;

  return (
    <div className="space-y-4">
      <div className={cardClass}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('health.title')}</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              {connected ? t('health.connectedDesc') : t('health.disconnectedDesc')}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            connected
              ? 'bg-green-500/15 text-green-700 dark:text-green-300'
              : 'bg-gray-500/15 text-gray-600 dark:text-gray-300'
          }`}>
            {connected ? t('health.connected') : t('health.notConnected')}
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={connect}
            disabled={loading}
            className="flex-1 rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? t('health.connecting') : connected ? t('health.managePermissions') : t('health.connect')}
          </button>
          <button
            type="button"
            onClick={syncToday}
            disabled={loading || !connected}
            className="flex-1 rounded-lg bg-white/60 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-white/80 disabled:opacity-40 dark:bg-white/10 dark:text-blue-300 dark:hover:bg-white/15"
          >
            {t('health.syncToday')}
          </button>
        </div>
      </div>

      {summary && (
        <div className={cardClass}>
          <div className="grid grid-cols-2 gap-2">
            <Stat label={t('health.steps')} value={summary.steps.toLocaleString()} />
            <Stat label={t('health.activeCalories')} value={`${summary.activeCaloriesKcal.toLocaleString()} kcal`} />
            <Stat label={t('health.distance')} value={`${(summary.distanceMeters / 1000).toFixed(2)} km`} />
            <Stat label={t('health.exercises')} value={String(summary.exerciseCount)} />
          </div>

          <div className="mt-3 rounded-lg bg-sky-500/10 px-3 py-2 text-center">
            <p className="text-[11px] font-medium text-sky-700 dark:text-sky-300">{t('health.extraWaterLabel')}</p>
            <p className="text-lg font-black text-sky-800 dark:text-sky-100">+{summary.extraWaterMl} ml</p>
            <p className="text-[11px] leading-relaxed text-sky-700/80 dark:text-sky-200/80">{t('health.extraWaterDesc')}</p>
          </div>

          {summary.sessions.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {summary.sessions.slice(0, 3).map((session) => (
                <div key={`${session.startTime}-${session.title}`} className="flex items-center justify-between rounded-lg bg-white/40 px-3 py-2 text-xs dark:bg-white/10">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{session.title}</span>
                  <span className="text-gray-500 dark:text-gray-400">{session.durationMinutes} min</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
