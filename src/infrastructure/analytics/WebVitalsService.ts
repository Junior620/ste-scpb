/**
 * Web Vitals Monitoring Service
 * Integrates Core Web Vitals monitoring with analytics
 * Validates: Requirements 15.3
 */

import type { Metric } from 'web-vitals';
import { getAnalyticsService } from './AnalyticsService';

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

/**
 * Thresholds for Core Web Vitals ratings
 * Based on Google's recommendations
 */
export const WEB_VITALS_THRESHOLDS = {
  // Largest Contentful Paint (LCP)
  LCP: {
    good: 2500, // <= 2.5s
    poor: 4000, // > 4s
  },
  // First Input Delay (FID) - deprecated, replaced by INP
  FID: {
    good: 100, // <= 100ms
    poor: 300, // > 300ms
  },
  // Cumulative Layout Shift (CLS)
  CLS: {
    good: 0.1, // <= 0.1
    poor: 0.25, // > 0.25
  },
  // Interaction to Next Paint (INP) - replaces FID
  INP: {
    good: 200, // <= 200ms
    poor: 500, // > 500ms
  },
  // First Contentful Paint (FCP)
  FCP: {
    good: 1800, // <= 1.8s
    poor: 3000, // > 3s
  },
  // Time to First Byte (TTFB)
  TTFB: {
    good: 800, // <= 800ms
    poor: 1800, // > 1.8s
  },
};

/**
 * Get rating for a metric value
 */
export function getMetricRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[name as keyof typeof WEB_VITALS_THRESHOLDS];
  if (!thresholds) return 'needs-improvement';

  if (value <= thresholds.good) return 'good';
  if (value > thresholds.poor) return 'poor';
  return 'needs-improvement';
}

/**
 * Report Web Vitals metric to analytics
 */
function reportWebVital(metric: Metric): void {
  const analyticsService = getAnalyticsService();

  // Only report if analytics is enabled (respects consent)
  if (!analyticsService.isEnabled()) {
    return;
  }

  const rating = getMetricRating(metric.name, metric.value);

  // Send to GA4 as a custom event
  analyticsService.trackConversion({
    event_type: 'page_view', // Using page_view as base, GA4 will categorize
    event_category: 'Web Vitals',
    event_label: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    // Custom parameters
    metric_name: metric.name,
    metric_value: metric.value,
    metric_rating: rating,
    metric_delta: metric.delta,
    metric_id: metric.id,
    navigation_type: metric.navigationType,
  });

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value} (${rating})`);
  }
}

/**
 * Initialize Web Vitals monitoring
 * Dynamically imports web-vitals to avoid SSR issues
 */
export async function initWebVitals(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import('web-vitals');

    // Register handlers for all Core Web Vitals
    onCLS(reportWebVital);
    onFCP(reportWebVital);
    onINP(reportWebVital);
    onLCP(reportWebVital);
    onTTFB(reportWebVital);

    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals] Monitoring initialized');
    }
  } catch (error) {
    console.error('[Web Vitals] Failed to initialize:', error);
  }
}

/**
 * Get current performance metrics (for debugging/display)
 */
export function getPerformanceMetrics(): Record<string, number> | null {
  if (typeof window === 'undefined' || !window.performance) return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!navigation) return null;

  return {
    // Navigation timing
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domInteractive: navigation.domInteractive - navigation.fetchStart,
    domComplete: navigation.domComplete - navigation.fetchStart,
    loadComplete: navigation.loadEventEnd - navigation.fetchStart,
  };
}

export default {
  initWebVitals,
  getMetricRating,
  getPerformanceMetrics,
  WEB_VITALS_THRESHOLDS,
};
