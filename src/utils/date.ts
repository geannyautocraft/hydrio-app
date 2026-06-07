export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getDisplayLocale(locale?: string): string {
  const language = locale?.split('-')[0];
  if (language === 'pt') return 'pt-BR';
  if (language === 'es') return 'es-ES';
  if (language === 'en') return 'en-US';
  if (locale) return locale;
  return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
}

export function formatDate(dateKey: string, locale?: string): string {
  const date = new Date(dateKey + 'T00:00:00');
  return date.toLocaleDateString(getDisplayLocale(locale), {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function getMsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

export function getDateLabel(dateKey: string, locale?: string): string {
  const today = getTodayKey();
  if (dateKey === today) return 'Today';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateKey === yesterdayKey) return 'Yesterday';

  return formatDate(dateKey, locale);
}

export function getRecentDateKeys(count: number): string[] {
  const keys: string[] = [];
  const date = new Date();
  for (let i = 0; i < count; i++) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    keys.push(`${year}-${month}-${day}`);
    date.setDate(date.getDate() - 1);
  }
  return keys;
}
