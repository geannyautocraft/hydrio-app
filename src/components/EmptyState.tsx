import { Mascot, type MascotMood } from './Mascot';

interface EmptyStateProps {
  mood?: MascotMood;
  title: string;
  description?: string;
}

export function EmptyState({ mood = 'sleepy', title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl glass px-6 py-8 text-center shadow-lg shadow-blue-900/5">
      <Mascot mood={mood} size={88} />
      <h3 className="mt-3 text-base font-semibold text-gray-800 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 max-w-[280px] text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
}
