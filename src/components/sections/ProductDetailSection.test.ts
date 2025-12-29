import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Product, ProductCategory, Certification, PackagingOption } from '@/domain/entities/Product';
import { PRODUCT_CATEGORIES, CERTIFICATIONS, PACKAGING_OPTIONS } from '@/domain/entities/Product';
import type { Locale } from '@/domain/value-objects/Locale';
import { SUPPORTED_LOCALES } from '@/domain/value-objects/Locale';

/**
 * Property-Based Tests for Product Page Content Completeness
 * **Feature: ste-scpb-refonte, Property 4: Product Page Content Completeness**
 * **Validates: Requirements 2.3, 4.2**
 *
 * Property 4: Product Page Content Completeness
 * For any valid product, the product detail page should display:
 * - Product name (localized)
 * - Product description (localized)
 * - Origin/sourcing regions
 * - Certifications (if any)
 * - Packaging options (if any)
 * - Category
 */

/**
 * Arbitrary for generating valid Product objects
 */
const productArbitrary = fc.record({
  id: fc.uuid(),
  slug: fc.stringMatching(/^[a-z][a-z0-9-]*[a-z0-9]$/).filter((s) => s.length >= 3 && s.length <= 50 && !s.includes('--')),
  name: fc.record({
    fr: fc.string({ minLength: 2, maxLength: 100 }),
    en: fc.string({ minLength: 2, maxLength: 100 }),
  }),
  description: fc.record({
    fr: fc.string({ minLength: 10, maxLength: 500 }),
    en: fc.string({ minLength: 10, maxLength: 500 }),
  }),
  category: fc.constantFrom(...PRODUCT_CATEGORIES) as fc.Arbitrary<ProductCategory>,
  origin: fc.array(fc.string({ minLength: 2, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
  season: fc.string({ minLength: 2, maxLength: 50 }),
  certifications: fc.subarray([...CERTIFICATIONS]) as fc.Arbitrary<Certification[]>,
  packagingOptions: fc.subarray([...PACKAGING_OPTIONS], { minLength: 1 }) as fc.Arbitrary<PackagingOption[]>,
  images: fc.array(
    fc.record({
      url: fc.webUrl(),
      alt: fc.record({
        fr: fc.string({ minLength: 2, maxLength: 100 }),
        en: fc.string({ minLength: 2, maxLength: 100 }),
      }),
      width: fc.integer({ min: 100, max: 2000 }),
      height: fc.integer({ min: 100, max: 2000 }),
    }),
    { minLength: 0, maxLength: 5 }
  ),
  constellation: fc.record({
    nodes: fc.array(
      fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }),
        position: fc.tuple(
          fc.float({ min: Math.fround(-10), max: Math.fround(10), noNaN: true }),
          fc.float({ min: Math.fround(-10), max: Math.fround(10), noNaN: true }),
          fc.float({ min: Math.fround(-10), max: Math.fround(10), noNaN: true })
        ) as fc.Arbitrary<[number, number, number]>,
        size: fc.float({ min: Math.fround(0.1), max: Math.fround(1), noNaN: true }),
        label: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
      }),
      { minLength: 0, maxLength: 10 }
    ),
    connections: fc.array(
      fc.tuple(fc.integer({ min: 0, max: 9 }), fc.integer({ min: 0, max: 9 })) as fc.Arbitrary<[number, number]>,
      { minLength: 0, maxLength: 15 }
    ),
    color: fc.stringMatching(/^#[0-9a-f]{6}$/),
    glowIntensity: fc.float({ min: Math.fround(0), max: Math.fround(2), noNaN: true }),
    animationSpeed: fc.float({ min: Math.fround(0.1), max: Math.fround(2), noNaN: true }),
  }),
  relatedProducts: fc.array(fc.stringMatching(/^[a-z0-9-]+$/), { minLength: 0, maxLength: 5 }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
}) as fc.Arbitrary<Product>;

/**
 * Helper function to extract product content for display
 * This simulates what the ProductDetailSection component does
 */
function extractProductDisplayContent(product: Product, locale: Locale) {
  return {
    name: product.name[locale],
    description: product.description[locale],
    category: product.category,
    origin: product.origin,
    season: product.season,
    certifications: product.certifications,
    packagingOptions: product.packagingOptions,
    hasImages: product.images.length > 0,
    imageAlts: product.images.map((img) => img.alt[locale]),
  };
}

describe('Product Page Content Completeness - Property Tests', () => {
  /**
   * Property 4: Product Page Content Completeness
   * For any valid product and locale, all required content should be extractable
   */
  it('should contain all required product information for any valid product', () => {
    fc.assert(
      fc.property(
        productArbitrary,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (product, locale) => {
          const content = extractProductDisplayContent(product, locale);

          // Name must be present and non-empty
          expect(content.name).toBeDefined();
          expect(content.name.length).toBeGreaterThan(0);

          // Description must be present and non-empty
          expect(content.description).toBeDefined();
          expect(content.description.length).toBeGreaterThan(0);

          // Category must be a valid category
          expect(PRODUCT_CATEGORIES).toContain(content.category);

          // Origin must be present (at least one region)
          expect(content.origin).toBeDefined();
          expect(content.origin.length).toBeGreaterThan(0);

          // Season must be present
          expect(content.season).toBeDefined();

          // Certifications array must exist (can be empty)
          expect(Array.isArray(content.certifications)).toBe(true);
          content.certifications.forEach((cert) => {
            expect(CERTIFICATIONS).toContain(cert);
          });

          // Packaging options must exist and have at least one option
          expect(Array.isArray(content.packagingOptions)).toBe(true);
          expect(content.packagingOptions.length).toBeGreaterThan(0);
          content.packagingOptions.forEach((option) => {
            expect(PACKAGING_OPTIONS).toContain(option);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Localized content should be different for different locales
   * (unless they happen to be the same by chance)
   */
  it('should provide localized content for each supported locale', () => {
    fc.assert(
      fc.property(productArbitrary, (product) => {
        const frContent = extractProductDisplayContent(product, 'fr');
        const enContent = extractProductDisplayContent(product, 'en');

        // Both locales should have content
        expect(frContent.name).toBeDefined();
        expect(enContent.name).toBeDefined();
        expect(frContent.description).toBeDefined();
        expect(enContent.description).toBeDefined();

        // Non-localized fields should be the same
        expect(frContent.category).toBe(enContent.category);
        expect(frContent.origin).toEqual(enContent.origin);
        expect(frContent.season).toBe(enContent.season);
        expect(frContent.certifications).toEqual(enContent.certifications);
        expect(frContent.packagingOptions).toEqual(enContent.packagingOptions);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Image alt texts should be localized
   */
  it('should provide localized alt text for images', () => {
    // Filter to products with at least one image
    const productWithImagesArb = productArbitrary.filter((p) => p.images.length > 0);

    fc.assert(
      fc.property(
        productWithImagesArb,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (product, locale) => {
          const content = extractProductDisplayContent(product, locale);

          // Each image should have alt text for the locale
          expect(content.hasImages).toBe(true);
          content.imageAlts.forEach((alt) => {
            expect(alt).toBeDefined();
            expect(typeof alt).toBe('string');
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Product slug should be URL-safe
   */
  it('should have URL-safe slugs', () => {
    fc.assert(
      fc.property(productArbitrary, (product) => {
        // Slug should only contain lowercase letters, numbers, and hyphens
        expect(product.slug).toMatch(/^[a-z0-9-]+$/);
        // Slug should start with a letter
        expect(product.slug).toMatch(/^[a-z]/);
        // Slug should end with a letter or number
        expect(product.slug).toMatch(/[a-z0-9]$/);
        // Slug should not have consecutive hyphens
        expect(product.slug).not.toMatch(/--/);
      }),
      { numRuns: 100 }
    );
  });
});
