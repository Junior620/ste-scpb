'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getAnalyticsService, initWebVitals } from '@/infrastructure/analytics';
import { useCookiePreferences } from '@/components/ui/CookieBanner';

/**
 * AnalyticsProvider Component
 * Initializes analytics, Web Vitals monitoring, and handles consent changes
 * Feature: ste-scpb-refonte, Property 18: Analytics Consent Respect
 * Validates: Requirements 15.1, 15.3, 15.5
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const preferences = useCookiePreferences();
  const initializedRef = useRef(false);
  const webVitalsInitializedRef = useRef(false);
  const analyticsService = getAnalyticsService();

  // Initialize analytics with consent status
  useEffect(() => {
    if (!initializedRef.current) {
      analyticsService.initialize(preferences.analytics);
      initializedRef.current = true;
    } else {
      // Update consent when preferences change
      analyticsService.updateConsent(preferences.analytics);
    }
  }, [preferences.analytics, analyticsService]);

  // Initialize Web Vitals monitoring (Validates: Requirements 15.3)
  useEffect(() => {
    if (!webVitalsInitializedRef.current && preferences.analytics) {
      initWebVitals();
      webVitalsInitializedRef.current = true;
    }
  }, [preferences.analytics]);

  // Track page views on route change
  useEffect(() => {
    if (preferences.analytics && pathname) {
      // Small delay to ensure page title is updated
      const timeoutId = setTimeout(() => {
        analyticsService.trackPageView(pathname, document.title);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [pathname, preferences.analytics, analyticsService]);

  return <>{children}</>;
}

export default AnalyticsProvider;
