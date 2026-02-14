/**
 * Lighthouse CI Configuration for Staging
 * Validates: Requirements 11.1, 11.2, 11.3, 11.4
 * 
 * This configuration is used to validate the staging deployment
 * against performance targets before promoting to production.
 * 
 * Performance targets (Requirements 11.4):
 * - Real Experience Score: >90
 * - FCP budget: 2500ms
 * - LCP budget: 2500ms
 * - TTFB budget: 800ms
 * - Bundle size budget: 1MB total JavaScript
 */

// Read staging URL from file or environment
const fs = require('fs');
let stagingUrl = process.env.STAGING_URL;

if (!stagingUrl && fs.existsSync('.staging-url.txt')) {
  stagingUrl = fs.readFileSync('.staging-url.txt', 'utf8').trim();
}

if (!stagingUrl) {
  console.error('❌ No staging URL found. Set STAGING_URL environment variable or create .staging-url.txt');
  process.exit(1);
}

console.log(`🔍 Testing staging deployment: ${stagingUrl}`);

module.exports = {
  ci: {
    collect: {
      // URLs to audit on staging
      url: [
        `${stagingUrl}/`,
        `${stagingUrl}/fr`,
        `${stagingUrl}/en`,
        `${stagingUrl}/ru`,
        `${stagingUrl}/fr/produits`,
        `${stagingUrl}/fr/actualites`,
        `${stagingUrl}/fr/contact`,
        `${stagingUrl}/fr/a-propos`,
        `${stagingUrl}/fr/equipe`,
        `${stagingUrl}/fr/devis`,
      ],
      // Number of runs per URL for more accurate results
      numberOfRuns: 5,
      // Chrome flags for production-like testing
      settings: {
        chromeFlags: '--headless --no-sandbox --disable-gpu',
        // Throttling to simulate real-world conditions
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        // Screen emulation
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
      },
    },
    assert: {
      // Stricter assertions for staging validation
      assertions: {
        // Performance targets (Requirements 11.4)
        'categories:performance': ['error', { minScore: 0.90 }], // Real Experience Score >90
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.90 }],
        
        // Core Web Vitals - Strict targets (Requirements 11.4)
        'first-contentful-paint': ['error', { maxNumericValue: 2500 }], // <2.5s
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // <2.5s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // ≤0.1
        'total-blocking-time': ['error', { maxNumericValue: 300 }], // <300ms
        'speed-index': ['warn', { maxNumericValue: 3500 }], // <3.5s
        
        // Performance budgets (Requirements 11.4)
        'resource-summary:script:size': ['error', { maxNumericValue: 1048576 }], // 1MB
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 102400 }], // 100KB
        'resource-summary:image:size': ['warn', { maxNumericValue: 524288 }], // 500KB
        'resource-summary:total:size': ['error', { maxNumericValue: 2097152 }], // 2MB
        
        // Best practices
        'uses-http2': 'error',
        'uses-long-cache-ttl': 'warn',
        'uses-optimized-images': 'warn',
        'uses-text-compression': 'error',
        'uses-responsive-images': 'warn',
        'offscreen-images': 'warn',
        'render-blocking-resources': 'warn',
        'unminified-css': 'error',
        'unminified-javascript': 'error',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'modern-image-formats': 'warn',
        'efficient-animated-content': 'warn',
        
        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'meta-viewport': 'error',
        
        // SEO
        'document-title': 'error',
        'meta-description': 'error',
        'link-text': 'error',
        'crawlable-anchors': 'error',
        'robots-txt': 'warn',
        'canonical': 'warn',
      },
      // Budget assertions
      budgets: [
        {
          path: '/*',
          resourceSizes: [
            {
              resourceType: 'script',
              budget: 1024, // 1MB (Requirements 11.4)
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
              budget: 2048, // 2MB
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
            {
              metric: 'max-potential-fid',
              budget: 200, // 200ms
            },
          ],
        },
      ],
    },
    upload: {
      // Upload to temporary public storage
      target: 'temporary-public-storage',
    },
  },
};
