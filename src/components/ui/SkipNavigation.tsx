'use client';

/**
 * Skip Navigation Component
 * Provides a skip link for keyboard users to bypass navigation and jump to main content.
 * **Validates: Requirements 13.4**
 */

import { useTranslations } from 'next-intl';

export interface SkipNavigationProps {
  /** Target element ID to skip to (default: 'main-content') */
  targetId?: string;
}

export function SkipNavigation({ targetId = 'main-content' }: SkipNavigationProps) {
  const t = useTranslations('accessibility');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="skip-navigation"
      aria-label={t('skipToContent')}
    >
      {t('skipToContent')}
    </a>
  );
}
