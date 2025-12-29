/**
 * Property-Based Tests for Value Chain Section
 * **Feature: ste-scpb-refonte, Property 19: Value Chain Animation Stages**
 * **Validates: Requirements 3.2**
 *
 * Tests that the Value Chain section always displays exactly 4 stages
 * in the correct order: Farm, Collecte, Contrôle qualité, Logistique/Export
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getValueChainStages } from './ValueChain';

/**
 * Expected stage IDs in the correct order
 */
const EXPECTED_STAGE_IDS = ['farm', 'collection', 'quality', 'export'] as const;

/**
 * Expected stage count
 */
const EXPECTED_STAGE_COUNT = 4;

describe('Property 19: Value Chain Animation Stages', () => {
  /**
   * Property: The value chain always has exactly 4 stages
   * **Feature: ste-scpb-refonte, Property 19: Value Chain Animation Stages**
   * **Validates: Requirements 3.2**
   */
  it('should always return exactly 4 stages', () => {
    fc.assert(
      fc.property(
        fc.constant(null), // No input needed, testing the function itself
        () => {
          const stages = getValueChainStages();
          expect(stages).toHaveLength(EXPECTED_STAGE_COUNT);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: The stages are always in the correct order
   * **Feature: ste-scpb-refonte, Property 19: Value Chain Animation Stages**
   * **Validates: Requirements 3.2**
   */
  it('should always return stages in the correct order: Farm, Collection, Quality, Export', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const stages = getValueChainStages();
          const stageIds = stages.map((stage) => stage.id);
          
          expect(stageIds).toEqual(EXPECTED_STAGE_IDS);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Each stage has all required properties
   * **Feature: ste-scpb-refonte, Property 19: Value Chain Animation Stages**
   * **Validates: Requirements 3.2**
   */
  it('should ensure each stage has all required properties', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: EXPECTED_STAGE_COUNT - 1 }),
        (stageIndex) => {
          const stages = getValueChainStages();
          const stage = stages[stageIndex];

          // Each stage must have an id
          expect(stage.id).toBeDefined();
          expect(typeof stage.id).toBe('string');
          expect(EXPECTED_STAGE_IDS).toContain(stage.id);

          // Each stage must have an icon (React node)
          expect(stage.icon).toBeDefined();

          // Each stage must have a color (hex format)
          expect(stage.color).toBeDefined();
          expect(typeof stage.color).toBe('string');
          expect(stage.color).toMatch(/^#[0-9a-fA-F]{6}$/);

          // Each stage must have a glow color (rgba format)
          expect(stage.glowColor).toBeDefined();
          expect(typeof stage.glowColor).toBe('string');
          expect(stage.glowColor).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Stage IDs are unique
   * **Feature: ste-scpb-refonte, Property 19: Value Chain Animation Stages**
   * **Validates: Requirements 3.2**
   */
  it('should ensure all stage IDs are unique', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const stages = getValueChainStages();
          const stageIds = stages.map((stage) => stage.id);
          const uniqueIds = new Set(stageIds);
          
          expect(uniqueIds.size).toBe(stageIds.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Stage colors are unique
   * **Feature: ste-scpb-refonte, Property 19: Value Chain Animation Stages**
   * **Validates: Requirements 3.2**
   */
  it('should ensure all stage colors are unique for visual distinction', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const stages = getValueChainStages();
          const colors = stages.map((stage) => stage.color);
          const uniqueColors = new Set(colors);
          
          expect(uniqueColors.size).toBe(colors.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
