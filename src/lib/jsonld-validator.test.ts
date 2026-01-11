/**
 * JSON-LD Validator Tests - Google Rich Results Test Compliance
 * Validates: Requirements 2.5
 *
 * These tests validate that the generated JSON-LD for products
 * passes Google Rich Results Test requirements.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Product, ProductCategory, Certification, PackagingOption } from '@/domain/entities/Product';
import { PRODUCT_CATEGORIES, CERTIFICATIONS, PACKAGING_OPTIONS } from '@/domain/entities/Product';
import type { Locale } from '@/domain/value-objects/Locale';
import { SUPPORTED_LOCALES } from '@/domain/value-objects/Locale';
import { generateProductSchema } from './schema';
import { validateProductJsonLd, validateJsonLdSerialization } from './jsonld-validator';

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
    fr: fc.string({ minLength: 50, maxLength: 500 }),
    en: fc.string({ minLength: 50, maxLength: 500 }),
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
    { minLength: 1, maxLength: 5 }
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

describe('Google Rich Results Test Validation', () => {
  const baseUrl = 'https://ste-scpb.com';

  /**
   * Property: All generated Product schemas should pass Google Rich Results validation
   * **Feature: ux-improvements, Property 3: JSON-LD validity**
   * **Validates: Requirements 2.5**
   */
  it('should generate valid JSON-LD that passes Google Rich Results Test for any product', () => {
    fc.assert(
      fc.property(
        productArbitrary,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (product, locale) => {
          const schema = generateProductSchema(product, locale, baseUrl);
          const result = validateProductJsonLd(schema);

          // Should have no errors
          expect(result.errors).toEqual([]);
          expect(result.valid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: JSON-LD should be properly serializable
   * **Validates: Requirements 2.5**
   */
  it('should generate JSON-LD that can be serialized and parsed correctly', () => {
    fc.assert(
      fc.property(
        productArbitrary,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (product, locale) => {
          const schema = generateProductSchema(product, locale, baseUrl);
          const result = validateJsonLdSerialization(schema);

          expect(result.errors).toEqual([]);
          expect(result.valid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test specific product examples that match real STE-SCPB products
   */
  describe('Real Product Examples', () => {
    const cacaoProduct: Product = {
      id: '1',
      slug: 'cacao-grade-1',
      name: { fr: 'Cacao Grade I', en: 'Cocoa Grade I' },
      description: {
        fr: 'Fèves de cacao premium de qualité supérieure, cultivées au Cameroun avec des méthodes durables.',
        en: 'Premium quality cocoa beans grown in Cameroon using sustainable farming methods.',
      },
      category: 'cacao',
      origin: ['Cameroun'],
      season: 'Octobre - Mars',
      certifications: ['rainforest-alliance', 'fairtrade'],
      packagingOptions: ['bulk', 'bags'],
      images: [
        {
          url: 'https://ste-scpb.com/images/cacao-grade-1.jpg',
          alt: { fr: 'Fèves de cacao', en: 'Cocoa beans' },
          width: 800,
          height: 600,
        },
      ],
      constellation: {
        nodes: [],
        connections: [],
        color: '#d4a574',
        glowIntensity: 1,
        animationSpeed: 1,
      },
      relatedProducts: ['cacao-grade-2'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const cafeProduct: Product = {
      id: '2',
      slug: 'cafe-arabica',
      name: { fr: 'Café Arabica', en: 'Arabica Coffee' },
      description: {
        fr: 'Café Arabica de haute altitude, cultivé dans les montagnes du Cameroun avec un arôme riche.',
        en: 'High altitude Arabica coffee grown in the mountains of Cameroon with rich aroma.',
      },
      category: 'cafe',
      origin: ['Cameroun', 'Ouest'],
      season: 'Novembre - Février',
      certifications: ['organic', 'fairtrade'],
      packagingOptions: ['bags', 'containers'],
      images: [
        {
          url: 'https://ste-scpb.com/images/cafe-arabica.jpg',
          alt: { fr: 'Grains de café', en: 'Coffee beans' },
          width: 800,
          height: 600,
        },
      ],
      constellation: {
        nodes: [],
        connections: [],
        color: '#6f4e37',
        glowIntensity: 1,
        animationSpeed: 1,
      },
      relatedProducts: ['cafe-robusta'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const boisProduct: Product = {
      id: '3',
      slug: 'bois-iroko',
      name: { fr: 'Bois Iroko', en: 'Iroko Wood' },
      description: {
        fr: 'Bois tropical Iroko de qualité export, idéal pour la construction et l\'ameublement haut de gamme.',
        en: 'Export quality Iroko tropical wood, ideal for construction and high-end furniture.',
      },
      category: 'bois',
      origin: ['Cameroun', 'Centre'],
      season: 'Toute l\'année',
      certifications: [],
      packagingOptions: ['containers'],
      images: [
        {
          url: 'https://ste-scpb.com/images/bois-iroko.jpg',
          alt: { fr: 'Bois Iroko', en: 'Iroko Wood' },
          width: 800,
          height: 600,
        },
      ],
      constellation: {
        nodes: [],
        connections: [],
        color: '#8b4513',
        glowIntensity: 1,
        animationSpeed: 1,
      },
      relatedProducts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should validate Cacao product JSON-LD', () => {
      const schema = generateProductSchema(cacaoProduct, 'fr', baseUrl);
      const result = validateProductJsonLd(schema);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(schema.name).toBe('Cacao Grade I');
      expect(schema.brand?.name).toBe('STE-SCPB');
      expect(schema.offers?.availability).toBe('https://schema.org/InStock');
    });

    it('should validate Café product JSON-LD', () => {
      const schema = generateProductSchema(cafeProduct, 'en', baseUrl);
      const result = validateProductJsonLd(schema);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(schema.name).toBe('Arabica Coffee');
      expect(schema.additionalProperty).toBeDefined();
      expect(schema.additionalProperty?.some((p) => p.name === 'Certifications')).toBe(true);
    });

    it('should validate Bois product JSON-LD (no certifications)', () => {
      const schema = generateProductSchema(boisProduct, 'fr', baseUrl);
      const result = validateProductJsonLd(schema);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(schema.name).toBe('Bois Iroko');
      // Should not have certifications property since empty
      const certProp = schema.additionalProperty?.find((p) => p.name === 'Certifications');
      expect(certProp).toBeUndefined();
    });

    it('should validate all products in both locales', () => {
      const products = [cacaoProduct, cafeProduct, boisProduct];
      const locales: Locale[] = ['fr', 'en'];

      products.forEach((product) => {
        locales.forEach((locale) => {
          const schema = generateProductSchema(product, locale, baseUrl);
          const result = validateProductJsonLd(schema);

          expect(result.valid).toBe(true);
          expect(result.errors).toEqual([]);
        });
      });
    });
  });

  /**
   * Test that schema includes all required Google Rich Results fields
   */
  describe('Required Fields Validation', () => {
    it('should always include @context as https://schema.org', () => {
      fc.assert(
        fc.property(
          productArbitrary,
          fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
          (product, locale) => {
            const schema = generateProductSchema(product, locale, baseUrl);
            expect(schema['@context']).toBe('https://schema.org');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should always include @type as Product', () => {
      fc.assert(
        fc.property(
          productArbitrary,
          fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
          (product, locale) => {
            const schema = generateProductSchema(product, locale, baseUrl);
            expect(schema['@type']).toBe('Product');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should always include name from product', () => {
      fc.assert(
        fc.property(
          productArbitrary,
          fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
          (product, locale) => {
            const schema = generateProductSchema(product, locale, baseUrl);
            expect(schema.name).toBe(product.name[locale]);
            expect(typeof schema.name).toBe('string');
            expect(schema.name.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should always include brand with STE-SCPB', () => {
      fc.assert(
        fc.property(
          productArbitrary,
          fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
          (product, locale) => {
            const schema = generateProductSchema(product, locale, baseUrl);
            expect(schema.brand).toBeDefined();
            expect(schema.brand?.['@type']).toBe('Brand');
            expect(schema.brand?.name).toBe('STE-SCPB');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should always include offers with InStock availability', () => {
      fc.assert(
        fc.property(
          productArbitrary,
          fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
          (product, locale) => {
            const schema = generateProductSchema(product, locale, baseUrl);
            expect(schema.offers).toBeDefined();
            expect(schema.offers?.['@type']).toBe('Offer');
            expect(schema.offers?.availability).toBe('https://schema.org/InStock');
            expect(schema.offers?.seller?.name).toBe('STE-SCPB');
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
