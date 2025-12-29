import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Product, ProductCategory, Certification, PackagingOption } from '@/domain/entities/Product';
import { PRODUCT_CATEGORIES, CERTIFICATIONS, PACKAGING_OPTIONS } from '@/domain/entities/Product';
import type { Locale } from '@/domain/value-objects/Locale';
import { SUPPORTED_LOCALES } from '@/domain/value-objects/Locale';
import { generateProductSchema, generateOrganizationSchema, generateLocalBusinessSchema } from './schema';

/**
 * Property-Based Tests for Schema.org Markup Validity
 * **Feature: ste-scpb-refonte, Property 5: Schema.org Markup Validity**
 * **Validates: Requirements 4.3, 10.4**
 *
 * Property 5: Schema.org Markup Validity
 * For any valid product, the generated schema.org JSON-LD should:
 * - Have the correct @context and @type
 * - Include required fields (name, description)
 * - Include images when available
 * - Include additional properties for origin, certifications, etc.
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

describe('Schema.org Markup Validity - Property Tests', () => {
  const baseUrl = 'https://ste-scpb.com';

  /**
   * Property 5: Schema.org Markup Validity
   * For any valid product, the generated schema should have correct structure
   */
  it('should generate valid schema.org Product markup for any product', () => {
    fc.assert(
      fc.property(
        productArbitrary,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (product, locale) => {
          const schema = generateProductSchema(product, locale, baseUrl);

          // Required schema.org fields
          expect(schema['@context']).toBe('https://schema.org');
          expect(schema['@type']).toBe('Product');

          // Name and description must match product data
          expect(schema.name).toBe(product.name[locale]);
          expect(schema.description).toBe(product.description[locale]);

          // Brand and manufacturer should be present
          expect(schema.brand).toBeDefined();
          expect(schema.brand?.['@type']).toBe('Brand');
          expect(schema.brand?.name).toBe('STE-SCPB');

          expect(schema.manufacturer).toBeDefined();
          expect(schema.manufacturer?.['@type']).toBe('Organization');

          // Offers should be present
          expect(schema.offers).toBeDefined();
          expect(schema.offers?.['@type']).toBe('Offer');
          expect(schema.offers?.availability).toBe('https://schema.org/InStock');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Images should be included when available
   */
  it('should include images in schema when product has images', () => {
    const productWithImagesArb = productArbitrary.filter((p) => p.images.length > 0);

    fc.assert(
      fc.property(
        productWithImagesArb,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (product, locale) => {
          const schema = generateProductSchema(product, locale, baseUrl);

          // Images should be present
          expect(schema.image).toBeDefined();
          expect(Array.isArray(schema.image)).toBe(true);
          expect(schema.image?.length).toBe(product.images.length);

          // Each image URL should match
          product.images.forEach((img, index) => {
            expect(schema.image?.[index]).toBe(img.url);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Category should be included
   */
  it('should include category in schema', () => {
    fc.assert(
      fc.property(
        productArbitrary,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (product, locale) => {
          const schema = generateProductSchema(product, locale, baseUrl);

          expect(schema.category).toBe(product.category);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Additional properties should be included when available
   */
  it('should include additional properties for origin, certifications, etc.', () => {
    fc.assert(
      fc.property(
        productArbitrary,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (product, locale) => {
          const schema = generateProductSchema(product, locale, baseUrl);

          // Additional properties should exist
          expect(schema.additionalProperty).toBeDefined();
          expect(Array.isArray(schema.additionalProperty)).toBe(true);

          // Check for origin property
          if (product.origin.length > 0) {
            const originProp = schema.additionalProperty?.find((p) => p.name === 'Origin');
            expect(originProp).toBeDefined();
            expect(originProp?.['@type']).toBe('PropertyValue');
            expect(originProp?.value).toBe(product.origin.join(', '));
          }

          // Check for season property
          if (product.season) {
            const seasonProp = schema.additionalProperty?.find((p) => p.name === 'Season');
            expect(seasonProp).toBeDefined();
            expect(seasonProp?.value).toBe(product.season);
          }

          // Check for certifications property
          if (product.certifications.length > 0) {
            const certProp = schema.additionalProperty?.find((p) => p.name === 'Certifications');
            expect(certProp).toBeDefined();
            expect(certProp?.value).toBe(product.certifications.join(', '));
          }

          // Check for packaging options property
          if (product.packagingOptions.length > 0) {
            const packProp = schema.additionalProperty?.find((p) => p.name === 'Packaging Options');
            expect(packProp).toBeDefined();
            expect(packProp?.value).toBe(product.packagingOptions.join(', '));
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Generated schema should be valid JSON
   */
  it('should generate valid JSON that can be serialized', () => {
    fc.assert(
      fc.property(
        productArbitrary,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (product, locale) => {
          const schema = generateProductSchema(product, locale, baseUrl);

          // Should be serializable to JSON
          const jsonString = JSON.stringify(schema);
          expect(typeof jsonString).toBe('string');

          // Should be parseable back
          const parsed = JSON.parse(jsonString);
          expect(parsed['@context']).toBe('https://schema.org');
          expect(parsed['@type']).toBe('Product');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test Organization schema generation
   */
  it('should generate valid Organization schema', () => {
    const schema = generateOrganizationSchema(baseUrl);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('STE-SCPB');
    expect(schema.url).toBe(baseUrl);
    expect(schema.address).toBeDefined();
    expect(schema.address?.['@type']).toBe('PostalAddress');
    expect(schema.contactPoint).toBeDefined();
    expect(schema.contactPoint?.['@type']).toBe('ContactPoint');
  });

  /**
   * Test LocalBusiness schema generation
   */
  it('should generate valid LocalBusiness schema', () => {
    const schema = generateLocalBusinessSchema(baseUrl);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('LocalBusiness');
    expect(schema.name).toBe('STE-SCPB');
    expect(schema.url).toBe(baseUrl);
    expect(schema.address).toBeDefined();
    expect(schema.address['@type']).toBe('PostalAddress');
    expect(schema.geo).toBeDefined();
    expect(schema.geo?.['@type']).toBe('GeoCoordinates');
    expect(typeof schema.geo?.latitude).toBe('number');
    expect(typeof schema.geo?.longitude).toBe('number');
  });
});
