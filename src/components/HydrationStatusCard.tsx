import { useHydrationPrediction } from '../hooks/useHydrationPrediction';

export function HydrationStatusCard() {
  const prediction = useHydrationPrediction();

  if (!prediction) return null;

  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
        prediction.onTrack
          ? 'bg-green-50/80 text-green-700 dark:bg-green-900/20 dark:text-green-300'
          : 'bg-amber-50/80 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
      }`}
    >
      <span aria-hidden className="text-base leading-none">
        {prediction.onTrack ? '👍' : '⏰'}
      </span>
      <p className="flex-1">{prediction.message}</p>
    </div>
  );
}
