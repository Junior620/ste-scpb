/**
 * Lighthouse CI Configuration
 * Validates: Requirements 9.2, 9.3, 3.6 (Scroll Animation Performance), 11.4 (Performance Budgets)
 * 
 * Performance targets (Requirements 11.4):
 * - FCP budget: 2500ms
 * - LCP budget: 2500ms
 * - TTFB budget: 800ms (monitored via server-timing header, not directly in Lighthouse)
 * - Bundle size budget: 1MB total JavaScript
 * - Desktop: >= 80
 * - Mobile: >= 70
 * 
 * Scroll Animation Impact (Requirements 3.6):
 * - LCP should not be negatively impacted by scroll animations
 * - CLS should remain at 0 (animations use transform/opacity only)
 * - ScrollReveal uses GPU-accelerated properties to avoid layout shifts
 * 
 * Note: TTFB (Time to First Byte) is best monitored through:
 * - Server-Timing headers in production
 * - Vercel Analytics Real Experience Score
 * - Chrome DevTools Network tab
 * Lighthouse measures server response time indirectly through FCP and LCP metrics.
 */

module.exports = {
  ci: {
    collect: {
      // URLs to audit - includes pages with ScrollReveal animations
      url: [
        'http://localhost:3000/',           // Homepage with ProductsPreview, CTASection, CertificationsSection
        'http://localhost:3000/fr',         // French homepage
        'http://localhost:3000/en',         // English homepage
        'http://localhost:3000/fr/produits', // Products page with animated cards
        'http://localhost:3000/fr/contact',  // Contact page
        'http://localhost:3000/fr/statistiques', // Statistics page with ScrollReveal
        'http://localhost:3000/fr/a-propos', // About page with AboutHero values
      ],
      // Number of runs per URL
      numberOfRuns: 3,
      // Start server command
      startServerCommand: 'npm run start',
      // Wait for server to be ready
      startServerReadyPattern: 'Ready',
      startServerReadyTimeout: 30000,
      // Chrome flags for headless mode
      settings: {
        chromeFlags: '--headless --no-sandbox --disable-gpu',
      },
    },
    assert: {
      // Performance assertions
      assertions: {
        // Desktop performance >= 80
        'categories:performance': ['warn', { minScore: 0.8 }],
        // Accessibility >= 90
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        // Best practices >= 90
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        // SEO >= 90
        'categories:seo': ['warn', { minScore: 0.9 }],
        
        // Core Web Vitals - Performance Optimization Requirements (Req 11.4)
        // FCP budget: 2500ms (Requirements 11.4)
        'first-contentful-paint': ['error', { maxNumericValue: 2500 }],
        // LCP budget: 2500ms (Requirements 11.4)
        // ScrollReveal animations should not delay largest content
        // Animations complete within 1.5s (delay + duration < 1500ms)
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        // CLS: ScrollReveal uses only transform/opacity (GPU-accelerated)
        // No layout-affecting properties = no layout shift
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Performance budgets (Requirements 11.4)
        // Bundle size budget: 1MB total
        'resource-summary:script:size': ['error', { maxNumericValue: 1048576 }], // 1MB in bytes
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 102400 }], // 100KB
        'resource-summary:image:size': ['warn', { maxNumericValue: 524288 }], // 500KB
        'resource-summary:total:size': ['error', { maxNumericValue: 2097152 }], // 2MB total
      },
      // Budget assertions for resource counts
      budgets: [
        {
          path: '/*',
          resourceSizes: [
            {
              resourceType: 'script',
              budget: 1024, // 1MB in KB
            },
            {
              resourceType: 'stylesheet',
              budget: 100, // 100KB
            },
            {
              resourceType: 'image',
              budget: 512, // 512KB
            },
            {
              resourceType: 'total',
              budget: 2048, // 2MB in KB
            },
          ],
          resourceCounts: [
            {
              resourceType: 'script',
              budget: 20,
            },
            {
              resourceType: 'stylesheet',
              budget: 5,
            },
            {
              resourceType: 'third-party',
              budget: 10,
            },
          ],
          timings: [
            {
              metric: 'first-contentful-paint',
              budget: 2500, // 2.5s (Requirements 11.4)
            },
            {
              metric: 'largest-contentful-paint',
              budget: 2500, // 2.5s (Requirements 11.4)
            },
            {
              metric: 'interactive',
              budget: 3500, // 3.5s
            },
          ],
        },
      ],
    },
    upload: {
      // Upload to temporary public storage (for CI)
      target: 'temporary-public-storage',
    },
  },
};
