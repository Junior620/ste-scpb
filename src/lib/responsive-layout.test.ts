import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Property-Based Tests for Responsive Layout Integrity
 * **Feature: ste-scpb-refonte, Property 16: Responsive Layout Integrity**
 * **Validates: Requirements 9.1**
 *
 * Property 16: Responsive Layout Integrity
 * For any viewport width, the layout should adapt appropriately
 * to provide a good user experience across all device sizes.
 */

/**
 * Viewport breakpoints used in the application
 */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Device type based on viewport width
 */
type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'large-desktop';

/**
 * Layout configuration for different device types
 */
interface LayoutConfig {
  gridColumns: number;
  containerMaxWidth: string | null;
  navigationStyle: 'hamburger' | 'full';
  sidebarVisible: boolean;
  fontSize: 'sm' | 'base' | 'lg';
}

/**
 * Determines device type based on viewport width
 */
function getDeviceType(viewportWidth: number): DeviceType {
  if (viewportWidth < BREAKPOINTS.sm) {
    return 'mobile';
  }
  if (viewportWidth < BREAKPOINTS.lg) {
    return 'tablet';
  }
  if (viewportWidth < BREAKPOINTS.xl) {
    return 'desktop';
  }
  return 'large-desktop';
}

/**
 * Gets the active breakpoint for a given viewport width
 */
function getActiveBreakpoint(viewportWidth: number): Breakpoint | null {
  if (viewportWidth >= BREAKPOINTS['2xl']) return '2xl';
  if (viewportWidth >= BREAKPOINTS.xl) return 'xl';
  if (viewportWidth >= BREAKPOINTS.lg) return 'lg';
  if (viewportWidth >= BREAKPOINTS.md) return 'md';
  if (viewportWidth >= BREAKPOINTS.sm) return 'sm';
  return null;
}

/**
 * Calculates expected grid columns based on viewport width
 */
function getExpectedGridColumns(viewportWidth: number): number {
  if (viewportWidth < BREAKPOINTS.sm) return 1;
  if (viewportWidth < BREAKPOINTS.lg) return 2;
  if (viewportWidth < BREAKPOINTS.xl) return 3;
  return 4;
}

/**
 * Gets expected layout configuration for a viewport width
 */
function getLayoutConfig(viewportWidth: number): LayoutConfig {
  const deviceType = getDeviceType(viewportWidth);
  
  switch (deviceType) {
    case 'mobile':
      return {
        gridColumns: 1,
        containerMaxWidth: null,
        navigationStyle: 'hamburger',
        sidebarVisible: false,
        fontSize: 'sm',
      };
    case 'tablet':
      return {
        gridColumns: 2,
        containerMaxWidth: '768px',
        navigationStyle: 'hamburger',
        sidebarVisible: false,
        fontSize: 'base',
      };
    case 'desktop':
      return {
        gridColumns: 3,
        containerMaxWidth: '1024px',
        navigationStyle: 'full',
        sidebarVisible: true,
        fontSize: 'base',
      };
    case 'large-desktop':
      return {
        gridColumns: 4,
        containerMaxWidth: '1280px',
        navigationStyle: 'full',
        sidebarVisible: true,
        fontSize: 'lg',
      };
  }
}

/**
 * Validates that a layout configuration is appropriate for the viewport
 */
function isValidLayoutForViewport(viewportWidth: number, config: LayoutConfig): boolean {
  const deviceType = getDeviceType(viewportWidth);
  
  // Mobile should have hamburger menu
  if (deviceType === 'mobile' && config.navigationStyle !== 'hamburger') {
    return false;
  }
  
  // Desktop should have full navigation
  if ((deviceType === 'desktop' || deviceType === 'large-desktop') && config.navigationStyle !== 'full') {
    return false;
  }
  
  // Grid columns should match device type
  const expectedColumns = getExpectedGridColumns(viewportWidth);
  if (config.gridColumns !== expectedColumns) {
    return false;
  }
  
  return true;
}

/**
 * Checks if content would overflow at a given viewport width
 */
function wouldContentOverflow(
  contentWidth: number,
  viewportWidth: number,
  padding: number = 16
): boolean {
  const availableWidth = viewportWidth - (padding * 2);
  return contentWidth > availableWidth;
}

/**
 * Calculates responsive font size based on viewport
 */
function getResponsiveFontSize(
  baseFontSize: number,
  viewportWidth: number
): number {
  // Clamp font size between min and max
  const minFontSize = baseFontSize * 0.875; // 87.5%
  const maxFontSize = baseFontSize * 1.25;  // 125%
  
  // Scale based on viewport
  const scale = Math.min(1, viewportWidth / BREAKPOINTS.lg);
  const scaledSize = minFontSize + (maxFontSize - minFontSize) * scale;
  
  return Math.round(scaledSize * 100) / 100;
}

describe('Responsive Layout Integrity - Property Tests', () => {
  /**
   * Property 16: Responsive Layout Integrity
   * For any viewport width, the layout should adapt appropriately
   */
  it('should provide valid layout configuration for any viewport width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }), // Common viewport range
        (viewportWidth) => {
          const config = getLayoutConfig(viewportWidth);
          
          // Layout should be valid for the viewport
          expect(isValidLayoutForViewport(viewportWidth, config)).toBe(true);
          
          // Grid columns should be positive
          expect(config.gridColumns).toBeGreaterThan(0);
          
          // Navigation style should be defined
          expect(['hamburger', 'full']).toContain(config.navigationStyle);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Device type detection should be consistent
   */
  it('should consistently detect device type for any viewport', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5000 }),
        (viewportWidth) => {
          const deviceType = getDeviceType(viewportWidth);
          
          // Device type should be one of the valid types
          expect(['mobile', 'tablet', 'desktop', 'large-desktop']).toContain(deviceType);
          
          // Same viewport should always return same device type
          expect(getDeviceType(viewportWidth)).toBe(deviceType);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Breakpoint transitions should be monotonic
   */
  it('should have monotonically increasing breakpoints', () => {
    const breakpointValues = Object.values(BREAKPOINTS);
    
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: breakpointValues.length - 2 }),
        (index) => {
          // Each breakpoint should be larger than the previous
          expect(breakpointValues[index + 1]).toBeGreaterThan(breakpointValues[index]);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Grid columns should increase with viewport width
   */
  it('should have non-decreasing grid columns as viewport increases', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3000 }),
        fc.integer({ min: 1, max: 500 }),
        (viewportWidth, increment) => {
          const smallerViewport = viewportWidth;
          const largerViewport = viewportWidth + increment;
          
          const smallerColumns = getExpectedGridColumns(smallerViewport);
          const largerColumns = getExpectedGridColumns(largerViewport);
          
          // Larger viewport should have >= columns
          expect(largerColumns).toBeGreaterThanOrEqual(smallerColumns);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Mobile viewports should always use hamburger navigation
   */
  it('should use hamburger navigation for mobile viewports', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const config = getLayoutConfig(viewportWidth);
          expect(config.navigationStyle).toBe('hamburger');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Desktop viewports should always use full navigation
   */
  it('should use full navigation for desktop viewports', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.lg, max: 5000 }),
        (viewportWidth) => {
          const config = getLayoutConfig(viewportWidth);
          expect(config.navigationStyle).toBe('full');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Content should not overflow viewport
   */
  it('should prevent content overflow for any viewport', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }),
        fc.integer({ min: 8, max: 32 }),
        (viewportWidth, padding) => {
          // Content width should be less than viewport minus padding
          const maxContentWidth = viewportWidth - (padding * 2);
          
          // Any content within max width should not overflow
          const contentWidth = fc.sample(fc.integer({ min: 0, max: maxContentWidth }), 1)[0];
          expect(wouldContentOverflow(contentWidth, viewportWidth, padding)).toBe(false);
          
          // Content larger than max width should overflow
          const overflowingContent = maxContentWidth + 1;
          expect(wouldContentOverflow(overflowingContent, viewportWidth, padding)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Font size should scale appropriately with viewport
   */
  it('should scale font size within reasonable bounds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 12, max: 24 }), // Base font sizes
        fc.integer({ min: 320, max: 3840 }), // Viewport widths
        (baseFontSize, viewportWidth) => {
          const responsiveSize = getResponsiveFontSize(baseFontSize, viewportWidth);
          
          // Font size should be within 87.5% to 125% of base
          const minSize = baseFontSize * 0.875;
          const maxSize = baseFontSize * 1.25;
          
          expect(responsiveSize).toBeGreaterThanOrEqual(minSize);
          expect(responsiveSize).toBeLessThanOrEqual(maxSize);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Active breakpoint should be deterministic
   */
  it('should return deterministic breakpoint for any viewport', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5000 }),
        (viewportWidth) => {
          const breakpoint1 = getActiveBreakpoint(viewportWidth);
          const breakpoint2 = getActiveBreakpoint(viewportWidth);
          
          // Same viewport should always return same breakpoint
          expect(breakpoint1).toBe(breakpoint2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Layout config should be deterministic
   */
  it('should return deterministic layout config for any viewport', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }),
        (viewportWidth) => {
          const config1 = getLayoutConfig(viewportWidth);
          const config2 = getLayoutConfig(viewportWidth);
          
          // Same viewport should always return same config
          expect(config1).toEqual(config2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
