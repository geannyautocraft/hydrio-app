import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../store/useThemeStore';
import { useTextSizeStore, type TextSize } from '../../store/useTextSizeStore';

const TEXT_SIZES: { value: TextSize; labelKey: string; className: string }[] = [
  { value: 'normal', labelKey: 'settings.textSizeNormal', className: 'text-sm' },
  { value: 'large', labelKey: 'settings.textSizeLarge', className: 'text-base' },
  { value: 'xlarge', labelKey: 'settings.textSizeXLarge', className: 'text-lg' },
];

const sectionClass = 'rounded-lg border border-gray-300/50 dark:border-gray-600/50 glass-inner p-3';
const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200';

export function AppearanceScreen() {
  const { t } = useTranslation();
  const dark = useThemeStore((s) => s.dark);
  const toggleDark = useThemeStore((s) => s.toggle);
  const textSize = useTextSizeStore((s) => s.size);
  const setTextSize = useTextSizeStore((s) => s.setSize);

  return (
    <div className="space-y-4">
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('settings.darkMode')}</p>
          <button
            type="button"
            onClick={toggleDark}
            className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${dark ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${dark ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      <div>
        <label className={labelClass}>{t('settings.textSize')}</label>
        <div className="flex gap-1.5">
          {TEXT_SIZES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTextSize(opt.value)}
              className={`flex-1 rounded-lg px-2 py-2 font-medium transition-colors ${
                textSize === opt.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/50 text-gray-700 hover:bg-white/70 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15'
              } ${opt.className}`}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
