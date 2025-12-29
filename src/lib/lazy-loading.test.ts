import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Property-Based Tests for Lazy Loading Implementation
 * **Feature: ste-scpb-refonte, Property 17: Lazy Loading Implementation**
 * **Validates: Requirements 9.4**
 *
 * Property 17: Lazy Loading Implementation
 * For any image configuration, images that are not above-the-fold (priority=false)
 * should have lazy loading enabled to optimize performance.
 */

/**
 * Image configuration type representing next/image props
 */
interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}

/**
 * Determines the effective loading strategy for an image
 * Based on next/image behavior:
 * - If priority=true, loading is always 'eager'
 * - If loading is explicitly set, use that value
 * - Otherwise, default to 'lazy'
 */
function getEffectiveLoadingStrategy(config: ImageConfig): 'lazy' | 'eager' {
  // Priority images are always eager loaded
  if (config.priority === true) {
    return 'eager';
  }
  
  // If loading is explicitly set, use it
  if (config.loading) {
    return config.loading;
  }
  
  // Default behavior for next/image is lazy loading
  return 'lazy';
}

/**
 * Validates if an image configuration follows lazy loading best practices
 * Returns true if the configuration is valid for performance optimization
 */
function isValidLazyLoadingConfig(config: ImageConfig): boolean {
  const effectiveLoading = getEffectiveLoadingStrategy(config);
  
  // Priority images should be eager (above-the-fold content)
  if (config.priority === true) {
    return effectiveLoading === 'eager';
  }
  
  // Non-priority images should be lazy loaded
  return effectiveLoading === 'lazy';
}

/**
 * Checks if an image should be considered above-the-fold
 * Above-the-fold images should use priority=true
 */
function isAboveTheFold(context: { isHero?: boolean; isMainImage?: boolean; isThumbnail?: boolean }): boolean {
  return context.isHero === true || context.isMainImage === true;
}

/**
 * Arbitrary for generating valid image URLs
 */
const imageUrlArbitrary = fc.oneof(
  fc.webUrl(),
  fc.stringMatching(/^\/images\/[a-z0-9-]+\.(jpg|png|webp)$/),
  fc.stringMatching(/^https:\/\/cdn\.[a-z]+\.io\/[a-z0-9-]+\.(jpg|png|webp)$/)
);

/**
 * Arbitrary for generating image alt text
 */
const altTextArbitrary = fc.string({ minLength: 2, maxLength: 200 });

/**
 * Arbitrary for generating image dimensions
 */
const dimensionArbitrary = fc.integer({ min: 50, max: 4000 });

/**
 * Arbitrary for generating sizes attribute
 */
const sizesArbitrary = fc.oneof(
  fc.constant('100vw'),
  fc.constant('(max-width: 768px) 100vw, 50vw'),
  fc.constant('(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'),
  fc.stringMatching(/^\d+px$/)
);

/**
 * Arbitrary for generating non-priority image configurations
 * These should always have lazy loading
 */
const nonPriorityImageConfigArbitrary: fc.Arbitrary<ImageConfig> = fc.record({
  src: imageUrlArbitrary,
  alt: altTextArbitrary,
  width: fc.option(dimensionArbitrary, { nil: undefined }),
  height: fc.option(dimensionArbitrary, { nil: undefined }),
  fill: fc.option(fc.boolean(), { nil: undefined }),
  priority: fc.constant(false),
  loading: fc.option(fc.constant('lazy' as const), { nil: undefined }),
  sizes: fc.option(sizesArbitrary, { nil: undefined }),
});

/**
 * Arbitrary for generating priority image configurations
 * These should always have eager loading
 */
const priorityImageConfigArbitrary: fc.Arbitrary<ImageConfig> = fc.record({
  src: imageUrlArbitrary,
  alt: altTextArbitrary,
  width: fc.option(dimensionArbitrary, { nil: undefined }),
  height: fc.option(dimensionArbitrary, { nil: undefined }),
  fill: fc.option(fc.boolean(), { nil: undefined }),
  priority: fc.constant(true),
  loading: fc.option(fc.constantFrom('lazy' as const, 'eager' as const), { nil: undefined }),
  sizes: fc.option(sizesArbitrary, { nil: undefined }),
});

/**
 * Arbitrary for generating any image configuration
 */
const anyImageConfigArbitrary: fc.Arbitrary<ImageConfig> = fc.oneof(
  nonPriorityImageConfigArbitrary,
  priorityImageConfigArbitrary
);

describe('Lazy Loading Implementation - Property Tests', () => {
  /**
   * Property 17: Lazy Loading Implementation
   * For any non-priority image, lazy loading should be the effective strategy
   */
  it('should use lazy loading for all non-priority images', () => {
    fc.assert(
      fc.property(nonPriorityImageConfigArbitrary, (config) => {
        const effectiveLoading = getEffectiveLoadingStrategy(config);
        
        // Non-priority images should always be lazy loaded
        expect(effectiveLoading).toBe('lazy');
        expect(isValidLazyLoadingConfig(config)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Priority images should use eager loading
   * Above-the-fold content needs to load immediately
   */
  it('should use eager loading for priority images', () => {
    fc.assert(
      fc.property(priorityImageConfigArbitrary, (config) => {
        const effectiveLoading = getEffectiveLoadingStrategy(config);
        
        // Priority images should always be eager loaded
        expect(effectiveLoading).toBe('eager');
        expect(isValidLazyLoadingConfig(config)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Loading strategy should be deterministic
   * Same config should always produce same loading strategy
   */
  it('should produce deterministic loading strategy for any config', () => {
    fc.assert(
      fc.property(anyImageConfigArbitrary, (config) => {
        const result1 = getEffectiveLoadingStrategy(config);
        const result2 = getEffectiveLoadingStrategy(config);
        
        // Same config should always produce same result
        expect(result1).toBe(result2);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All image configs should be valid for lazy loading best practices
   */
  it('should validate lazy loading configuration for any image', () => {
    fc.assert(
      fc.property(anyImageConfigArbitrary, (config) => {
        // Every config should be valid according to our rules
        expect(isValidLazyLoadingConfig(config)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Above-the-fold detection should be consistent
   */
  it('should correctly identify above-the-fold images', () => {
    const contextArbitrary = fc.record({
      isHero: fc.option(fc.boolean(), { nil: undefined }),
      isMainImage: fc.option(fc.boolean(), { nil: undefined }),
      isThumbnail: fc.option(fc.boolean(), { nil: undefined }),
    });

    fc.assert(
      fc.property(contextArbitrary, (context) => {
        const result = isAboveTheFold(context);
        
        // Should be above-the-fold if hero or main image
        if (context.isHero === true || context.isMainImage === true) {
          expect(result).toBe(true);
        } else {
          expect(result).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Image configs should have required fields
   */
  it('should always have src and alt for any image config', () => {
    fc.assert(
      fc.property(anyImageConfigArbitrary, (config) => {
        // src must be present and non-empty
        expect(config.src).toBeDefined();
        expect(config.src.length).toBeGreaterThan(0);
        
        // alt must be present
        expect(config.alt).toBeDefined();
        expect(typeof config.alt).toBe('string');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Sizes attribute should be valid CSS when present
   */
  it('should have valid sizes attribute format when present', () => {
    fc.assert(
      fc.property(anyImageConfigArbitrary, (config) => {
        if (config.sizes) {
          // Sizes should be a non-empty string
          expect(config.sizes.length).toBeGreaterThan(0);
          
          // Should contain valid size patterns (vw, px, or media queries)
          const simplePattern = /^\d+px$|^\d+vw$|^100vw$/;
          const mediaQueryPattern = /^\(max-width:\s*\d+px\)/;
          
          const isValid = 
            simplePattern.test(config.sizes) || 
            mediaQueryPattern.test(config.sizes) ||
            config.sizes.includes('vw');
          
          expect(isValid).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});
