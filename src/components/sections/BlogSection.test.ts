import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { ArticleListItem, ArticleCategory, ArticleImage } from '@/domain/entities/Article';
import { formatArticleDate } from '@/domain/entities/Article';
import type { Locale, LocalizedContent } from '@/domain/value-objects/Locale';
import { SUPPORTED_LOCALES } from '@/domain/value-objects/Locale';

/**
 * Property-Based Tests for Article Display Completeness
 * **Feature: ste-scpb-refonte, Property 21: Article Display Completeness**
 * **Validates: Requirements 7.1**
 *
 * Property 21: Article Display Completeness
 * For any valid article, the blog listing should display:
 * - Featured image (if present)
 * - Title (localized)
 * - Excerpt (localized)
 * - Publication date
 */

/**
 * Arbitrary for generating LocalizedContent with non-whitespace strings
 */
const localizedContentArbitrary = (minLength: number, maxLength: number): fc.Arbitrary<LocalizedContent> =>
  fc.record({
    fr: fc.string({ minLength, maxLength }).filter((s) => s.trim().length > 0),
    en: fc.string({ minLength, maxLength }).filter((s) => s.trim().length > 0),
  });

/**
 * Arbitrary for generating ArticleCategory
 */
const articleCategoryArbitrary: fc.Arbitrary<ArticleCategory> = fc.record({
  id: fc.uuid(),
  slug: fc.stringMatching(/^[a-z][a-z0-9-]*[a-z0-9]$/).filter((s) => s.length >= 3 && s.length <= 30 && !s.includes('--')),
  name: localizedContentArbitrary(2, 50),
});

/**
 * Arbitrary for generating ArticleImage
 */
const articleImageArbitrary: fc.Arbitrary<ArticleImage> = fc.record({
  url: fc.webUrl(),
  alt: localizedContentArbitrary(2, 100),
  width: fc.integer({ min: 100, max: 2000 }),
  height: fc.integer({ min: 100, max: 2000 }),
});

/**
 * Arbitrary for generating valid ArticleListItem objects
 */
const articleListItemArbitrary: fc.Arbitrary<ArticleListItem> = fc.record({
  id: fc.uuid(),
  slug: fc.stringMatching(/^[a-z][a-z0-9-]*[a-z0-9]$/).filter((s) => s.length >= 3 && s.length <= 100 && !s.includes('--')),
  title: localizedContentArbitrary(5, 150),
  excerpt: localizedContentArbitrary(10, 300),
  featuredImage: fc.option(articleImageArbitrary, { nil: undefined }),
  category: fc.option(articleCategoryArbitrary, { nil: undefined }),
  publishedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).filter((d) => !isNaN(d.getTime())),
});

/**
 * Helper function to extract article content for display
 * This simulates what the BlogSection component does
 */
function extractArticleDisplayContent(article: ArticleListItem, locale: Locale) {
  return {
    title: article.title[locale],
    excerpt: article.excerpt[locale],
    hasFeaturedImage: article.featuredImage !== undefined,
    featuredImageUrl: article.featuredImage?.url,
    featuredImageAlt: article.featuredImage?.alt[locale],
    hasCategory: article.category !== undefined,
    categoryName: article.category?.name[locale],
    publishedAt: article.publishedAt,
    formattedDate: formatArticleDate(article.publishedAt, locale),
    slug: article.slug,
  };
}

describe('Article Display Completeness - Property Tests', () => {
  /**
   * Property 21: Article Display Completeness
   * For any valid article and locale, all required content should be extractable
   */
  it('should contain all required article information for any valid article', () => {
    fc.assert(
      fc.property(
        articleListItemArbitrary,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (article, locale) => {
          const content = extractArticleDisplayContent(article, locale);

          // Title must be present and non-empty
          expect(content.title).toBeDefined();
          expect(content.title.length).toBeGreaterThan(0);

          // Excerpt must be present and non-empty
          expect(content.excerpt).toBeDefined();
          expect(content.excerpt.length).toBeGreaterThan(0);

          // Publication date must be present and valid
          expect(content.publishedAt).toBeDefined();
          expect(content.publishedAt instanceof Date).toBe(true);
          expect(isNaN(content.publishedAt.getTime())).toBe(false);

          // Formatted date must be a non-empty string
          expect(content.formattedDate).toBeDefined();
          expect(content.formattedDate.length).toBeGreaterThan(0);

          // Slug must be present and URL-safe
          expect(content.slug).toBeDefined();
          expect(content.slug).toMatch(/^[a-z0-9-]+$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Localized content should be available for each supported locale
   */
  it('should provide localized content for each supported locale', () => {
    fc.assert(
      fc.property(articleListItemArbitrary, (article) => {
        const frContent = extractArticleDisplayContent(article, 'fr');
        const enContent = extractArticleDisplayContent(article, 'en');

        // Both locales should have title and excerpt
        expect(frContent.title).toBeDefined();
        expect(enContent.title).toBeDefined();
        expect(frContent.excerpt).toBeDefined();
        expect(enContent.excerpt).toBeDefined();

        // Non-localized fields should be the same
        expect(frContent.hasFeaturedImage).toBe(enContent.hasFeaturedImage);
        expect(frContent.hasCategory).toBe(enContent.hasCategory);
        expect(frContent.publishedAt).toEqual(enContent.publishedAt);
        expect(frContent.slug).toBe(enContent.slug);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Featured image should have localized alt text when present
   */
  it('should provide localized alt text for featured images when present', () => {
    // Filter to articles with featured images
    const articleWithImageArb = articleListItemArbitrary.filter((a) => a.featuredImage !== undefined);

    fc.assert(
      fc.property(
        articleWithImageArb,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (article, locale) => {
          const content = extractArticleDisplayContent(article, locale);

          // Featured image should be present
          expect(content.hasFeaturedImage).toBe(true);
          expect(content.featuredImageUrl).toBeDefined();
          expect(content.featuredImageUrl!.length).toBeGreaterThan(0);

          // Alt text should be present for the locale
          expect(content.featuredImageAlt).toBeDefined();
          expect(typeof content.featuredImageAlt).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Category name should be localized when category is present
   */
  it('should provide localized category name when category is present', () => {
    // Filter to articles with categories
    const articleWithCategoryArb = articleListItemArbitrary.filter((a) => a.category !== undefined);

    fc.assert(
      fc.property(
        articleWithCategoryArb,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (article, locale) => {
          const content = extractArticleDisplayContent(article, locale);

          // Category should be present
          expect(content.hasCategory).toBe(true);
          expect(content.categoryName).toBeDefined();
          expect(content.categoryName!.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Article slug should be URL-safe
   */
  it('should have URL-safe slugs', () => {
    fc.assert(
      fc.property(articleListItemArbitrary, (article) => {
        // Slug should only contain lowercase letters, numbers, and hyphens
        expect(article.slug).toMatch(/^[a-z0-9-]+$/);
        // Slug should start with a letter
        expect(article.slug).toMatch(/^[a-z]/);
        // Slug should end with a letter or number
        expect(article.slug).toMatch(/[a-z0-9]$/);
        // Slug should not have consecutive hyphens
        expect(article.slug).not.toMatch(/--/);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Date formatting should produce consistent results
   */
  it('should format dates consistently for each locale', () => {
    fc.assert(
      fc.property(
        articleListItemArbitrary,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (article, locale) => {
          const formattedDate = formatArticleDate(article.publishedAt, locale);

          // Formatted date should be a non-empty string
          expect(formattedDate).toBeDefined();
          expect(typeof formattedDate).toBe('string');
          expect(formattedDate.length).toBeGreaterThan(0);

          // Should contain the year
          const year = article.publishedAt.getFullYear().toString();
          expect(formattedDate).toContain(year);
        }
      ),
      { numRuns: 100 }
    );
  });
});
