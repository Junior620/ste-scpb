'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from './Button';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieBannerProps {
  /** Callback when preferences are saved */
  onPreferencesSaved?: (preferences: CookiePreferences) => void;
  /** Additional CSS classes */
  className?: string;
}

const COOKIE_CONSENT_KEY = 'ste-scpb-cookie-consent';
const COOKIE_PREFERENCES_KEY = 'ste-scpb-cookie-preferences';

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true, // Always true, cannot be disabled
  analytics: false,
  marketing: false,
};

// Cache for stored preferences to avoid creating new objects on each call
let cachedPreferences: CookiePreferences = DEFAULT_PREFERENCES;
let lastStoredValue: string | null = null;

/**
 * Get stored cookie preferences from localStorage
 * Uses caching to return the same object reference when data hasn't changed
 */
function getStoredPreferences(): CookiePreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  
  try {
    const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    
    // Return cached value if storage hasn't changed
    if (stored === lastStoredValue) {
      return cachedPreferences;
    }
    
    lastStoredValue = stored;
    
    if (stored) {
      cachedPreferences = JSON.parse(stored);
      return cachedPreferences;
    }
  } catch {
    // Ignore parsing errors
  }
  
  cachedPreferences = DEFAULT_PREFERENCES;
  return cachedPreferences;
}

/**
 * Check if user has already given consent
 */
function hasConsent(): boolean {
  if (typeof window === 'undefined') return true; // Assume consent on server to hide banner
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'true';
}

/**
 * Get initial visibility state (for SSR-safe initialization)
 */
function getInitialVisibility(): boolean {
  if (typeof window === 'undefined') return false;
  return !hasConsent();
}

// Subscribe to storage changes for useSyncExternalStore
function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('cookieConsentChanged', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('cookieConsentChanged', callback);
  };
}

/**
 * CookieBanner Component
 * GDPR-compliant cookie consent banner with preference management
 * Integrates with analytics based on user consent
 */
export function CookieBanner({
  onPreferencesSaved,
  className = '',
}: CookieBannerProps) {
  const t = useTranslations('cookies');
  
  // Use useSyncExternalStore for SSR-safe localStorage access
  const shouldShowBanner = useSyncExternalStore(
    subscribeToStorage,
    getInitialVisibility,
    () => false // Server snapshot - don't show banner during SSR
  );
  
  const storedPrefs = useSyncExternalStore(
    subscribeToStorage,
    getStoredPreferences,
    () => DEFAULT_PREFERENCES // Server snapshot
  );
  
  // Local state for UI interactions (not synced with storage until save)
  const [showPreferences, setShowPreferences] = useState(false);
  const [localPreferences, setLocalPreferences] = useState<CookiePreferences>(storedPrefs);
  const [isHidden, setIsHidden] = useState(false);
  
  // Derive visibility from external store and local hidden state
  const isVisible = shouldShowBanner && !isHidden;

  const savePreferences = useCallback(
    (prefs: CookiePreferences) => {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
      setLocalPreferences(prefs);
      setIsHidden(true);
      setShowPreferences(false);
      onPreferencesSaved?.(prefs);

      // Dispatch custom event for analytics integration
      window.dispatchEvent(
        new CustomEvent('cookieConsentChanged', { detail: prefs })
      );
    },
    [onPreferencesSaved]
  );

  const handleAcceptAll = useCallback(() => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  }, [savePreferences]);

  const handleDeclineAll = useCallback(() => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  }, [savePreferences]);

  const handleSavePreferences = useCallback(() => {
    savePreferences(localPreferences);
  }, [localPreferences, savePreferences]);

  const handlePreferenceChange = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setLocalPreferences((prev: CookiePreferences) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-background-secondary border-t border-border
        shadow-lg
        ${className}
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-title"
    >
      <div className="container mx-auto px-4 py-4 md:py-6">
        {!showPreferences ? (
          // Simple banner view
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h2 id="cookie-banner-title" className="text-lg font-semibold text-foreground mb-1">
                {t('title')}
              </h2>
              <p className="text-sm text-foreground-muted">
                {t('description')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={handleDeclineAll}>
                {t('decline')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowPreferences(true)}>
                {t('customize')}
              </Button>
              <Button variant="primary" size="sm" onClick={handleAcceptAll}>
                {t('accept')}
              </Button>
            </div>
          </div>
        ) : (
          // Preferences view
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 id="cookie-banner-title" className="text-lg font-semibold text-foreground">
                {t('preferences.title')}
              </h2>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-tertiary transition-colors"
                aria-label={t('close', { ns: 'common' })}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Necessary cookies - always enabled */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-0.5">
                  <input
                    type="checkbox"
                    id="cookie-necessary"
                    checked={localPreferences.necessary}
                    disabled
                    className="h-4 w-4 rounded border-border bg-background-tertiary text-primary focus:ring-accent cursor-not-allowed"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="cookie-necessary" className="text-sm font-medium text-foreground">
                    {t('preferences.necessary')}
                  </label>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {t('preferences.necessaryDescription')}
                  </p>
                </div>
              </div>

              {/* Analytics cookies */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-0.5">
                  <input
                    type="checkbox"
                    id="cookie-analytics"
                    checked={localPreferences.analytics}
                    onChange={() => handlePreferenceChange('analytics')}
                    className="h-4 w-4 rounded border-border bg-background-tertiary text-primary focus:ring-accent cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="cookie-analytics" className="text-sm font-medium text-foreground cursor-pointer">
                    {t('preferences.analytics')}
                  </label>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {t('preferences.analyticsDescription')}
                  </p>
                </div>
              </div>

              {/* Marketing cookies */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-0.5">
                  <input
                    type="checkbox"
                    id="cookie-marketing"
                    checked={localPreferences.marketing}
                    onChange={() => handlePreferenceChange('marketing')}
                    className="h-4 w-4 rounded border-border bg-background-tertiary text-primary focus:ring-accent cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="cookie-marketing" className="text-sm font-medium text-foreground cursor-pointer">
                    {t('preferences.marketing')}
                  </label>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {t('preferences.marketingDescription')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={handleDeclineAll}>
                {t('decline')}
              </Button>
              <Button variant="primary" size="sm" onClick={handleSavePreferences}>
                {t('save')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook to get current cookie preferences
 */
export function useCookiePreferences(): CookiePreferences {
  // Use useSyncExternalStore for SSR-safe localStorage access
  const preferences = useSyncExternalStore(
    subscribeToStorage,
    getStoredPreferences,
    () => DEFAULT_PREFERENCES // Server snapshot
  );

  return preferences;
}

export default CookieBanner;
