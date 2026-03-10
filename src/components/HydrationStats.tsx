import { useHydrationStats } from '../hooks/useHydrationStats';

export function HydrationStats() {
  const stats = useHydrationStats();

  if (stats.totalDays < 2) return null;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-gray-600">Statistics</h2>
      <div className="grid grid-cols-3 gap-3">
        <StatItem label="Daily avg" value={`${stats.averageMl.toLocaleString()} ml`} />
        <StatItem label="Best day" value={`${stats.bestDayMl.toLocaleString()} ml`} />
        <StatItem
          label="Streak"
          value={stats.streak > 0 ? `${stats.streak} day${stats.streak === 1 ? '' : 's'}` : '—'}
        />
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2.5 text-center">
      <p className="text-sm font-semibold text-gray-800">{value}</p>
      <p className="mt-0.5 text-xs text-gray-400">{label}</p>
    </div>
  );
}
