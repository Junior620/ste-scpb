import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { INCOTERMS, isValidIncoterm, parseIncoterm, INCOTERM_DESCRIPTIONS, type Incoterm } from './Incoterm';

/**
 * Property-Based Tests for Incoterm Value Object
 * **Feature: ste-scpb-refonte, Property 24: Incoterm Value Validity**
 * **Validates: Requirements 17.4**
 */
describe('Incoterm Value Object - Property Tests', () => {
  /**
   * Property 24: Incoterm Value Validity
   * For any value from the INCOTERMS array, isValidIncoterm should return true
   */
  it('should validate all ICC 2020 Incoterms as valid', () => {
    const incotermArb = fc.constantFrom(...INCOTERMS);

    fc.assert(
      fc.property(incotermArb, (incoterm) => {
        expect(isValidIncoterm(incoterm)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: parseIncoterm should return the same value for valid Incoterms
   */
  it('should parse valid Incoterms and return the same value', () => {
    const incotermArb = fc.constantFrom(...INCOTERMS);

    fc.assert(
      fc.property(incotermArb, (incoterm) => {
        const parsed = parseIncoterm(incoterm);
        expect(parsed).toBe(incoterm);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: parseIncoterm should be case-insensitive
   * For any valid Incoterm in any case, parsing should return the uppercase version
   */
  it('should parse Incoterms case-insensitively', () => {
    const incotermWithCaseArb = fc.constantFrom(...INCOTERMS).chain((incoterm) =>
      fc.constantFrom(
        incoterm.toLowerCase(),
        incoterm.toUpperCase(),
        incoterm.charAt(0) + incoterm.slice(1).toLowerCase() // Mixed case
      )
    );

    fc.assert(
      fc.property(incotermWithCaseArb, (incotermVariant) => {
        const parsed = parseIncoterm(incotermVariant);
        expect(parsed).toBeDefined();
        expect(INCOTERMS).toContain(parsed);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All valid Incoterms have descriptions in both languages
   */
  it('should have descriptions for all Incoterms in both FR and EN', () => {
    const incotermArb = fc.constantFrom(...INCOTERMS);

    fc.assert(
      fc.property(incotermArb, (incoterm) => {
        const description = INCOTERM_DESCRIPTIONS[incoterm];
        expect(description).toBeDefined();
        expect(description.en).toBeDefined();
        expect(description.en.length).toBeGreaterThan(0);
        expect(description.fr).toBeDefined();
        expect(description.fr.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Invalid strings should not be valid Incoterms
   */
  it('should reject invalid Incoterm strings', () => {
    // Generate strings that are NOT valid Incoterms
    const invalidIncotermArb = fc
      .string({ minLength: 1, maxLength: 10 })
      .filter((s) => !INCOTERMS.includes(s.toUpperCase().trim() as Incoterm));

    fc.assert(
      fc.property(invalidIncotermArb, (invalidStr) => {
        expect(isValidIncoterm(invalidStr)).toBe(false);
        expect(parseIncoterm(invalidStr)).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: INCOTERMS array should contain exactly 11 ICC 2020 terms
   */
  it('should contain exactly 11 ICC 2020 Incoterms', () => {
    expect(INCOTERMS.length).toBe(11);

    // Verify all expected terms are present
    const expectedTerms = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'];
    expectedTerms.forEach((term) => {
      expect(INCOTERMS).toContain(term);
    });
  });
});
