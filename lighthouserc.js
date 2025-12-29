/**
 * Lighthouse CI Configuration
 * Validates: Requirements 9.2, 9.3
 * 
 * Performance targets:
 * - Desktop: >= 80
 * - Mobile: >= 70
 */

module.exports = {
  ci: {
    collect: {
      // URLs to audit
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/fr',
        'http://localhost:3000/en',
        'http://localhost:3000/fr/produits',
        'http://localhost:3000/fr/contact',
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
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
    upload: {
      // Upload to temporary public storage (for CI)
      target: 'temporary-public-storage',
    },
  },
};
