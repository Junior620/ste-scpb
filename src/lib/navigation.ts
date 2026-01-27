/**
 * Smart Navigation Utilities
 * Handles scroll position restoration for intelligent back navigation
 */

const STORAGE_KEY = 'smart_nav_scroll';

export interface ScrollPosition {
  path: string;
  scrollY: number;
  timestamp: number;
}

/**
 * Save current scroll position before navigation
 */
export function saveScrollPosition(currentPath: string): void {
  if (typeof window === 'undefined') return;

  const position: ScrollPosition = {
    path: currentPath,
    scrollY: window.scrollY,
    timestamp: Date.now(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  } catch (error) {
    console.warn('Failed to save scroll position:', error);
  }
}

/**
 * Get saved scroll position for a specific path
 */
export function getSavedScrollPosition(path: string): number | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const position: ScrollPosition = JSON.parse(stored);

    // Check if position is for the requested path and not too old (5 minutes)
    const isExpired = Date.now() - position.timestamp > 5 * 60 * 1000;
    if (position.path === path && !isExpired) {
      return position.scrollY;
    }
  } catch (error) {
    console.warn('Failed to retrieve scroll position:', error);
  }

  return null;
}

/**
 * Clear saved scroll position
 */
export function clearScrollPosition(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear scroll position:', error);
  }
}

/**
 * Restore scroll position with smooth behavior
 */
export function restoreScrollPosition(scrollY: number, smooth = true): void {
  if (typeof window === 'undefined') return;

  // Wait for DOM to be ready
  requestAnimationFrame(() => {
    window.scrollTo({
      top: scrollY,
      behavior: smooth ? 'smooth' : 'auto',
    });
  });
}

/**
 * Build URL with return navigation params
 */
export function buildReturnUrl(targetPath: string, returnPath: string, scrollY?: number): string {
  const url = new URL(targetPath, window.location.origin);
  url.searchParams.set('returnTo', returnPath);
  if (scrollY !== undefined) {
    url.searchParams.set('scrollY', scrollY.toString());
  }
  return url.pathname + url.search;
}

/**
 * Parse return navigation params from URL
 */
export function parseReturnParams(searchParams: URLSearchParams): {
  returnTo: string | null;
  scrollY: number | null;
} {
  const returnTo = searchParams.get('returnTo');
  const scrollYStr = searchParams.get('scrollY');
  const scrollY = scrollYStr ? parseInt(scrollYStr, 10) : null;

  return { returnTo, scrollY };
}
