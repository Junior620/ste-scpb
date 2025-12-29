import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getClientIdentifier, isValidIp, RATE_LIMIT_CONFIG } from './UpstashRateLimiter';

/**
 * Creates a mock Request with specified headers
 */
function createMockRequest(headers: Record<string, string>): Request {
  return new Request('https://example.com', {
    headers: new Headers(headers),
  });
}

describe('Rate Limiter', () => {
  describe('getClientIdentifier', () => {
    /**
     * **Feature: ste-scpb-refonte, Property 3: Rate Limiting Enforcement**
     * **Validates: Requirements 5.7, 17.9**
     * 
     * Property: For any valid IP address in x-forwarded-for header,
     * getClientIdentifier should extract and return that IP address.
     */
    it('should extract valid IPv4 from x-forwarded-for header', () => {
      fc.assert(
        fc.property(
          // Generate valid IPv4 addresses
          fc.tuple(
            fc.integer({ min: 1, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 })
          ),
          ([a, b, c, d]) => {
            const ip = `${a}.${b}.${c}.${d}`;
            const request = createMockRequest({ 'x-forwarded-for': ip });
            const result = getClientIdentifier(request);
            expect(result).toBe(ip);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Feature: ste-scpb-refonte, Property 3: Rate Limiting Enforcement**
     * **Validates: Requirements 5.7, 17.9**
     * 
     * Property: For any request with multiple IPs in x-forwarded-for,
     * getClientIdentifier should return the first (client) IP.
     */
    it('should extract first IP from comma-separated x-forwarded-for', () => {
      fc.assert(
        fc.property(
          // Generate two valid IPv4 addresses
          fc.tuple(
            fc.tuple(
              fc.integer({ min: 1, max: 255 }),
              fc.integer({ min: 0, max: 255 }),
              fc.integer({ min: 0, max: 255 }),
              fc.integer({ min: 0, max: 255 })
            ),
            fc.tuple(
              fc.integer({ min: 1, max: 255 }),
              fc.integer({ min: 0, max: 255 }),
              fc.integer({ min: 0, max: 255 }),
              fc.integer({ min: 0, max: 255 })
            )
          ),
          ([[a1, b1, c1, d1], [a2, b2, c2, d2]]) => {
            const clientIp = `${a1}.${b1}.${c1}.${d1}`;
            const proxyIp = `${a2}.${b2}.${c2}.${d2}`;
            const forwardedHeader = `${clientIp}, ${proxyIp}`;
            
            const request = createMockRequest({ 'x-forwarded-for': forwardedHeader });
            const result = getClientIdentifier(request);
            
            expect(result).toBe(clientIp);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Feature: ste-scpb-refonte, Property 3: Rate Limiting Enforcement**
     * **Validates: Requirements 5.7, 17.9**
     * 
     * Property: For any request with x-real-ip header (and no x-forwarded-for),
     * getClientIdentifier should return the x-real-ip value.
     */
    it('should fallback to x-real-ip when x-forwarded-for is absent', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.integer({ min: 1, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 })
          ),
          ([a, b, c, d]) => {
            const ip = `${a}.${b}.${c}.${d}`;
            const request = createMockRequest({ 'x-real-ip': ip });
            const result = getClientIdentifier(request);
            expect(result).toBe(ip);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Feature: ste-scpb-refonte, Property 3: Rate Limiting Enforcement**
     * **Validates: Requirements 5.7, 17.9**
     * 
     * Property: For any request without IP headers,
     * getClientIdentifier should return 'unknown'.
     */
    it('should return unknown when no IP headers are present', () => {
      const request = createMockRequest({});
      const result = getClientIdentifier(request);
      expect(result).toBe('unknown');
    });

    /**
     * **Feature: ste-scpb-refonte, Property 3: Rate Limiting Enforcement**
     * **Validates: Requirements 5.7, 17.9**
     * 
     * Property: For any request with cf-connecting-ip header,
     * getClientIdentifier should return that IP when other headers are absent.
     */
    it('should use cf-connecting-ip for Cloudflare requests', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.integer({ min: 1, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 })
          ),
          ([a, b, c, d]) => {
            const ip = `${a}.${b}.${c}.${d}`;
            const request = createMockRequest({ 'cf-connecting-ip': ip });
            const result = getClientIdentifier(request);
            expect(result).toBe(ip);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Rate Limit Configuration', () => {
    /**
     * **Feature: ste-scpb-refonte, Property 3: Rate Limiting Enforcement**
     * **Validates: Requirements 5.7, 17.9**
     * 
     * Property: All rate limit configurations should have positive limits
     * and positive window durations.
     */
    it('should have valid rate limit configurations for all types', () => {
      const types = ['contact', 'rfq', 'newsletter'] as const;
      
      for (const type of types) {
        const config = RATE_LIMIT_CONFIG[type];
        expect(config.limit).toBeGreaterThan(0);
        expect(config.windowSeconds).toBeGreaterThan(0);
      }
    });

    /**
     * **Feature: ste-scpb-refonte, Property 3: Rate Limiting Enforcement**
     * **Validates: Requirements 5.7, 17.9**
     * 
     * Property: Contact form should have stricter limits than RFQ form
     * (B2B users need more requests).
     */
    it('should have contact limit <= rfq limit (B2B needs more)', () => {
      expect(RATE_LIMIT_CONFIG.contact.limit).toBeLessThanOrEqual(
        RATE_LIMIT_CONFIG.rfq.limit
      );
    });

    /**
     * **Feature: ste-scpb-refonte, Property 3: Rate Limiting Enforcement**
     * **Validates: Requirements 5.7, 17.9**
     * 
     * Property: Rate limits should match the requirements specification.
     */
    it('should match specified rate limits from requirements', () => {
      // Contact: 5 per hour (Requirements 5.7)
      expect(RATE_LIMIT_CONFIG.contact.limit).toBe(5);
      expect(RATE_LIMIT_CONFIG.contact.windowSeconds).toBe(3600);

      // RFQ: 10 per hour (Requirements 17.9)
      expect(RATE_LIMIT_CONFIG.rfq.limit).toBe(10);
      expect(RATE_LIMIT_CONFIG.rfq.windowSeconds).toBe(3600);

      // Newsletter: 3 per hour
      expect(RATE_LIMIT_CONFIG.newsletter.limit).toBe(3);
      expect(RATE_LIMIT_CONFIG.newsletter.windowSeconds).toBe(3600);
    });
  });

  describe('IP Validation', () => {
    /**
     * **Feature: ste-scpb-refonte, Property 3: Rate Limiting Enforcement**
     * **Validates: Requirements 5.7, 17.9**
     * 
     * Property: For any valid IPv4 address, isValidIp should return true.
     */
    it('should validate all well-formed IPv4 addresses', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 })
          ),
          ([a, b, c, d]) => {
            const ip = `${a}.${b}.${c}.${d}`;
            expect(isValidIp(ip)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Feature: ste-scpb-refonte, Property 3: Rate Limiting Enforcement**
     * **Validates: Requirements 5.7, 17.9**
     * 
     * Property: For any string that doesn't match IP patterns,
     * isValidIp should return false.
     */
    it('should reject invalid IP formats', () => {
      const invalidIps = [
        'not-an-ip',
        '256.1.1.1',
        '1.1.1',
        '1.1.1.1.1',
        '',
        'localhost',
        '::1::1::1::1::1::1::1::1::1', // Too many segments
      ];

      for (const ip of invalidIps) {
        expect(isValidIp(ip)).toBe(false);
      }
    });
  });
});
