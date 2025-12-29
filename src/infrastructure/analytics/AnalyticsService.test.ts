/**
 * Property-Based Tests for Analytics Consent Respect
 * Feature: ste-scpb-refonte, Property 18: Analytics Consent Respect
 * Validates: Requirements 15.5
 *
 * Property 18: Analytics Consent Respect
 * *For any* user who has declined analytics cookies, no analytics tracking
 * scripts should execute and no tracking events should be sent.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  GA4AnalyticsService,
  NoOpAnalyticsService,
  type ConversionEventData,
  type ConversionEventType,
} from './AnalyticsService';

// Mock window and document for testing
const createMockWindow = () => {
  const dataLayer: unknown[][] = [];

  return {
    dataLayer,
    gtag: undefined as unknown,
    document: {
      head: {
        appendChild: vi.fn(),
      },
      querySelector: vi.fn(() => null),
      createElement: vi.fn(() => ({
        async: false,
        src: '',
        onload: null as (() => void) | null,
      })),
    },
    // Helper to get events from dataLayer
    getEvents: () => {
      return dataLayer.filter(
        (entry) => Array.isArray(entry) && entry[0] === 'event'
      );
    },
  };
};

// Arbitrary generators for test data
const eventTypeArb = fc.constantFrom<ConversionEventType>(
  'quote_request',
  'contact_submission',
  'newsletter_signup',
  'product_view',
  'page_view'
);

const conversionEventArb: fc.Arbitrary<ConversionEventData> = fc.record({
  event_type: eventTypeArb,
  event_category: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  event_label: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  value: fc.option(fc.integer({ min: 0, max: 10000 }), { nil: undefined }),
});

const pathArb = fc.stringMatching(/^\/[a-z0-9\-\/]*$/);
const titleArb = fc.string({ minLength: 1, maxLength: 100 });
const measurementIdArb = fc.stringMatching(/^G-[A-Z0-9]{10}$/);

describe('Analytics Consent Respect - Property 18', () => {
  let originalWindow: typeof globalThis.window;
  let originalDocument: typeof globalThis.document;

  beforeEach(() => {
    originalWindow = globalThis.window;
    originalDocument = globalThis.document;
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  });

  /**
   * Property 18: Analytics Consent Respect
   * *For any* user who has declined analytics cookies, no analytics tracking
   * scripts should execute and no tracking events should be sent.
   * Validates: Requirements 15.5
   */
  describe('Property: When consent is denied, no tracking occurs', () => {
    it('should not track page views when consent is denied', () => {
      fc.assert(
        fc.property(
          measurementIdArb,
          pathArb,
          titleArb,
          (measurementId, path, title) => {
            const mockWindow = createMockWindow();
            // @ts-expect-error - mocking window for testing
            globalThis.window = mockWindow;
            // @ts-expect-error - mocking document for testing
            globalThis.document = mockWindow.document;

            const service = new GA4AnalyticsService(measurementId);

            // Initialize with consent DENIED
            service.initialize(false);

            // Clear any initialization entries
            mockWindow.dataLayer.length = 0;

            // Attempt to track page view
            service.trackPageView(path, title);

            // Verify no page_view events were sent
            const events = mockWindow.getEvents();
            expect(events).toHaveLength(0);
            expect(service.isEnabled()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not track conversion events when consent is denied', () => {
      fc.assert(
        fc.property(
          measurementIdArb,
          conversionEventArb,
          (measurementId, event) => {
            const mockWindow = createMockWindow();
            // @ts-expect-error - mocking window for testing
            globalThis.window = mockWindow;
            // @ts-expect-error - mocking document for testing
            globalThis.document = mockWindow.document;

            const service = new GA4AnalyticsService(measurementId);

            // Initialize with consent DENIED
            service.initialize(false);

            // Clear any initialization entries
            mockWindow.dataLayer.length = 0;

            // Attempt to track conversion
            service.trackConversion(event);

            // Verify no conversion events were sent
            const events = mockWindow.getEvents();
            expect(events).toHaveLength(0);
            expect(service.isEnabled()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should stop tracking when consent is revoked after being granted', () => {
      fc.assert(
        fc.property(
          measurementIdArb,
          pathArb,
          conversionEventArb,
          (measurementId, path, event) => {
            const mockWindow = createMockWindow();
            // @ts-expect-error - mocking window for testing
            globalThis.window = mockWindow;
            // @ts-expect-error - mocking document for testing
            globalThis.document = mockWindow.document;

            const service = new GA4AnalyticsService(measurementId);

            // Initialize with consent GRANTED
            service.initialize(true);
            expect(service.isEnabled()).toBe(true);

            // Revoke consent
            service.updateConsent(false);
            expect(service.isEnabled()).toBe(false);

            // Clear any previous entries
            mockWindow.dataLayer.length = 0;

            // Attempt to track after consent revoked
            service.trackPageView(path);
            service.trackConversion(event);

            // Verify no tracking events were sent after consent revoked
            const events = mockWindow.getEvents();
            expect(events).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: When consent is granted, tracking works correctly', () => {
    it('should track page views when consent is granted', () => {
      fc.assert(
        fc.property(
          measurementIdArb,
          pathArb,
          titleArb,
          (measurementId, path, title) => {
            const mockWindow = createMockWindow();
            // @ts-expect-error - mocking window for testing
            globalThis.window = mockWindow;
            // @ts-expect-error - mocking document for testing
            globalThis.document = mockWindow.document;

            const service = new GA4AnalyticsService(measurementId);

            // Initialize with consent GRANTED
            service.initialize(true);

            // Clear initialization entries
            mockWindow.dataLayer.length = 0;

            // Track page view
            service.trackPageView(path, title);

            // Verify page_view event was sent to dataLayer
            const events = mockWindow.getEvents();
            expect(events.length).toBeGreaterThanOrEqual(1);

            // Find the page_view event
            const pageViewEvent = events.find(
              (e) => e[1] === 'page_view'
            );
            expect(pageViewEvent).toBeDefined();
            expect(pageViewEvent?.[2]).toMatchObject({
              page_path: path,
              page_title: title,
            });
            expect(service.isEnabled()).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should track conversion events when consent is granted', () => {
      fc.assert(
        fc.property(
          measurementIdArb,
          conversionEventArb,
          (measurementId, event) => {
            const mockWindow = createMockWindow();
            // @ts-expect-error - mocking window for testing
            globalThis.window = mockWindow;
            // @ts-expect-error - mocking document for testing
            globalThis.document = mockWindow.document;

            const service = new GA4AnalyticsService(measurementId);

            // Initialize with consent GRANTED
            service.initialize(true);

            // Clear initialization entries
            mockWindow.dataLayer.length = 0;

            // Track conversion
            service.trackConversion(event);

            // Verify conversion event was sent to dataLayer
            const events = mockWindow.getEvents();
            expect(events.length).toBeGreaterThanOrEqual(1);
            expect(service.isEnabled()).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: NoOpAnalyticsService never tracks', () => {
    it('should never track regardless of any input', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          pathArb,
          titleArb,
          conversionEventArb,
          (consent, path, title, event) => {
            const service = new NoOpAnalyticsService();

            // Initialize with any consent value
            service.initialize(consent);

            // All tracking methods should be no-ops
            service.trackPageView(path, title);
            service.trackConversion(event);
            service.updateConsent(!consent);

            // Should always report as disabled
            expect(service.isEnabled()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Consent state transitions are consistent', () => {
    it('should correctly reflect consent state after any sequence of updates', () => {
      fc.assert(
        fc.property(
          measurementIdArb,
          fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }),
          (measurementId, consentSequence) => {
            const mockWindow = createMockWindow();
            // @ts-expect-error - mocking window for testing
            globalThis.window = mockWindow;
            // @ts-expect-error - mocking document for testing
            globalThis.document = mockWindow.document;

            const service = new GA4AnalyticsService(measurementId);

            // Initialize with first consent value
            service.initialize(consentSequence[0]);

            // Apply all consent updates
            for (let i = 1; i < consentSequence.length; i++) {
              service.updateConsent(consentSequence[i]);
            }

            // Final state should match last consent value
            const finalConsent = consentSequence[consentSequence.length - 1];
            expect(service.isEnabled()).toBe(finalConsent);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
