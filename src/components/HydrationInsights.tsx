import { useHydrationInsights } from '../hooks/useHydrationInsights';

const TYPE_STYLES = {
  info: 'bg-blue-50/80 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  success: 'bg-green-50/80 text-green-700 dark:bg-green-900/20 dark:text-green-300',
  warning: 'bg-amber-50/80 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
} as const;

const TYPE_ICONS = {
  info: '💡',
  success: '✨',
  warning: '⚠️',
} as const;

export function HydrationInsights() {
  const insights = useHydrationInsights();
  // Show only the most relevant tip to avoid visual clutter.
  const primary = insights[0];

  if (!primary) return null;

  return (
    <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 ${TYPE_STYLES[primary.type]}`}>
      <span aria-hidden className="text-base leading-none">{TYPE_ICONS[primary.type]}</span>
      <p className="flex-1 text-sm font-medium">{primary.message}</p>
    </div>
  );
}
