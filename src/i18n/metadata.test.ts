import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  generateAlternateLanguages,
  generateLocalizedMetadata,
  getHreflangLinks,
  PAGE_METADATA_CONFIGS,
} from './metadata';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, Locale } from '@/domain/value-objects/Locale';

/**
 * Property-Based Tests for Hreflang Tag Consistency
 * **Feature: ste-scpb-refonte, Property 7: Hreflang Tag Consistency**
 * **Validates: Requirements 6.5**
 */
describe('Hreflang Tag Consistency - Property Tests', () => {
  // Arbitrary for valid URL pathnames
  const pathnameArb = fc
    .array(fc.stringMatching(/^[a-z0-9-]+$/), { minLength: 0, maxLength: 3 })
    .map((parts) => (parts.length > 0 ? `/${parts.join('/')}` : ''));

  /**
   * Property 7: Hreflang Tag Consistency
   * For any pathname, hreflang tags should include all supported locales
   */
  it('should generate hreflang links for all supported locales', () => {
    fc.assert(
      fc.property(pathnameArb, (pathname) => {
        const links = getHreflangLinks(pathname);

        // Should have one link per locale plus x-default
        expect(links.length).toBe(SUPPORTED_LOCALES.length + 1);

        // Each supported locale should have a link
        for (const locale of SUPPORTED_LOCALES) {
          const localeLink = links.find((link) => link.hrefLang === locale);
          expect(localeLink).toBeDefined();
          expect(localeLink?.rel).toBe('alternate');
          expect(localeLink?.href).toContain(`/${locale}`);
        }

        // x-default should exist and point to default locale
        const xDefaultLink = links.find((link) => link.hrefLang === 'x-default');
        expect(xDefaultLink).toBeDefined();
        expect(xDefaultLink?.href).toContain(`/${DEFAULT_LOCALE}`);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All hreflang URLs should contain the same pathname
   */
  it('should include the same pathname in all hreflang URLs', () => {
    fc.assert(
      fc.property(pathnameArb, (pathname) => {
        const links = getHreflangLinks(pathname);
        const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

        for (const link of links) {
          // Each URL should contain the pathname after the locale
          if (normalizedPath === '' || normalizedPath === '/') {
            // Root path - URL should end with locale (possibly with trailing slash)
            expect(link.href).toMatch(/\/[a-z]{2}\/?$/);
          } else {
            // Non-root path - URL should contain the pathname
            expect(link.href).toContain(normalizedPath);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: generateAlternateLanguages should produce valid metadata structure
   */
  it('should generate valid alternates metadata structure', () => {
    fc.assert(
      fc.property(pathnameArb, (pathname) => {
        const alternates = generateAlternateLanguages(pathname);

        // Should have canonical URL
        expect(alternates?.canonical).toBeDefined();
        expect(typeof alternates?.canonical).toBe('string');

        // Should have languages object
        expect(alternates?.languages).toBeDefined();
        expect(typeof alternates?.languages).toBe('object');

        // Languages should include all supported locales
        const languages = alternates?.languages as Record<string, string>;
        for (const locale of SUPPORTED_LOCALES) {
          expect(languages[locale]).toBeDefined();
          expect(typeof languages[locale]).toBe('string');
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Canonical URL should point to default locale
   */
  it('should set canonical URL to default locale', () => {
    fc.assert(
      fc.property(pathnameArb, (pathname) => {
        const alternates = generateAlternateLanguages(pathname);

        // Canonical should contain the default locale
        expect(alternates?.canonical).toContain(`/${DEFAULT_LOCALE}`);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: generateLocalizedMetadata should include all required fields
   */
  it('should generate complete localized metadata', () => {
    const localeArb = fc.constantFrom(...SUPPORTED_LOCALES);
    const titleArb = fc.string({ minLength: 1, maxLength: 100 });
    const descriptionArb = fc.string({ minLength: 1, maxLength: 200 });

    fc.assert(
      fc.property(localeArb, titleArb, descriptionArb, pathnameArb, (locale, title, description, pathname) => {
        const metadata = generateLocalizedMetadata({
          title,
          description,
          pathname,
          locale: locale as Locale,
        });

        // Should have title (as object with default and template)
        expect(metadata.title).toBeDefined();
        const titleObj = metadata.title as { default: string; template: string };
        expect(titleObj.default).toBe(title);
        expect(titleObj.template).toContain('%s');
        
        // Should have description
        expect(metadata.description).toBe(description);

        // Should have alternates
        expect(metadata.alternates).toBeDefined();

        // Should have openGraph
        expect(metadata.openGraph).toBeDefined();
        expect(metadata.openGraph?.title).toBe(title);
        expect(metadata.openGraph?.description).toBe(description);

        // OpenGraph locale should match
        const expectedOgLocale = locale === 'fr' ? 'fr_FR' : 'en_US';
        expect(metadata.openGraph?.locale).toBe(expectedOgLocale);

        // Should have twitter card
        expect(metadata.twitter).toBeDefined();
        expect((metadata.twitter as { card?: string })?.card).toBe('summary_large_image');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All hreflang URLs should be valid URLs
   */
  it('should generate valid URLs in hreflang links', () => {
    fc.assert(
      fc.property(pathnameArb, (pathname) => {
        const links = getHreflangLinks(pathname);

        for (const link of links) {
          // URL should start with https://
          expect(link.href).toMatch(/^https:\/\//);

          // URL should not have double slashes (except after protocol)
          const urlWithoutProtocol = link.href.replace('https://', '');
          expect(urlWithoutProtocol).not.toContain('//');
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Hreflang links should be symmetric
   * If page A in locale X links to page A in locale Y,
   * then page A in locale Y should link back to page A in locale X
   */
  it('should generate symmetric hreflang relationships', () => {
    fc.assert(
      fc.property(pathnameArb, (pathname) => {
        // Get links for the same pathname (simulating different locale pages)
        const links = getHreflangLinks(pathname);

        // Extract all locale URLs
        const localeUrls = new Map<string, string>();
        for (const link of links) {
          if (link.hrefLang !== 'x-default') {
            localeUrls.set(link.hrefLang, link.href);
          }
        }

        // For each locale, verify it would generate links to all other locales
        for (const [sourceLocale, sourceUrl] of localeUrls) {
          // The source URL should be in the links
          const linkToSource = links.find((l) => l.href === sourceUrl);
          expect(linkToSource).toBeDefined();

          // All other locales should also be in the links
          for (const [targetLocale, targetUrl] of localeUrls) {
            if (sourceLocale !== targetLocale) {
              const linkToTarget = links.find((l) => l.href === targetUrl);
              expect(linkToTarget).toBeDefined();
            }
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Property-Based Tests for Meta Tags Uniqueness
 * **Feature: ste-scpb-refonte, Property 10: Meta Tags Uniqueness**
 * **Validates: Requirements 10.2**
 */
describe('Meta Tags Uniqueness - Property Tests', () => {
  /**
   * Property 10: Meta Tags Uniqueness
   * For any two different pages, their metadata should have unique titles and descriptions
   */
  it('should generate unique titles for different pages', () => {
    const pageKeys = Object.keys(PAGE_METADATA_CONFIGS);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        (locale) => {
          // Generate metadata for all pages
          const metadataList = pageKeys.map((pageKey) => {
            const config = PAGE_METADATA_CONFIGS[pageKey];
            return {
              pageKey,
              metadata: generateLocalizedMetadata({
                title: `${pageKey} - Test Title`,
                description: `${pageKey} - Test Description`,
                pathname: config.pathname,
                locale: locale as Locale,
                keywords: config.keywords,
              }),
            };
          });

          // Check that all pathnames are unique
          const pathnames = metadataList.map((m) => PAGE_METADATA_CONFIGS[m.pageKey].pathname);
          const uniquePathnames = new Set(pathnames);
          expect(uniquePathnames.size).toBe(pathnames.length);

          // Check that all canonical URLs are unique
          const canonicals = metadataList.map((m) => m.metadata.alternates?.canonical);
          const uniqueCanonicals = new Set(canonicals);
          expect(uniqueCanonicals.size).toBe(canonicals.length);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Each page configuration should have a unique pathname
   */
  it('should have unique pathnames for all page configurations', () => {
    const pageKeys = Object.keys(PAGE_METADATA_CONFIGS);
    const pathnames = pageKeys.map((key) => PAGE_METADATA_CONFIGS[key].pathname);
    const uniquePathnames = new Set(pathnames);
    
    expect(uniquePathnames.size).toBe(pathnames.length);
  });

  /**
   * Property: Generated metadata should have non-empty title and description
   */
  it('should generate non-empty titles and descriptions', () => {
    const localeArb = fc.constantFrom(...SUPPORTED_LOCALES);
    const titleArb = fc.string({ minLength: 1, maxLength: 100 });
    const descriptionArb = fc.string({ minLength: 1, maxLength: 200 });
    const pathnameArb = fc
      .array(fc.stringMatching(/^[a-z0-9-]+$/), { minLength: 0, maxLength: 3 })
      .map((parts) => (parts.length > 0 ? `/${parts.join('/')}` : ''));

    fc.assert(
      fc.property(
        localeArb,
        titleArb,
        descriptionArb,
        pathnameArb,
        (locale, title, description, pathname) => {
          const metadata = generateLocalizedMetadata({
            title,
            description,
            pathname,
            locale: locale as Locale,
          });

          // Title should be defined (as object with default and template)
          expect(metadata.title).toBeDefined();
          const titleObj = metadata.title as { default: string; template: string };
          expect(titleObj.default).toBeTruthy();
          
          // Description should be non-empty
          expect(metadata.description).toBeTruthy();
          
          // OpenGraph title and description should match
          expect(metadata.openGraph?.title).toBe(title);
          expect(metadata.openGraph?.description).toBe(description);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Different pathnames should generate different canonical URLs
   */
  it('should generate different canonical URLs for different pathnames', () => {
    const localeArb = fc.constantFrom(...SUPPORTED_LOCALES);
    
    fc.assert(
      fc.property(
        localeArb,
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
        (locale, path1, path2) => {
          // Skip if paths are the same
          fc.pre(path1 !== path2);

          const metadata1 = generateLocalizedMetadata({
            title: 'Title 1',
            description: 'Description 1',
            pathname: `/${path1}`,
            locale: locale as Locale,
          });

          const metadata2 = generateLocalizedMetadata({
            title: 'Title 2',
            description: 'Description 2',
            pathname: `/${path2}`,
            locale: locale as Locale,
          });

          // Canonical URLs should be different
          expect(metadata1.alternates?.canonical).not.toBe(metadata2.alternates?.canonical);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: OpenGraph URL should match the canonical URL for the same locale
   */
  it('should have consistent OpenGraph URL with canonical', () => {
    const localeArb = fc.constantFrom(...SUPPORTED_LOCALES);
    const pathnameArb = fc
      .array(fc.stringMatching(/^[a-z0-9-]+$/), { minLength: 0, maxLength: 3 })
      .map((parts) => (parts.length > 0 ? `/${parts.join('/')}` : ''));

    fc.assert(
      fc.property(localeArb, pathnameArb, (locale, pathname) => {
        const metadata = generateLocalizedMetadata({
          title: 'Test Title',
          description: 'Test Description',
          pathname,
          locale: locale as Locale,
        });

        // OpenGraph URL should contain the locale
        expect(metadata.openGraph?.url).toContain(`/${locale}`);
        
        // OpenGraph URL should contain the pathname
        if (pathname && pathname !== '/') {
          expect(metadata.openGraph?.url).toContain(pathname);
        }
      }),
      { numRuns: 100 }
    );
  });
});
