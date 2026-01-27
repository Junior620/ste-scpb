'use client';

import { useCallback, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  saveScrollPosition,
  getSavedScrollPosition,
  restoreScrollPosition,
  clearScrollPosition,
  buildReturnUrl,
  parseReturnParams,
} from '@/lib/navigation';

/**
 * Hook for smart navigation with scroll restoration
 *
 * Usage on source page:
 * ```tsx
 * const { navigateWithReturn } = useSmartNavigation();
 * <button onClick={() => navigateWithReturn('/contact')}>Contact</button>
 * ```
 *
 * Usage on target page (automatic restoration):
 * ```tsx
 * useSmartNavigation(); // Just call it, restoration is automatic
 * ```
 */
export function useSmartNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Navigate to a page while saving current scroll position
   */
  const navigateWithReturn = useCallback(
    (targetPath: string, options?: { saveScroll?: boolean }) => {
      const shouldSaveScroll = options?.saveScroll !== false;

      if (shouldSaveScroll) {
        // Save current scroll position
        saveScrollPosition(pathname);

        // Build URL with return params
        const url = buildReturnUrl(targetPath, pathname, window.scrollY);
        router.push(url);
      } else {
        router.push(targetPath);
      }
    },
    [router, pathname]
  );

  /**
   * Go back with scroll restoration
   */
  const goBackSmart = useCallback(
    (fallbackPath = '/') => {
      const { returnTo, scrollY } = parseReturnParams(searchParams);

      if (returnTo) {
        // Navigate to return path
        router.push(returnTo);

        // Restore scroll after navigation
        if (scrollY !== null) {
          setTimeout(() => {
            restoreScrollPosition(scrollY);
            clearScrollPosition();
          }, 100);
        }
      } else if (typeof window !== 'undefined' && window.history.length > 1) {
        // Use browser back if history exists
        router.back();
      } else {
        // Fallback to home
        router.push(fallbackPath);
      }
    },
    [router, searchParams]
  );

  /**
   * Auto-restore scroll position on mount (for returning to source page)
   */
  useEffect(() => {
    // Only restore if we have a saved position for this path
    const savedScrollY = getSavedScrollPosition(pathname);

    if (savedScrollY !== null) {
      // Delay restoration to ensure DOM is ready
      const timer = setTimeout(() => {
        restoreScrollPosition(savedScrollY, true);
        clearScrollPosition();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  /**
   * Disable browser's automatic scroll restoration
   */
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      const originalScrollRestoration = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';

      return () => {
        window.history.scrollRestoration = originalScrollRestoration;
      };
    }
  }, []);

  return {
    navigateWithReturn,
    goBackSmart,
  };
}
