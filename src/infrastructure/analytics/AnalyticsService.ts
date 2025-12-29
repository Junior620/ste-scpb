/**
 * Analytics Service Interface and Implementation
 * Supports Google Analytics 4 with consent management
 * Validates: Requirements 15.1, 15.2, 15.5
 */

// Conversion event types for tracking
export type ConversionEventType =
  | 'quote_request'
  | 'contact_submission'
  | 'newsletter_signup'
  | 'product_view'
  | 'page_view';

export interface ConversionEventData {
  event_type: ConversionEventType;
  event_category?: string;
  event_label?: string;
  value?: number;
  currency?: string;
  // Additional custom parameters
  [key: string]: string | number | boolean | undefined;
}

export interface AnalyticsService {
  /**
   * Initialize analytics with consent status
   */
  initialize(hasConsent: boolean): void;

  /**
   * Update consent status
   */
  updateConsent(hasConsent: boolean): void;

  /**
   * Track a page view
   */
  trackPageView(path: string, title?: string): void;

  /**
   * Track a conversion event
   */
  trackConversion(event: ConversionEventData): void;

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean;
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'consent' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Google Analytics 4 Implementation
 * Feature: ste-scpb-refonte, Property 18: Analytics Consent Respect
 * Validates: Requirements 15.1, 15.2, 15.5
 */
export class GA4AnalyticsService implements AnalyticsService {
  private measurementId: string;
  private enabled: boolean = false;
  private initialized: boolean = false;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
  }

  /**
   * Initialize GA4 with consent status
   * Only loads the script if consent is given
   */
  initialize(hasConsent: boolean): void {
    if (this.initialized) {
      this.updateConsent(hasConsent);
      return;
    }

    if (typeof window === 'undefined') return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    // Define gtag function
    window.gtag = function gtag(...args: Parameters<NonNullable<typeof window.gtag>>) {
      window.dataLayer?.push(args);
    };

    // Set default consent state (denied until user consents)
    window.gtag('consent', 'default', {
      analytics_storage: hasConsent ? 'granted' : 'denied',
      ad_storage: 'denied', // We don't use ads
    });

    // Load GA4 script only if consent is given
    if (hasConsent && this.measurementId) {
      this.loadScript();
      this.enabled = true;
    }

    this.initialized = true;
  }

  /**
   * Load the GA4 script dynamically
   */
  private loadScript(): void {
    if (typeof window === 'undefined') return;
    if (document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag with measurement ID
    window.gtag?.('js', new Date());
    window.gtag?.('config', this.measurementId, {
      send_page_view: false, // We'll handle page views manually
      anonymize_ip: true, // GDPR compliance
    });
  }

  /**
   * Update consent status
   * Validates: Requirements 15.5
   */
  updateConsent(hasConsent: boolean): void {
    if (typeof window === 'undefined') return;

    // Update consent state
    window.gtag?.('consent', 'update', {
      analytics_storage: hasConsent ? 'granted' : 'denied',
    });

    // Load script if consent is now given and wasn't before
    if (hasConsent && !this.enabled && this.measurementId) {
      this.loadScript();
    }

    this.enabled = hasConsent;
  }

  /**
   * Track a page view
   */
  trackPageView(path: string, title?: string): void {
    if (!this.enabled || typeof window === 'undefined') return;

    window.gtag?.('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  }

  /**
   * Track a conversion event
   * Validates: Requirements 15.2
   */
  trackConversion(event: ConversionEventData): void {
    if (!this.enabled || typeof window === 'undefined') return;

    const { event_type, event_category, event_label, value, currency, ...customParams } = event;

    // Map our event types to GA4 event names
    const ga4EventName = this.mapEventType(event_type);

    window.gtag?.('event', ga4EventName, {
      event_category: event_category || event_type,
      event_label,
      value,
      currency,
      ...customParams,
    });
  }

  /**
   * Map internal event types to GA4 recommended event names
   */
  private mapEventType(eventType: ConversionEventType): string {
    const eventMap: Record<ConversionEventType, string> = {
      quote_request: 'generate_lead',
      contact_submission: 'contact',
      newsletter_signup: 'sign_up',
      product_view: 'view_item',
      page_view: 'page_view',
    };

    return eventMap[eventType] || eventType;
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

/**
 * No-op Analytics Service for when analytics is disabled
 */
export class NoOpAnalyticsService implements AnalyticsService {
  initialize(_hasConsent: boolean): void {}
  updateConsent(_hasConsent: boolean): void {}
  trackPageView(_path: string, _title?: string): void {}
  trackConversion(_event: ConversionEventData): void {}
  isEnabled(): boolean {
    return false;
  }
}

/**
 * Create analytics service based on environment
 */
export function createAnalyticsService(): AnalyticsService {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('GA4 Measurement ID not configured, analytics disabled');
    return new NoOpAnalyticsService();
  }

  return new GA4AnalyticsService(measurementId);
}

// Singleton instance
let analyticsInstance: AnalyticsService | null = null;

/**
 * Get the analytics service singleton
 */
export function getAnalyticsService(): AnalyticsService {
  if (!analyticsInstance) {
    analyticsInstance = createAnalyticsService();
  }
  return analyticsInstance;
}
