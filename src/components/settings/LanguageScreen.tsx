import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
];

export function LanguageScreen() {
  const { i18n } = useTranslation();
  return (
    <div className="space-y-2">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors ${
            i18n.language === lang.code
              ? 'bg-blue-500 text-white'
              : 'bg-white/40 text-gray-700 hover:bg-white/60 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10'
          }`}
        >
          <span className="text-sm font-medium">{lang.label}</span>
          {i18n.language === lang.code && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
