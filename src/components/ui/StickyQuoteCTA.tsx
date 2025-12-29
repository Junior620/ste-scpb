'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from './Button';

export interface StickyQuoteCTAProps {
  /** Scroll threshold before showing the button (in pixels) */
  scrollThreshold?: number;
  /** Additional CSS classes */
  className?: string;
}

// Helper to get scroll state
function getScrollState(threshold: number) {
  if (typeof window === 'undefined') {
    return { isVisible: false, isAtBottom: false };
  }
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  return {
    isVisible: scrollY > threshold,
    isAtBottom: scrollY + windowHeight >= documentHeight - 200,
  };
}

/**
 * StickyQuoteCTA Component
 * Sticky "Request a Quote" button that appears after scrolling
 * Provides quick access to the quote form from anywhere on the page
 */
export function StickyQuoteCTA({
  scrollThreshold = 300,
  className = '',
}: StickyQuoteCTAProps) {
  const t = useTranslations();
  
  // Subscribe to scroll events using useSyncExternalStore
  const scrollState = useSyncExternalStore(
    useCallback((callback: () => void) => {
      window.addEventListener('scroll', callback, { passive: true });
      return () => window.removeEventListener('scroll', callback);
    }, []),
    () => getScrollState(scrollThreshold),
    () => ({ isVisible: false, isAtBottom: false }) // Server snapshot
  );

  const { isVisible, isAtBottom } = scrollState;

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed z-40 transition-all duration-300 ease-in-out
        ${isAtBottom ? 'bottom-24' : 'bottom-6'}
        right-6
        ${className}
      `}
    >
      <Button
        variant="primary"
        size="lg"
        asChild
        className="
          shadow-lg shadow-primary/30
          hover:shadow-xl hover:shadow-primary/40
          glow-gold
        "
      >
        <Link href="/devis" className="flex items-center gap-2">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="hidden sm:inline">{t('nav.quote')}</span>
          <span className="sm:hidden">{t('nav.quote')}</span>
        </Link>
      </Button>
    </div>
  );
}

export default StickyQuoteCTA;
