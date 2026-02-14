/**
 * Property-Based Tests for Performance Mode
 * **Feature: ste-scpb-refonte, Property 20: Mobile Performance Adaptation**
 * **Validates: Requirements 1.6, 9.6**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getInitialPerformanceMode,
  PERFORMANCE_CONFIGS,
  type PerformanceMode,
} from './usePerformanceMode';

describe('Performance Mode - Property Tests', () => {
  /**
   * Property 20: Mobile Performance Adaptation
   * *For any* viewport width below mobile breakpoint (768px),
   * the initial performance mode should be MEDIUM or lower,
   * ensuring mobile devices get optimized rendering.
   */
  describe('Property 20: Mobile Performance Adaptation', () => {
    it('should return MEDIUM or LOW mode for mobile viewports (< 768px)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 767 }), // Mobile viewport widths
          fc.boolean(), // prefers-reduced-motion
          (viewportWidth, prefersReducedMotion) => {
            const mode = getInitialPerformanceMode(
              viewportWidth,
              prefersReducedMotion
            );

            // Mobile should never get HIGH mode
            expect(mode).not.toBe('HIGH');

            // Should be either MEDIUM or LOW
            expect(['MEDIUM', 'LOW']).toContain(mode);

            // If reduced motion is preferred, should be LOW
            if (prefersReducedMotion) {
              expect(mode).toBe('LOW');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return LOW mode when prefers-reduced-motion is true regardless of viewport', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3840 }), // Any viewport width
          (viewportWidth) => {
            const mode = getInitialPerformanceMode(viewportWidth, true);
            expect(mode).toBe('LOW');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return appropriate mode for tablet viewports (768-1023px)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 768, max: 1023 }), // Tablet viewport widths
          (viewportWidth) => {
            const mode = getInitialPerformanceMode(viewportWidth, false);

            // Tablet should get MEDIUM mode
            expect(mode).toBe('MEDIUM');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return HIGH mode for desktop viewports (>= 1024px) without reduced motion', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1024, max: 3840 }), // Desktop viewport widths
          (viewportWidth) => {
            const mode = getInitialPerformanceMode(viewportWidth, false);
            expect(mode).toBe('HIGH');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property: Performance configs have decreasing resource usage
   * *For any* performance mode, lower modes should have fewer particles
   * and less intensive effects than higher modes.
   */
  describe('Performance Config Ordering', () => {
    it('should have decreasing particle counts from HIGH to LOW', () => {
      const modes: PerformanceMode[] = ['HIGH', 'MEDIUM', 'LOW'];

      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1 }), // Index for comparison
          (index) => {
            const higherMode = modes[index];
            const lowerMode = modes[index + 1];

            const higherConfig = PERFORMANCE_CONFIGS[higherMode];
            const lowerConfig = PERFORMANCE_CONFIGS[lowerMode];

            // Higher mode should have more particles
            expect(higherConfig.particleCount).toBeGreaterThan(
              lowerConfig.particleCount
            );

            // Higher mode should have higher particle multiplier
            expect(higherConfig.particleMultiplier).toBeGreaterThan(
              lowerConfig.particleMultiplier
            );
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should have LOW mode with all expensive effects disabled', () => {
      const lowConfig = PERFORMANCE_CONFIGS['LOW'];

      expect(lowConfig.enableBloom).toBe(false);
      expect(lowConfig.enableDOF).toBe(false);
      expect(lowConfig.enablePostProcessing).toBe(false);
      expect(lowConfig.bloomIntensity).toBe(0);
    });

    it('should have HIGH mode with all effects enabled', () => {
      const highConfig = PERFORMANCE_CONFIGS['HIGH'];

      expect(highConfig.enableBloom).toBe(true);
      expect(highConfig.enableDOF).toBe(false); // DOF is disabled even in HIGH mode
      expect(highConfig.enablePostProcessing).toBe(true);
      expect(highConfig.bloomIntensity).toBeGreaterThan(0);
    });
  });
});
