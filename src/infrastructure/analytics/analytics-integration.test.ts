/**
 * Analytics Integration Verification Tests
 * Task 18.3: Verify analytics integration
 * Validates: Requirements 11.1, 11.2
 *
 * This test suite verifies that:
 * 1. Vercel Analytics is installed and configured
 * 2. Speed Insights is installed and configured
 * 3. Core Web Vitals are being tracked
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Analytics Integration Verification (Task 18.3)', () => {
  describe('Vercel Analytics Installation', () => {
    it('should have @vercel/analytics installed in package.json', () => {
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.dependencies).toHaveProperty('@vercel/analytics');
      expect(packageJson.dependencies['@vercel/analytics']).toBeTruthy();
    });

    it('should have LazyAnalytics component', () => {
      const lazyAnalyticsPath = join(
        process.cwd(),
        'src/components/analytics/LazyAnalytics.tsx'
      );
      expect(existsSync(lazyAnalyticsPath)).toBe(true);

      const content = readFileSync(lazyAnalyticsPath, 'utf-8');
      expect(content).toContain('@vercel/analytics');
      expect(content).toContain('Analytics');
      expect(content).toContain('dynamic');
    });

    it('should use LazyAnalytics in root layout', () => {
      const layoutPath = join(process.cwd(), 'src/app/layout.tsx');
      expect(existsSync(layoutPath)).toBe(true);

      const content = readFileSync(layoutPath, 'utf-8');
      expect(content).toContain('LazyAnalytics');
      expect(content).toContain('<LazyAnalytics />');
    });
  });

  describe('Speed Insights Installation', () => {
    it('should have @vercel/speed-insights installed in package.json', () => {
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.dependencies).toHaveProperty('@vercel/speed-insights');
      expect(packageJson.dependencies['@vercel/speed-insights']).toBeTruthy();
    });

    it('should have LazySpeedInsights component', () => {
      const lazySpeedInsightsPath = join(
        process.cwd(),
        'src/components/analytics/LazySpeedInsights.tsx'
      );
      expect(existsSync(lazySpeedInsightsPath)).toBe(true);

      const content = readFileSync(lazySpeedInsightsPath, 'utf-8');
      expect(content).toContain('@vercel/speed-insights');
      expect(content).toContain('SpeedInsights');
      expect(content).toContain('dynamic');
    });

    it('should use LazySpeedInsights in root layout', () => {
      const layoutPath = join(process.cwd(), 'src/app/layout.tsx');
      expect(existsSync(layoutPath)).toBe(true);

      const content = readFileSync(layoutPath, 'utf-8');
      expect(content).toContain('LazySpeedInsights');
      expect(content).toContain('<LazySpeedInsights />');
    });
  });

  describe('Core Web Vitals Tracking', () => {
    it('should have web-vitals installed in package.json', () => {
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.dependencies).toHaveProperty('web-vitals');
      expect(packageJson.dependencies['web-vitals']).toBeTruthy();
    });

    it('should have WebVitalsService implementation', () => {
      const webVitalsServicePath = join(
        process.cwd(),
        'src/infrastructure/analytics/WebVitalsService.ts'
      );
      expect(existsSync(webVitalsServicePath)).toBe(true);

      const content = readFileSync(webVitalsServicePath, 'utf-8');
      
      // Verify Core Web Vitals are tracked
      expect(content).toContain('onCLS'); // Cumulative Layout Shift
      expect(content).toContain('onFCP'); // First Contentful Paint
      expect(content).toContain('onINP'); // Interaction to Next Paint
      expect(content).toContain('onLCP'); // Largest Contentful Paint
      expect(content).toContain('onTTFB'); // Time to First Byte
      
      // Verify thresholds are defined
      expect(content).toContain('WEB_VITALS_THRESHOLDS');
      expect(content).toContain('initWebVitals');
    });

    it('should have correct Web Vitals thresholds', () => {
      const webVitalsServicePath = join(
        process.cwd(),
        'src/infrastructure/analytics/WebVitalsService.ts'
      );
      const content = readFileSync(webVitalsServicePath, 'utf-8');

      // Verify performance targets from requirements
      expect(content).toContain('2500'); // LCP target: 2.5s
      expect(content).toContain('800'); // TTFB target: 800ms
      expect(content).toContain('200'); // INP target: 200ms
      expect(content).toContain('0.1'); // CLS target: 0.1
    });

    it('should initialize Web Vitals in AnalyticsProvider', () => {
      const analyticsProviderPath = join(
        process.cwd(),
        'src/components/providers/AnalyticsProvider.tsx'
      );
      expect(existsSync(analyticsProviderPath)).toBe(true);

      const content = readFileSync(analyticsProviderPath, 'utf-8');
      expect(content).toContain('initWebVitals');
      expect(content).toContain('useEffect');
    });
  });

  describe('Analytics Configuration', () => {
    it('should defer analytics loading (lazy loading)', () => {
      const lazyAnalyticsPath = join(
        process.cwd(),
        'src/components/analytics/LazyAnalytics.tsx'
      );
      const content = readFileSync(lazyAnalyticsPath, 'utf-8');

      // Verify lazy loading with delay
      expect(content).toContain('setTimeout');
      expect(content).toContain('3000'); // 3 second delay
      expect(content).toContain('ssr: false');
    });

    it('should defer Speed Insights loading (lazy loading)', () => {
      const lazySpeedInsightsPath = join(
        process.cwd(),
        'src/components/analytics/LazySpeedInsights.tsx'
      );
      const content = readFileSync(lazySpeedInsightsPath, 'utf-8');

      // Verify lazy loading with delay
      expect(content).toContain('setTimeout');
      expect(content).toContain('3000'); // 3 second delay
      expect(content).toContain('ssr: false');
    });

    it('should have Google Analytics configured in layout', () => {
      const layoutPath = join(process.cwd(), 'src/app/layout.tsx');
      const content = readFileSync(layoutPath, 'utf-8');

      // Verify GA4 is configured
      expect(content).toContain('googletagmanager.com/gtag/js');
      expect(content).toContain('G-'); // GA4 measurement ID format
      expect(content).toContain('gtag');
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should export Web Vitals utilities from analytics module', () => {
      const analyticsIndexPath = join(
        process.cwd(),
        'src/infrastructure/analytics/index.ts'
      );
      
      if (existsSync(analyticsIndexPath)) {
        const content = readFileSync(analyticsIndexPath, 'utf-8');
        expect(content).toContain('WebVitals');
      }
    });

    it('should have analytics service with conversion tracking', () => {
      const analyticsServicePath = join(
        process.cwd(),
        'src/infrastructure/analytics/AnalyticsService.ts'
      );
      expect(existsSync(analyticsServicePath)).toBe(true);

      const content = readFileSync(analyticsServicePath, 'utf-8');
      expect(content).toContain('trackPageView');
      expect(content).toContain('trackConversion');
    });
  });

  describe('Bundle Analysis Configuration', () => {
    it('should have @next/bundle-analyzer installed', () => {
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.devDependencies).toHaveProperty('@next/bundle-analyzer');
    });

    it('should have bundle analysis scripts in package.json', () => {
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.scripts).toHaveProperty('analyze');
      expect(packageJson.scripts.analyze).toContain('ANALYZE=true');
    });

    it('should configure bundle analyzer in next.config.ts', () => {
      const nextConfigPath = join(process.cwd(), 'next.config.ts');
      expect(existsSync(nextConfigPath)).toBe(true);

      const content = readFileSync(nextConfigPath, 'utf-8');
      expect(content).toContain('@next/bundle-analyzer');
      expect(content).toContain('withBundleAnalyzer');
    });
  });

  describe('Lighthouse CI Configuration', () => {
    it('should have Lighthouse CI configured with performance budgets', () => {
      const lighthousercPath = join(process.cwd(), 'lighthouserc.js');
      expect(existsSync(lighthousercPath)).toBe(true);

      const content = readFileSync(lighthousercPath, 'utf-8');
      
      // Verify performance budgets are set (Requirements 11.4)
      expect(content).toContain('2500'); // FCP budget
      expect(content).toContain('2500'); // LCP budget
      expect(content).toContain('budgets'); // Budget configuration
      expect(content).toContain('resourceSizes'); // Resource size budgets
    });

    it('should have lighthouse:ci script in package.json', () => {
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.scripts).toHaveProperty('lighthouse:ci');
      expect(packageJson.scripts['lighthouse:ci']).toContain('lhci');
    });

    it('should have @lhci/cli installed', () => {
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.devDependencies).toHaveProperty('@lhci/cli');
    });
  });
});
