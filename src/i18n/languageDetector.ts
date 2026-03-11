import type { LanguageDetectorModule } from 'i18next';

const STORAGE_KEY = 'hydrio-language';

const languageDetector: LanguageDetectorModule = {
  type: 'languageDetector',
  init() {},
  detect() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const browserLang = navigator.language.split('-')[0];
    if (['en', 'pt', 'es'].includes(browserLang)) return browserLang;
    return 'en';
  },
  cacheUserLanguage(lng: string) {
    localStorage.setItem(STORAGE_KEY, lng);
  },
};

export default languageDetector;
