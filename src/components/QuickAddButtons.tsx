import { useHydrationStore } from '../store/useHydrationStore';

export function QuickAddButtons() {
  const addEntry = useHydrationStore((s) => s.addEntry);
  const presets = useHydrationStore((s) => s.quickPresets);

  return (
    <div className="flex gap-2">
      {presets.map((amount) => (
        <button
          key={amount}
          onClick={() => addEntry(amount)}
          className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-600 hover:shadow-md active:scale-95 active:shadow-sm"
        >
          +{amount} ml
        </button>
      ))}
    </div>
  );
}
