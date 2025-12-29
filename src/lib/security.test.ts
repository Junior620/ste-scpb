import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  REQUIRED_SECURITY_HEADERS,
  REQUIRED_CSP_DIRECTIVES,
  isHttps,
  isLocalhost,
  validateHttpsEnforcement,
  parseCSPHeader,
  validateCSPDirectives,
  validateSecurityHeaders,
} from './security';
import { SECURITY_HEADERS, buildCSPHeader } from './security-headers';

/**
 * Property-Based Tests for Security Implementation
 * **Feature: ste-scpb-refonte, Property 12: Security Headers Presence**
 * **Validates: Requirements 14.5**
 */
describe('Security Headers - Property Tests', () => {
  // ==========================================================================
  // Property 12: Security Headers Presence
  // ==========================================================================

  describe('Property 12: Security Headers Presence', () => {
    /**
     * Property: All required security headers are defined in the middleware
     * For any required security header, it must be present in SECURITY_HEADERS or CSP
     */
    it('should have all required security headers defined', () => {
      const cspHeader = buildCSPHeader();
      const headersWithCSP = {
        ...SECURITY_HEADERS,
        'Content-Security-Policy': cspHeader,
      };

      // Check each required header is present
      for (const requiredHeader of REQUIRED_SECURITY_HEADERS) {
        if (requiredHeader === 'Content-Security-Policy') {
          // CSP is built separately
          expect(cspHeader).toBeDefined();
          expect(cspHeader.length).toBeGreaterThan(0);
        } else {
          expect(headersWithCSP[requiredHeader]).toBeDefined();
        }
      }
    });

    /**
     * Property: X-Frame-Options header prevents clickjacking
     * The value must be DENY or SAMEORIGIN
     */
    it('should have X-Frame-Options set to DENY', () => {
      expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY');
    });

    /**
     * Property: X-Content-Type-Options prevents MIME sniffing
     * The value must be nosniff
     */
    it('should have X-Content-Type-Options set to nosniff', () => {
      expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
    });

    /**
     * Property: Referrer-Policy controls referrer information
     * Must be a valid policy value
     */
    it('should have valid Referrer-Policy', () => {
      const validPolicies = [
        'no-referrer',
        'no-referrer-when-downgrade',
        'origin',
        'origin-when-cross-origin',
        'same-origin',
        'strict-origin',
        'strict-origin-when-cross-origin',
        'unsafe-url',
      ];
      expect(validPolicies).toContain(SECURITY_HEADERS['Referrer-Policy']);
    });

    /**
     * Property: Strict-Transport-Security enforces HTTPS
     * Must have max-age directive
     */
    it('should have valid Strict-Transport-Security header', () => {
      const hsts = SECURITY_HEADERS['Strict-Transport-Security'];
      expect(hsts).toMatch(/max-age=\d+/);
    });

    /**
     * Property: Permissions-Policy restricts browser features
     * Must disable camera and microphone at minimum
     */
    it('should have Permissions-Policy that restricts sensitive features', () => {
      const policy = SECURITY_HEADERS['Permissions-Policy'];
      expect(policy).toContain('camera=()');
      expect(policy).toContain('microphone=()');
    });

    /**
     * Property: CSP header contains all required directives
     * For any required CSP directive, it must be present in the CSP header
     */
    it('should have all required CSP directives', () => {
      const cspHeader = buildCSPHeader();
      const { valid, missingDirectives } = validateCSPDirectives(cspHeader);

      expect(missingDirectives).toEqual([]);
      expect(valid).toBe(true);
    });

    /**
     * Property: CSP default-src is restrictive
     * default-src should be 'self' to prevent loading from external sources by default
     */
    it('should have restrictive default-src in CSP', () => {
      const cspHeader = buildCSPHeader();
      const directives = parseCSPHeader(cspHeader);

      expect(directives.has('default-src')).toBe(true);
      expect(directives.get('default-src')).toContain("'self'");
    });

    /**
     * Property: CSP object-src is none
     * object-src should be 'none' to prevent plugin-based attacks
     */
    it('should have object-src none in CSP', () => {
      const cspHeader = buildCSPHeader();
      const directives = parseCSPHeader(cspHeader);

      expect(directives.has('object-src')).toBe(true);
      expect(directives.get('object-src')).toContain("'none'");
    });

    /**
     * Property: CSP frame-ancestors prevents clickjacking
     * frame-ancestors should be 'none' or 'self'
     */
    it('should have restrictive frame-ancestors in CSP', () => {
      const cspHeader = buildCSPHeader();
      const directives = parseCSPHeader(cspHeader);

      expect(directives.has('frame-ancestors')).toBe(true);
      const frameAncestors = directives.get('frame-ancestors');
      expect(frameAncestors?.some((v) => v === "'none'" || v === "'self'")).toBe(true);
    });

    /**
     * Property: Security headers validation function works correctly
     * For any set of headers that includes all required headers with valid values,
     * validation should pass
     */
    it('should validate complete security headers correctly', () => {
      const cspHeader = buildCSPHeader();
      const completeHeaders = {
        ...SECURITY_HEADERS,
        'Content-Security-Policy': cspHeader,
      };

      const result = validateSecurityHeaders(completeHeaders);
      expect(result.valid).toBe(true);
      expect(result.missingHeaders).toEqual([]);
    });

    /**
     * Property: Security headers validation detects missing headers
     * For any subset of required headers, validation should fail if any are missing
     */
    it('should detect missing security headers', () => {
      fc.assert(
        fc.property(
          fc.subarray([...REQUIRED_SECURITY_HEADERS], { minLength: 0, maxLength: REQUIRED_SECURITY_HEADERS.length - 1 }),
          (includedHeaders) => {
            // Create headers object with only included headers
            const partialHeaders: Record<string, string> = {};
            const cspHeader = buildCSPHeader();

            for (const header of includedHeaders) {
              if (header === 'Content-Security-Policy') {
                partialHeaders[header] = cspHeader;
              } else if (header in SECURITY_HEADERS) {
                partialHeaders[header] = SECURITY_HEADERS[header as keyof typeof SECURITY_HEADERS];
              }
            }

            const result = validateSecurityHeaders(partialHeaders);

            // If not all headers are included, validation should fail
            if (includedHeaders.length < REQUIRED_SECURITY_HEADERS.length) {
              expect(result.missingHeaders.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // ==========================================================================
  // Property 13: HTTPS Enforcement
  // **Feature: ste-scpb-refonte, Property 13: HTTPS Enforcement**
  // **Validates: Requirements 14.1**
  // ==========================================================================

  describe('Property 13: HTTPS Enforcement', () => {
    /**
     * Property: HTTPS URLs are correctly identified
     * For any URL with https:// protocol, isHttps should return true
     */
    it('should correctly identify HTTPS URLs', () => {
      // Generate valid domain names
      const domainArb = fc
        .tuple(
          fc.stringMatching(/^[a-z][a-z0-9-]{0,20}$/),
          fc.stringMatching(/^[a-z]{2,6}$/)
        )
        .map(([name, tld]) => `${name}.${tld}`);

      // Generate valid paths
      const pathArb = fc
        .array(fc.stringMatching(/^[a-z0-9-]+$/), { minLength: 0, maxLength: 3 })
        .map((parts) => (parts.length > 0 ? '/' + parts.join('/') : ''));

      fc.assert(
        fc.property(domainArb, pathArb, (domain, path) => {
          const httpsUrl = `https://${domain}${path}`;
          expect(isHttps(httpsUrl)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: HTTP URLs are correctly identified as non-HTTPS
     * For any URL with http:// protocol, isHttps should return false
     */
    it('should correctly identify HTTP URLs as non-HTTPS', () => {
      const domainArb = fc
        .tuple(
          fc.stringMatching(/^[a-z][a-z0-9-]{0,20}$/),
          fc.stringMatching(/^[a-z]{2,6}$/)
        )
        .map(([name, tld]) => `${name}.${tld}`);

      fc.assert(
        fc.property(domainArb, (domain) => {
          const httpUrl = `http://${domain}`;
          expect(isHttps(httpUrl)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Localhost URLs are correctly identified
     * For any localhost URL (localhost, 127.0.0.1, [::1]), isLocalhost should return true
     */
    it('should correctly identify localhost URLs', () => {
      // Note: IPv6 addresses in URLs must be wrapped in brackets
      const localhostHosts = ['localhost', '127.0.0.1', '[::1]'];
      const portArb = fc.option(fc.integer({ min: 1, max: 65535 }), { nil: undefined });

      fc.assert(
        fc.property(fc.constantFrom(...localhostHosts), portArb, (host, port) => {
          const url = port ? `http://${host}:${port}` : `http://${host}`;
          expect(isLocalhost(url)).toBe(true);
        }),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Non-localhost URLs are correctly identified
     * For any URL that is not localhost, isLocalhost should return false
     */
    it('should correctly identify non-localhost URLs', () => {
      const nonLocalhostDomainArb = fc
        .tuple(
          fc.stringMatching(/^[a-z][a-z0-9-]{0,20}$/),
          fc.stringMatching(/^[a-z]{2,6}$/)
        )
        .filter(([name]) => name !== 'localhost')
        .map(([name, tld]) => `${name}.${tld}`);

      fc.assert(
        fc.property(nonLocalhostDomainArb, (domain) => {
          const url = `https://${domain}`;
          expect(isLocalhost(url)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: HTTPS enforcement validation passes for HTTPS URLs
     * For any non-localhost HTTPS URL, validateHttpsEnforcement should return true
     */
    it('should pass HTTPS enforcement for HTTPS URLs', () => {
      const domainArb = fc
        .tuple(
          fc.stringMatching(/^[a-z][a-z0-9-]{0,20}$/),
          fc.stringMatching(/^[a-z]{2,6}$/)
        )
        .filter(([name]) => name !== 'localhost')
        .map(([name, tld]) => `${name}.${tld}`);

      fc.assert(
        fc.property(domainArb, (domain) => {
          const httpsUrl = `https://${domain}`;
          expect(validateHttpsEnforcement(httpsUrl)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: HTTPS enforcement validation fails for HTTP URLs (non-localhost)
     * For any non-localhost HTTP URL, validateHttpsEnforcement should return false
     */
    it('should fail HTTPS enforcement for HTTP URLs on non-localhost', () => {
      const domainArb = fc
        .tuple(
          fc.stringMatching(/^[a-z][a-z0-9-]{0,20}$/),
          fc.stringMatching(/^[a-z]{2,6}$/)
        )
        .filter(([name]) => name !== 'localhost')
        .map(([name, tld]) => `${name}.${tld}`);

      fc.assert(
        fc.property(domainArb, (domain) => {
          const httpUrl = `http://${domain}`;
          expect(validateHttpsEnforcement(httpUrl)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: HTTPS enforcement validation passes for localhost (exempt)
     * Localhost URLs are exempt from HTTPS requirement
     */
    it('should pass HTTPS enforcement for localhost (exempt)', () => {
      // Note: IPv6 addresses in URLs must be wrapped in brackets
      const localhostUrls = [
        'http://localhost',
        'http://localhost:3000',
        'http://127.0.0.1',
        'http://127.0.0.1:8080',
        'http://[::1]',
        'http://[::1]:3000',
        'https://localhost',
      ];

      for (const url of localhostUrls) {
        expect(validateHttpsEnforcement(url)).toBe(true);
      }
    });

    /**
     * Property: HSTS header is present for HTTPS enforcement
     * Strict-Transport-Security header must be set with appropriate max-age
     */
    it('should have HSTS header for HTTPS enforcement', () => {
      const hsts = SECURITY_HEADERS['Strict-Transport-Security'];
      expect(hsts).toBeDefined();
      expect(hsts).toMatch(/max-age=\d+/);

      // Extract max-age value and verify it's at least 1 year (31536000 seconds)
      const maxAgeMatch = hsts.match(/max-age=(\d+)/);
      expect(maxAgeMatch).not.toBeNull();
      if (maxAgeMatch) {
        const maxAge = parseInt(maxAgeMatch[1], 10);
        expect(maxAge).toBeGreaterThanOrEqual(31536000);
      }
    });
  });

  // ==========================================================================
  // CSP Parsing Tests
  // ==========================================================================

  describe('CSP Parsing', () => {
    /**
     * Property: CSP parsing correctly extracts directives
     * For any valid CSP header, parsing should extract all directives
     */
    it('should correctly parse CSP header directives', () => {
      const cspHeader = buildCSPHeader();
      const directives = parseCSPHeader(cspHeader);

      // Should have multiple directives
      expect(directives.size).toBeGreaterThan(0);

      // Each required directive should be present
      for (const required of REQUIRED_CSP_DIRECTIVES) {
        expect(directives.has(required)).toBe(true);
      }
    });

    /**
     * Property: CSP parsing handles various formats
     * For any CSP header format, parsing should work correctly
     */
    it('should handle various CSP header formats', () => {
      const testCases = [
        "default-src 'self'",
        "default-src 'self'; script-src 'self' 'unsafe-inline'",
        "default-src 'self';script-src 'self'", // No space after semicolon
        "  default-src 'self'  ;  script-src 'self'  ", // Extra spaces
      ];

      for (const csp of testCases) {
        const directives = parseCSPHeader(csp);
        expect(directives.has('default-src')).toBe(true);
      }
    });
  });
});
