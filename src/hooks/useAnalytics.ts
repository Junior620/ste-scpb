'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  getAnalyticsService,
  type ConversionEventData,
  type ConversionEventType,
} from '@/infrastructure/analytics';
import { useCookiePreferences } from '@/components/ui/CookieBanner';

/**
 * Hook for analytics integration with consent management
 * Feature: ste-scpb-refonte, Property 18: Analytics Consent Respect
 * Validates: Requirements 15.1, 15.2, 15.5
 */
export function useAnalytics() {
  const pathname = usePathname();
  const preferences = useCookiePreferences();
  const initializedRef = useRef(false);
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

  // Track page views on route change
  useEffect(() => {
    if (preferences.analytics && pathname) {
      analyticsService.trackPageView(pathname, document.title);
    }
  }, [pathname, preferences.analytics, analyticsService]);

  /**
   * Track a conversion event
   * Only tracks if user has given analytics consent
   */
  const trackConversion = useCallback(
    (eventType: ConversionEventType, data?: Omit<ConversionEventData, 'event_type'>) => {
      if (!preferences.analytics) {
        // Respect user consent - don't track if not consented
        return;
      }

      analyticsService.trackConversion({
        event_type: eventType,
        ...data,
      });
    },
    [preferences.analytics, analyticsService]
  );

  /**
   * Track a quote request conversion
   * Validates: Requirements 15.2
   */
  const trackQuoteRequest = useCallback(
    (productCategories?: string[]) => {
      trackConversion('quote_request', {
        event_category: 'conversion',
        event_label: productCategories?.join(', ') || 'general',
        products: productCategories?.join(', '),
      });
    },
    [trackConversion]
  );

  /**
   * Track a contact form submission
   * Validates: Requirements 15.2
   */
  const trackContactSubmission = useCallback(
    (inquiryType?: string) => {
      trackConversion('contact_submission', {
        event_category: 'conversion',
        event_label: inquiryType || 'general',
        inquiry_type: inquiryType,
      });
    },
    [trackConversion]
  );

  /**
   * Track a newsletter signup
   * Validates: Requirements 15.2
   */
  const trackNewsletterSignup = useCallback(() => {
    trackConversion('newsletter_signup', {
      event_category: 'conversion',
      event_label: 'newsletter',
    });
  }, [trackConversion]);

  /**
   * Track a product view
   */
  const trackProductView = useCallback(
    (productSlug: string, productName?: string, category?: string) => {
      trackConversion('product_view', {
        event_category: 'engagement',
        event_label: productName || productSlug,
        product_slug: productSlug,
        product_category: category,
      });
    },
    [trackConversion]
  );

  return {
    trackConversion,
    trackQuoteRequest,
    trackContactSubmission,
    trackNewsletterSignup,
    trackProductView,
    isEnabled: preferences.analytics,
  };
}

export default useAnalytics;
