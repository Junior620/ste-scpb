import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import frMessages from './messages/fr.json';
import enMessages from './messages/en.json';
import { SUPPORTED_LOCALES } from '@/domain/value-objects/Locale';

/**
 * Property-Based Tests for Translation Completeness
 * **Feature: ste-scpb-refonte, Property 6: Translation Completeness**
 * **Validates: Requirements 6.1, 6.4**
 */
describe('Translation Completeness - Property Tests', () => {
  /**
   * Helper function to get all keys from a nested object
   * Returns an array of dot-notation paths (e.g., "nav.home", "contact.form.name")
   */
  function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    const keys: string[] = [];

    for (const key of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        // Recurse into nested objects
        keys.push(...getAllKeys(value as Record<string, unknown>, fullKey));
      } else {
        // Leaf node - add the key
        keys.push(fullKey);
      }
    }

    return keys;
  }

  /**
   * Helper function to get a value from a nested object using dot notation
   */
  function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  // Get all translation keys from both locales
  const frKeys = getAllKeys(frMessages as Record<string, unknown>);
  const enKeys = getAllKeys(enMessages as Record<string, unknown>);

  /**
   * Property 6: Translation Completeness
   * For any translation key in the French locale, the English locale should have the same key
   */
  it('should have all French keys present in English translations', () => {
    // Create an arbitrary that picks from French keys
    const frKeyArb = fc.constantFrom(...frKeys);

    fc.assert(
      fc.property(frKeyArb, (key) => {
        const enValue = getNestedValue(enMessages as Record<string, unknown>, key);

        // The key should exist in English
        expect(enValue).toBeDefined();

        // If it's a string in French, it should be a string in English
        const frValue = getNestedValue(frMessages as Record<string, unknown>, key);
        if (typeof frValue === 'string') {
          expect(typeof enValue).toBe('string');
        }
      }),
      { numRuns: Math.min(frKeys.length, 200) }
    );
  });

  /**
   * Property: All English keys should be present in French translations
   */
  it('should have all English keys present in French translations', () => {
    const enKeyArb = fc.constantFrom(...enKeys);

    fc.assert(
      fc.property(enKeyArb, (key) => {
        const frValue = getNestedValue(frMessages as Record<string, unknown>, key);

        // The key should exist in French
        expect(frValue).toBeDefined();

        // If it's a string in English, it should be a string in French
        const enValue = getNestedValue(enMessages as Record<string, unknown>, key);
        if (typeof enValue === 'string') {
          expect(typeof frValue).toBe('string');
        }
      }),
      { numRuns: Math.min(enKeys.length, 200) }
    );
  });

  /**
   * Property: Translation values should be non-empty strings
   */
  it('should have non-empty string values for all translation keys', () => {
    const allKeysArb = fc.constantFrom(...frKeys);

    fc.assert(
      fc.property(allKeysArb, (key) => {
        const frValue = getNestedValue(frMessages as Record<string, unknown>, key);
        const enValue = getNestedValue(enMessages as Record<string, unknown>, key);

        // Both values should be non-empty strings
        if (typeof frValue === 'string') {
          expect(frValue.trim().length).toBeGreaterThan(0);
        }
        if (typeof enValue === 'string') {
          expect(enValue.trim().length).toBeGreaterThan(0);
        }
      }),
      { numRuns: Math.min(frKeys.length, 200) }
    );
  });

  /**
   * Property: Key counts should match between locales
   */
  it('should have the same number of translation keys in both locales', () => {
    expect(frKeys.length).toBe(enKeys.length);
  });

  /**
   * Property: All supported locales should have translation files
   */
  it('should have translation files for all supported locales', () => {
    const localeArb = fc.constantFrom(...SUPPORTED_LOCALES);

    fc.assert(
      fc.property(localeArb, (locale) => {
        // This test verifies that we have messages for each supported locale
        // The imports at the top of the file would fail if files don't exist
        if (locale === 'fr') {
          expect(Object.keys(frMessages).length).toBeGreaterThan(0);
        } else if (locale === 'en') {
          expect(Object.keys(enMessages).length).toBeGreaterThan(0);
        }
      }),
      { numRuns: SUPPORTED_LOCALES.length }
    );
  });

  /**
   * Property: Placeholder patterns should be consistent between locales
   * If French has {variable}, English should have the same {variable}
   */
  it('should have consistent placeholder patterns between locales', () => {
    const placeholderRegex = /\{([^}]+)\}/g;

    const keysWithPlaceholders = frKeys.filter((key) => {
      const value = getNestedValue(frMessages as Record<string, unknown>, key);
      return typeof value === 'string' && placeholderRegex.test(value);
    });

    if (keysWithPlaceholders.length === 0) {
      // No placeholders to test
      return;
    }

    const keyArb = fc.constantFrom(...keysWithPlaceholders);

    fc.assert(
      fc.property(keyArb, (key) => {
        const frValue = getNestedValue(frMessages as Record<string, unknown>, key) as string;
        const enValue = getNestedValue(enMessages as Record<string, unknown>, key) as string;

        // Extract placeholders from both
        const frPlaceholders = [...frValue.matchAll(placeholderRegex)].map((m) => m[1]).sort();
        const enPlaceholders = [...enValue.matchAll(placeholderRegex)].map((m) => m[1]).sort();

        // Placeholders should match
        expect(enPlaceholders).toEqual(frPlaceholders);
      }),
      { numRuns: Math.min(keysWithPlaceholders.length, 100) }
    );
  });
});
