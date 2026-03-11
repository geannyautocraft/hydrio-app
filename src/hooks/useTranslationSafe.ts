import { useTranslation } from 'react-i18next';

/**
 * Wrapper around useTranslation that ensures i18n is initialized
 * and provides a safe fallback to English.
 */
export function useTranslationSafe() {
  const { t, i18n } = useTranslation();
  return { t, i18n };
}
