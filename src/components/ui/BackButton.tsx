'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';

/**
 * BackButton Component - Smart version with scroll restoration
 * Navigates to the previous page with scroll position restoration
 * If no history exists, redirects to home page
 */
export function BackButton({ fallbackPath = '/' }: { fallbackPath?: string }) {
  const { goBackSmart } = useSmartNavigation();
  const t = useTranslations('common');

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => goBackSmart(fallbackPath)}
      leftIcon={<ArrowLeft className="w-4 h-4" />}
      className="hover:bg-background-tertiary"
      aria-label={t('back')}
    >
      {t('back')}
    </Button>
  );
}
