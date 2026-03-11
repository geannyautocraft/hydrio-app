import { useTranslation } from 'react-i18next';
import { usePremium } from '../hooks/usePremium';

export function PremiumBadge() {
  const { t } = useTranslation();
  const { isPremium } = usePremium();

  if (!isPremium) return null;

  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      {t('premium.pro')}
    </span>
  );
}
