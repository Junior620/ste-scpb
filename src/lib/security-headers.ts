/**
 * Security Headers Configuration
 * Separated from middleware for testability
 * Based on Requirements 14.5
 */

/**
 * Standard security headers applied to all responses
 */
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
} as const;

/**
 * CSP Directives Configuration
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-eval'",
    "'unsafe-inline'",
    'https://www.google.com/recaptcha/',
    'https://www.gstatic.com/recaptcha/',
    'https://www.googletagmanager.com',
    'https://plausible.io',
  ],
  'style-src': ["'self'", "'unsafe-inline'", 'https://api.mapbox.com'],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://api.mapbox.com',
    'https://*.mapbox.com',
    'https://*.strapi.io',
    'https://cdn.sanity.io',
  ],
  'font-src': ["'self'", 'data:'],
  'connect-src': [
    "'self'",
    'https://api.mapbox.com',
    'https://*.mapbox.com',
    'https://events.mapbox.com',
    'https://www.google.com/recaptcha/',
    'https://www.google-analytics.com',
    'https://plausible.io',
    'https://*.strapi.io',
    'https://*.sanity.io',
    'https://*.upstash.io',
    'https://*.sentry.io',
    'https://*.ingest.sentry.io',
  ],
  'frame-src': ['https://www.google.com/recaptcha/'],
  'worker-src': ["'self'", 'blob:'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
} as const;

/**
 * Build CSP header string from directives
 */
export function buildCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, values]) => {
      if (values.length === 0) {
        return directive;
      }
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Get the CSP header name based on environment
 * Uses report-only in development, enforced in production
 */
export function getCSPHeaderName(isProduction: boolean): string {
  return isProduction ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only';
}
