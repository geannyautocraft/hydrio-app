import { useHydrationInsights } from '../hooks/useHydrationInsights';

const TYPE_STYLES = {
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
} as const;

const TYPE_ICONS = {
  info: '💡',
  success: '✅',
  warning: '⚠️',
} as const;

export function HydrationInsights() {
  const insight = useHydrationInsights();

  return (
    <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${TYPE_STYLES[insight.type]}`}>
      <span className="text-base leading-none">{TYPE_ICONS[insight.type]}</span>
      <p className="text-sm font-medium">{insight.message}</p>
    </div>
  );
}
