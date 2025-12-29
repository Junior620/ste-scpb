import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * SEO Property-Based Tests
 * Tests for heading hierarchy, image alt text, and URL cleanliness
 */

/**
 * Validates heading hierarchy in HTML content
 * Returns true if headings follow proper H1 → H2 → H3 → ... structure
 */
export function validateHeadingHierarchy(html: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Extract all headings with their levels
  const headingRegex = /<h([1-6])[^>]*>([^<]*)<\/h\1>/gi;
  const headings: { level: number; text: string }[] = [];
  
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1], 10),
      text: match[2].trim(),
    });
  }

  if (headings.length === 0) {
    return { isValid: true, errors: [] };
  }

  // Check that first heading is H1
  if (headings[0].level !== 1) {
    errors.push(`First heading should be H1, found H${headings[0].level}`);
  }

  // Check that there's only one H1
  const h1Count = headings.filter((h) => h.level === 1).length;
  if (h1Count > 1) {
    errors.push(`Page should have only one H1, found ${h1Count}`);
  }

  // Check that heading levels don't skip (e.g., H1 → H3 without H2)
  for (let i = 1; i < headings.length; i++) {
    const prevLevel = headings[i - 1].level;
    const currLevel = headings[i].level;
    
    // Can go down any number of levels (H2 → H1 is ok for new section)
    // But can only go up by 1 level at a time (H1 → H2 ok, H1 → H3 not ok)
    if (currLevel > prevLevel + 1) {
      errors.push(
        `Heading level skipped from H${prevLevel} to H${currLevel} at "${headings[i].text}"`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates that all images have alt attributes
 */
export function validateImageAltText(html: string): {
  isValid: boolean;
  imagesWithoutAlt: string[];
} {
  const imagesWithoutAlt: string[] = [];
  
  // Find all img tags
  const imgRegex = /<img([^>]*)>/gi;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const attributes = match[1];
    
    // Check if alt attribute exists
    const hasAlt = /\balt\s*=\s*["'][^"']*["']/i.test(attributes);
    
    if (!hasAlt) {
      // Extract src for identification
      const srcMatch = /\bsrc\s*=\s*["']([^"']*)["']/i.exec(attributes);
      const src = srcMatch ? srcMatch[1] : 'unknown';
      imagesWithoutAlt.push(src);
    }
  }

  return {
    isValid: imagesWithoutAlt.length === 0,
    imagesWithoutAlt,
  };
}

/**
 * Validates URL cleanliness
 * Clean URLs should:
 * - Be lowercase
 * - Use hyphens instead of underscores
 * - Not have file extensions (except allowed ones)
 * - Not have special characters
 */
export function validateUrlCleanliness(url: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Parse URL to get pathname
  let pathname: string;
  try {
    const urlObj = new URL(url, 'https://example.com');
    pathname = urlObj.pathname;
  } catch {
    errors.push('Invalid URL format');
    return { isValid: false, errors };
  }

  // Check for uppercase letters
  if (pathname !== pathname.toLowerCase()) {
    errors.push('URL should be lowercase');
  }

  // Check for underscores (should use hyphens)
  if (pathname.includes('_')) {
    errors.push('URL should use hyphens instead of underscores');
  }

  // Check for file extensions (except for specific allowed ones)
  const allowedExtensions = ['.xml', '.json', '.txt'];
  const extensionMatch = pathname.match(/\.[a-z]{2,4}$/i);
  if (extensionMatch) {
    const ext = extensionMatch[0].toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      errors.push('URL should not have file extensions');
    }
  }

  // Check for special characters (except hyphens, slashes, dots for extensions)
  const pathnameWithoutExtension = pathname.replace(/\.[a-z]{2,4}$/i, '');
  const pathnameSegments = pathnameWithoutExtension.split('/').filter(Boolean);
  for (const segment of pathnameSegments) {
    if (!/^[a-z0-9-]+$/i.test(segment)) {
      errors.push('URL contains special characters');
      break;
    }
  }

  // Check for double slashes
  if (pathname.includes('//')) {
    errors.push('URL should not have double slashes');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Property-Based Tests for Heading Hierarchy
 * **Feature: ste-scpb-refonte, Property 9: Heading Hierarchy Validity**
 * **Validates: Requirements 10.1**
 */
describe('Heading Hierarchy Validity - Property Tests', () => {
  // Arbitrary for valid heading content
  const headingTextArb = fc.string({ minLength: 1, maxLength: 50 })
    .filter((s) => !s.includes('<') && !s.includes('>'));

  /**
   * Property 9: Heading Hierarchy Validity
   * For any valid heading structure, validation should pass
   */
  it('should validate correct heading hierarchy', () => {
    fc.assert(
      fc.property(
        headingTextArb,
        fc.array(headingTextArb, { minLength: 0, maxLength: 5 }),
        fc.array(headingTextArb, { minLength: 0, maxLength: 5 }),
        (h1Text, h2Texts, h3Texts) => {
          // Build valid HTML with proper hierarchy
          let html = `<h1>${h1Text}</h1>`;
          
          h2Texts.forEach((h2Text, i) => {
            html += `<h2>${h2Text}</h2>`;
            // Add some H3s under each H2
            if (i < h3Texts.length) {
              html += `<h3>${h3Texts[i]}</h3>`;
            }
          });

          const result = validateHeadingHierarchy(html);
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple H1s should be invalid
   */
  it('should detect multiple H1 headings as invalid', () => {
    fc.assert(
      fc.property(
        headingTextArb,
        headingTextArb,
        (h1Text1, h1Text2) => {
          const html = `<h1>${h1Text1}</h1><h1>${h1Text2}</h1>`;
          const result = validateHeadingHierarchy(html);
          
          expect(result.isValid).toBe(false);
          expect(result.errors.some((e) => e.includes('only one H1'))).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Skipped heading levels should be invalid
   */
  it('should detect skipped heading levels as invalid', () => {
    fc.assert(
      fc.property(headingTextArb, headingTextArb, (h1Text, h3Text) => {
        // H1 directly to H3 (skipping H2)
        const html = `<h1>${h1Text}</h1><h3>${h3Text}</h3>`;
        const result = validateHeadingHierarchy(html);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.includes('skipped'))).toBe(true);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Empty content should be valid
   */
  it('should validate empty content as valid', () => {
    const result = validateHeadingHierarchy('');
    expect(result.isValid).toBe(true);
  });
});

/**
 * Property-Based Tests for Image Alt Text
 * **Feature: ste-scpb-refonte, Property 8: Image Alt Text Presence**
 * **Validates: Requirements 10.6, 13.5**
 */
describe('Image Alt Text Presence - Property Tests', () => {
  const srcArb = fc.webUrl();
  // Alt text should not contain characters that break HTML
  const altTextArb = fc.string({ minLength: 1, maxLength: 100 })
    .filter((s) => !s.includes('"') && !s.includes("'") && !s.includes('<') && !s.includes('>') && !s.includes('&'));

  /**
   * Property 8: Image Alt Text Presence
   * For any image with alt attribute, validation should pass
   */
  it('should validate images with alt text as valid', () => {
    fc.assert(
      fc.property(srcArb, altTextArb, (src, alt) => {
        const html = `<img src="${src}" alt="${alt}" />`;
        const result = validateImageAltText(html);
        
        expect(result.isValid).toBe(true);
        expect(result.imagesWithoutAlt).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Images without alt should be detected
   */
  it('should detect images without alt text', () => {
    fc.assert(
      fc.property(srcArb, (src) => {
        const html = `<img src="${src}" />`;
        const result = validateImageAltText(html);
        
        expect(result.isValid).toBe(false);
        expect(result.imagesWithoutAlt.length).toBeGreaterThan(0);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Multiple images should all be validated
   */
  it('should validate all images in content', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(srcArb, altTextArb), { minLength: 1, maxLength: 5 }),
        (images) => {
          const html = images
            .map(([src, alt]) => `<img src="${src}" alt="${alt}" />`)
            .join('');
          
          const result = validateImageAltText(html);
          expect(result.isValid).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Empty alt is still valid (for decorative images)
   */
  it('should accept empty alt attribute for decorative images', () => {
    fc.assert(
      fc.property(srcArb, (src) => {
        const html = `<img src="${src}" alt="" />`;
        const result = validateImageAltText(html);
        
        expect(result.isValid).toBe(true);
      }),
      { numRuns: 50 }
    );
  });
});

/**
 * Property-Based Tests for URL Cleanliness
 * **Feature: ste-scpb-refonte, Property 11: URL Cleanliness**
 * **Validates: Requirements 10.3**
 */
describe('URL Cleanliness - Property Tests', () => {
  // Arbitrary for clean URL segments
  const cleanSegmentArb = fc.stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    .filter((s) => s.length > 0 && s.length <= 50);

  /**
   * Property 11: URL Cleanliness
   * For any clean URL, validation should pass
   */
  it('should validate clean URLs', () => {
    fc.assert(
      fc.property(
        fc.array(cleanSegmentArb, { minLength: 1, maxLength: 4 }),
        (segments) => {
          const url = `https://example.com/${segments.join('/')}`;
          const result = validateUrlCleanliness(url);
          
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: URLs with uppercase should be invalid
   */
  it('should detect uppercase in URLs', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Z][a-z]+$/),
        (segment) => {
          const url = `https://example.com/${segment}`;
          const result = validateUrlCleanliness(url);
          
          expect(result.isValid).toBe(false);
          expect(result.errors.some((e) => e.includes('lowercase'))).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: URLs with underscores should be invalid
   */
  it('should detect underscores in URLs', () => {
    fc.assert(
      fc.property(cleanSegmentArb, cleanSegmentArb, (seg1, seg2) => {
        const url = `https://example.com/${seg1}_${seg2}`;
        const result = validateUrlCleanliness(url);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.includes('hyphens'))).toBe(true);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Root URL should be valid
   */
  it('should validate root URL as valid', () => {
    const result = validateUrlCleanliness('https://example.com/');
    expect(result.isValid).toBe(true);
  });

  /**
   * Property: URLs with allowed extensions should be valid
   */
  it('should allow specific file extensions', () => {
    const allowedExtensions = ['.xml', '.json', '.txt'];
    
    for (const ext of allowedExtensions) {
      const result = validateUrlCleanliness(`https://example.com/file${ext}`);
      expect(result.isValid).toBe(true);
    }
  });
});
