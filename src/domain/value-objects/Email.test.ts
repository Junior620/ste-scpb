import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Email } from './Email';

/**
 * Property-Based Tests for Email Value Object
 * **Feature: ste-scpb-refonte, Property 1: Email Validation Round-Trip**
 * **Validates: Requirements 5.1, 5.2, 17.1**
 */
describe('Email Value Object - Property Tests', () => {
  /**
   * Property 1: Email Validation Round-Trip
   * For any valid email string, creating an Email and getting its value
   * should return a normalized (trimmed, lowercase) version of the original
   */
  it('should round-trip valid emails: create then getValue returns normalized email', () => {
    // Arbitrary for valid email format
    const validEmailArb = fc
      .tuple(
        fc.stringMatching(/^[a-z0-9]+$/), // local part (alphanumeric)
        fc.stringMatching(/^[a-z0-9]+$/), // domain name
        fc.stringMatching(/^[a-z]{2,6}$/) // TLD
      )
      .filter(([local, domain, tld]) => local.length > 0 && domain.length > 0 && tld.length >= 2)
      .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

    fc.assert(
      fc.property(validEmailArb, (emailStr) => {
        const result = Email.create(emailStr);

        // Valid emails should succeed
        expect(result.success).toBe(true);

        if (result.success) {
          // Round-trip: getValue should return normalized email
          const value = result.value.getValue();
          expect(value).toBe(emailStr.trim().toLowerCase());

          // toString should also return the same value
          expect(result.value.toString()).toBe(value);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Valid emails with whitespace are normalized
   * For any valid email with leading/trailing whitespace,
   * the result should be trimmed and lowercase
   */
  it('should normalize emails with whitespace', () => {
    const emailWithWhitespaceArb = fc
      .tuple(
        fc.stringMatching(/^[a-z0-9]+$/),
        fc.stringMatching(/^[a-z0-9]+$/),
        fc.stringMatching(/^[a-z]{2,6}$/),
        fc.stringMatching(/^\s{0,3}$/), // leading whitespace
        fc.stringMatching(/^\s{0,3}$/) // trailing whitespace
      )
      .filter(([local, domain, tld]) => local.length > 0 && domain.length > 0 && tld.length >= 2)
      .map(([local, domain, tld, leading, trailing]) => `${leading}${local}@${domain}.${tld}${trailing}`);

    fc.assert(
      fc.property(emailWithWhitespaceArb, (emailStr) => {
        const result = Email.create(emailStr);

        expect(result.success).toBe(true);
        if (result.success) {
          // Should be trimmed
          expect(result.value.getValue()).toBe(emailStr.trim().toLowerCase());
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Two Email objects with same normalized value are equal
   */
  it('should consider emails with same normalized value as equal', () => {
    const validEmailArb = fc
      .tuple(
        fc.stringMatching(/^[a-z0-9]+$/),
        fc.stringMatching(/^[a-z0-9]+$/),
        fc.stringMatching(/^[a-z]{2,6}$/)
      )
      .filter(([local, domain, tld]) => local.length > 0 && domain.length > 0 && tld.length >= 2)
      .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

    fc.assert(
      fc.property(validEmailArb, (emailStr) => {
        const result1 = Email.create(emailStr);
        const result2 = Email.create(emailStr.toUpperCase()); // Different case

        expect(result1.success).toBe(true);
        expect(result2.success).toBe(true);

        if (result1.success && result2.success) {
          // Should be equal after normalization
          expect(result1.value.equals(result2.value)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Invalid emails (missing @, missing domain, etc.) should fail
   */
  it('should reject invalid email formats', () => {
    // Strings without @ symbol
    const noAtArb = fc.stringMatching(/^[a-z0-9.]+$/).filter((s) => s.length > 0 && !s.includes('@'));

    fc.assert(
      fc.property(noAtArb, (invalidEmail) => {
        const result = Email.create(invalidEmail);
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty or whitespace-only strings should fail
   */
  it('should reject empty or whitespace-only strings', () => {
    const emptyOrWhitespaceArb = fc.stringMatching(/^\s*$/);

    fc.assert(
      fc.property(emptyOrWhitespaceArb, (emptyStr) => {
        const result = Email.create(emptyStr);
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
