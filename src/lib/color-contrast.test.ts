/**
 * Property-Based Tests for Color Contrast Compliance
 * **Feature: ste-scpb-refonte, Property 15: Color Contrast Compliance**
 * **Validates: Requirements 13.3**
 *
 * Property: For any text/background color combination in the design system,
 * the contrast ratio must meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text).
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  hexToRgb,
  getRelativeLuminance,
  getContrastRatio,
  meetsWcagAA,
  meetsWcagAALargeText,
  WCAG_AA_NORMAL_TEXT,
  WCAG_AA_LARGE_TEXT,
  DESIGN_COLORS,
  REQUIRED_CONTRAST_PAIRS,
} from './color-contrast';

describe('Property 15: Color Contrast Compliance', () => {
  /**
   * Property: For any valid hex color, parsing should produce valid RGB values
   */
  it('should parse any valid hex color to RGB values in range [0, 255]', () => {
    // Generate valid hex colors
    const hexColorArb = fc.tuple(
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 })
    ).map(([r, g, b]) => {
      const toHex = (n: number) => n.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    });

    fc.assert(
      fc.property(hexColorArb, (hex) => {
        const rgb = hexToRgb(hex);
        expect(rgb).not.toBeNull();
        expect(rgb!.r).toBeGreaterThanOrEqual(0);
        expect(rgb!.r).toBeLessThanOrEqual(255);
        expect(rgb!.g).toBeGreaterThanOrEqual(0);
        expect(rgb!.g).toBeLessThanOrEqual(255);
        expect(rgb!.b).toBeGreaterThanOrEqual(0);
        expect(rgb!.b).toBeLessThanOrEqual(255);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Relative luminance should always be between 0 and 1
   */
  it('should calculate relative luminance in range [0, 1]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        (r, g, b) => {
          const luminance = getRelativeLuminance(r, g, b);
          expect(luminance).toBeGreaterThanOrEqual(0);
          expect(luminance).toBeLessThanOrEqual(1);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Contrast ratio should always be between 1 and 21
   */
  it('should calculate contrast ratio in range [1, 21]', () => {
    const hexColorArb = fc.tuple(
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 })
    ).map(([r, g, b]) => {
      const toHex = (n: number) => n.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    });

    fc.assert(
      fc.property(hexColorArb, hexColorArb, (color1, color2) => {
        const ratio = getContrastRatio(color1, color2);
        expect(ratio).toBeGreaterThanOrEqual(1);
        expect(ratio).toBeLessThanOrEqual(21);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Contrast ratio should be symmetric (A vs B = B vs A)
   */
  it('should have symmetric contrast ratio', () => {
    const hexColorArb = fc.tuple(
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 })
    ).map(([r, g, b]) => {
      const toHex = (n: number) => n.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    });

    fc.assert(
      fc.property(hexColorArb, hexColorArb, (color1, color2) => {
        const ratio1 = getContrastRatio(color1, color2);
        const ratio2 = getContrastRatio(color2, color1);
        expect(ratio1).toBeCloseTo(ratio2, 10);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Same color should have contrast ratio of 1
   */
  it('should have contrast ratio of 1 for identical colors', () => {
    const hexColorArb = fc.tuple(
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 })
    ).map(([r, g, b]) => {
      const toHex = (n: number) => n.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    });

    fc.assert(
      fc.property(hexColorArb, (color) => {
        const ratio = getContrastRatio(color, color);
        expect(ratio).toBeCloseTo(1, 10);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Black and white should have maximum contrast (21:1)
   */
  it('should have maximum contrast between black and white', () => {
    const ratio = getContrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 1);
  });

  /**
   * Property: All design system color pairs must meet WCAG AA standards
   * This is the main property that validates Requirements 13.3
   */
  it('should meet WCAG AA for all required design system color pairs', () => {
    for (const pair of REQUIRED_CONTRAST_PAIRS) {
      const foreground = DESIGN_COLORS[pair.foreground];
      const background = DESIGN_COLORS[pair.background];
      const ratio = getContrastRatio(foreground, background);
      const requiredRatio = pair.isLargeText ? WCAG_AA_LARGE_TEXT : WCAG_AA_NORMAL_TEXT;
      
      expect(
        ratio,
        `${pair.name}: ${foreground} on ${background} has ratio ${ratio.toFixed(2)}, needs ${requiredRatio}`
      ).toBeGreaterThanOrEqual(requiredRatio);
    }
  });

  /**
   * Property: meetsWcagAA should return true only when ratio >= 4.5
   */
  it('should correctly determine WCAG AA compliance', () => {
    const hexColorArb = fc.tuple(
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 })
    ).map(([r, g, b]) => {
      const toHex = (n: number) => n.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    });

    fc.assert(
      fc.property(hexColorArb, hexColorArb, (color1, color2) => {
        const ratio = getContrastRatio(color1, color2);
        const passes = meetsWcagAA(color1, color2);
        
        if (ratio >= WCAG_AA_NORMAL_TEXT) {
          expect(passes).toBe(true);
        } else {
          expect(passes).toBe(false);
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: meetsWcagAALargeText should return true only when ratio >= 3.0
   */
  it('should correctly determine WCAG AA large text compliance', () => {
    const hexColorArb = fc.tuple(
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 })
    ).map(([r, g, b]) => {
      const toHex = (n: number) => n.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    });

    fc.assert(
      fc.property(hexColorArb, hexColorArb, (color1, color2) => {
        const ratio = getContrastRatio(color1, color2);
        const passes = meetsWcagAALargeText(color1, color2);
        
        if (ratio >= WCAG_AA_LARGE_TEXT) {
          expect(passes).toBe(true);
        } else {
          expect(passes).toBe(false);
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Unit tests for specific color combinations
 */
describe('Design System Color Contrast Unit Tests', () => {
  it('foreground on background should meet WCAG AA', () => {
    expect(meetsWcagAA(DESIGN_COLORS.foreground, DESIGN_COLORS.background)).toBe(true);
  });

  it('muted foreground on background should meet WCAG AA', () => {
    expect(meetsWcagAA(DESIGN_COLORS.foregroundMuted, DESIGN_COLORS.background)).toBe(true);
  });

  it('primary on background should meet WCAG AA for large text', () => {
    expect(meetsWcagAALargeText(DESIGN_COLORS.primary, DESIGN_COLORS.background)).toBe(true);
  });

  it('accent on background should meet WCAG AA', () => {
    expect(meetsWcagAA(DESIGN_COLORS.accent, DESIGN_COLORS.background)).toBe(true);
  });

  it('primary button text should meet WCAG AA', () => {
    expect(meetsWcagAA(DESIGN_COLORS.primaryForeground, DESIGN_COLORS.primary)).toBe(true);
  });

  it('secondary button text should meet WCAG AA', () => {
    expect(meetsWcagAA(DESIGN_COLORS.secondaryForeground, DESIGN_COLORS.secondary)).toBe(true);
  });

  it('error text on background should meet WCAG AA', () => {
    expect(meetsWcagAA(DESIGN_COLORS.error, DESIGN_COLORS.background)).toBe(true);
  });

  it('success text on background should meet WCAG AA', () => {
    expect(meetsWcagAA(DESIGN_COLORS.success, DESIGN_COLORS.background)).toBe(true);
  });
});
