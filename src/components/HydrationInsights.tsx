import { useHydrationInsights } from '../hooks/useHydrationInsights';

const TYPE_STYLES = {
  info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  success: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
} as const;

const TYPE_ICONS = {
  info: '💡',
  success: '✅',
  warning: '⚠️',
} as const;

export function HydrationInsights() {
  const insights = useHydrationInsights();

  return (
    <div className="space-y-2">
      {insights.map((insight, i) => (
        <div
          key={i}
          className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${TYPE_STYLES[insight.type]}`}
        >
          <span className="text-base leading-none">{TYPE_ICONS[insight.type]}</span>
          <p className="text-sm font-medium">{insight.message}</p>
        </div>
      ))}
    </div>
  );
}
