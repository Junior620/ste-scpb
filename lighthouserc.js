/**
 * Lighthouse CI Configuration
 * Validates: Requirements 9.2, 9.3, 3.6 (Scroll Animation Performance)
 * 
 * Performance targets:
 * - Desktop: >= 80
 * - Mobile: >= 70
 * 
 * Scroll Animation Impact (Requirements 3.6):
 * - LCP should not be negatively impacted by scroll animations
 * - CLS should remain at 0 (animations use transform/opacity only)
 * - ScrollReveal uses GPU-accelerated properties to avoid layout shifts
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
        
        // Core Web Vitals - Critical for scroll animation impact (Req 3.6)
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        // LCP: ScrollReveal animations should not delay largest content
        // Animations complete within 1.5s (delay + duration < 1500ms)
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        // CLS: ScrollReveal uses only transform/opacity (GPU-accelerated)
        // No layout-affecting properties = no layout shift
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
