'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Button } from './Button';

/**
 * BackButton Component
 * Navigates to the previous page using browser history
 */
export function BackButton() {
  const router = useRouter();
  const t = useTranslations('common');

  const handleBack = () => {
    router.back();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      leftIcon={<ArrowLeft className="w-4 h-4" />}
      className="hover:bg-background-tertiary"
      aria-label={t('back')}
    >
      {t('back')}
    </Button>
  );
}
