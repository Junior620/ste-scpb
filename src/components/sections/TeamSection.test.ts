import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { TeamMember, TeamMemberPhoto } from '@/domain/entities/TeamMember';
import {
  getLocalizedRole,
  getLocalizedBio,
  sortTeamMembers,
  getCEO,
} from '@/domain/entities/TeamMember';
import type { Locale, LocalizedContent } from '@/domain/value-objects/Locale';
import { SUPPORTED_LOCALES } from '@/domain/value-objects/Locale';
import { renderTeamMemberDisplay } from './TeamSection';

/**
 * Property-Based Tests for Team Member Display Completeness
 * **Feature: ste-scpb-refonte, Property 22: Team Member Display Completeness**
 * **Validates: Requirements 11.1**
 *
 * Property 22: Team Member Display Completeness
 * For any team member displayed, it should include: photo, name, role, and bio.
 * The CEO should be marked and displayed prominently.
 */

/**
 * Arbitrary for generating LocalizedContent with non-whitespace strings
 */
const localizedContentArbitrary = (
  minLength: number,
  maxLength: number
): fc.Arbitrary<LocalizedContent> =>
  fc.record({
    fr: fc.string({ minLength, maxLength }).filter((s) => s.trim().length > 0),
    en: fc.string({ minLength, maxLength }).filter((s) => s.trim().length > 0),
  });

/**
 * Arbitrary for generating TeamMemberPhoto
 */
const teamMemberPhotoArbitrary: fc.Arbitrary<TeamMemberPhoto> = fc.record({
  url: fc.webUrl(),
  alt: fc.string({ minLength: 2, maxLength: 100 }).filter((s) => s.trim().length > 0),
  width: fc.integer({ min: 100, max: 500 }),
  height: fc.integer({ min: 100, max: 500 }),
});

/**
 * Arbitrary for generating valid TeamMember objects
 */
const teamMemberArbitrary: fc.Arbitrary<TeamMember> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 2, maxLength: 100 }).filter((s) => s.trim().length > 0),
  role: localizedContentArbitrary(2, 100),
  bio: localizedContentArbitrary(10, 500),
  photo: fc.option(teamMemberPhotoArbitrary, { nil: undefined }),
  isCEO: fc.boolean(),
  order: fc.integer({ min: 0, max: 100 }),
  email: fc.option(fc.emailAddress(), { nil: undefined }),
  linkedIn: fc.option(fc.webUrl(), { nil: undefined }),
});

/**
 * Arbitrary for generating a team with exactly one CEO
 */
const teamWithCEOArbitrary: fc.Arbitrary<TeamMember[]> = fc
  .array(teamMemberArbitrary, { minLength: 2, maxLength: 10 })
  .map((members) => {
    // Ensure exactly one CEO
    const withoutCEO = members.map((m) => ({ ...m, isCEO: false }));
    // Make the first member the CEO
    if (withoutCEO.length > 0) {
      withoutCEO[0].isCEO = true;
    }
    return withoutCEO;
  });

describe('Team Member Display Completeness - Property Tests', () => {
  /**
   * Property 22: Team Member Display Completeness
   * For any valid team member and locale, all required content should be extractable
   */
  it('should contain all required team member information for any valid member', () => {
    fc.assert(
      fc.property(
        teamMemberArbitrary,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (member, locale) => {
          const display = renderTeamMemberDisplay(member, locale);

          // Name must be present and non-empty
          expect(display.name).toBeDefined();
          expect(display.name.length).toBeGreaterThan(0);

          // Role must be present and non-empty
          expect(display.role).toBeDefined();
          expect(display.role.length).toBeGreaterThan(0);

          // Bio must be present and non-empty
          expect(display.bio).toBeDefined();
          expect(display.bio.length).toBeGreaterThan(0);

          // hasPhoto should be a boolean
          expect(typeof display.hasPhoto).toBe('boolean');

          // If hasPhoto is true, photoUrl should be defined
          if (display.hasPhoto) {
            expect(display.photoUrl).toBeDefined();
            expect(display.photoUrl!.length).toBeGreaterThan(0);
          }
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
      fc.property(teamMemberArbitrary, (member) => {
        const frDisplay = renderTeamMemberDisplay(member, 'fr');
        const enDisplay = renderTeamMemberDisplay(member, 'en');

        // Both locales should have role and bio
        expect(frDisplay.role).toBeDefined();
        expect(enDisplay.role).toBeDefined();
        expect(frDisplay.bio).toBeDefined();
        expect(enDisplay.bio).toBeDefined();

        // Non-localized fields should be the same
        expect(frDisplay.name).toBe(enDisplay.name);
        expect(frDisplay.hasPhoto).toBe(enDisplay.hasPhoto);
        expect(frDisplay.photoUrl).toBe(enDisplay.photoUrl);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: CEO should be identifiable and sortable to first position
   */
  it('should sort CEO to first position in team list', () => {
    fc.assert(
      fc.property(teamWithCEOArbitrary, (members) => {
        const sorted = sortTeamMembers(members);
        const ceo = getCEO(members);

        // There should be exactly one CEO
        expect(ceo).toBeDefined();
        expect(ceo!.isCEO).toBe(true);

        // CEO should be first in sorted list
        expect(sorted[0].isCEO).toBe(true);
        expect(sorted[0].id).toBe(ceo!.id);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Non-CEO members should be sorted by order
   */
  it('should sort non-CEO members by order field', () => {
    fc.assert(
      fc.property(teamWithCEOArbitrary, (members) => {
        const sorted = sortTeamMembers(members);
        const nonCEOMembers = sorted.filter((m) => !m.isCEO);

        // Non-CEO members should be sorted by order
        for (let i = 1; i < nonCEOMembers.length; i++) {
          expect(nonCEOMembers[i].order).toBeGreaterThanOrEqual(nonCEOMembers[i - 1].order);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: getLocalizedRole should return correct locale content
   */
  it('should return correct localized role for each locale', () => {
    fc.assert(
      fc.property(
        teamMemberArbitrary,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (member, locale) => {
          const role = getLocalizedRole(member, locale);

          // Role should match the locale-specific content
          expect(role).toBe(member.role[locale]);
          expect(role.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: getLocalizedBio should return correct locale content
   */
  it('should return correct localized bio for each locale', () => {
    fc.assert(
      fc.property(
        teamMemberArbitrary,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (member, locale) => {
          const bio = getLocalizedBio(member, locale);

          // Bio should match the locale-specific content
          expect(bio).toBe(member.bio[locale]);
          expect(bio.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Team member with photo should have valid photo data
   */
  it('should have valid photo data when photo is present', () => {
    // Filter to members with photos
    const memberWithPhotoArb = teamMemberArbitrary.filter((m) => m.photo !== undefined);

    fc.assert(
      fc.property(
        memberWithPhotoArb,
        fc.constantFrom(...SUPPORTED_LOCALES) as fc.Arbitrary<Locale>,
        (member, locale) => {
          const display = renderTeamMemberDisplay(member, locale);

          // Photo should be present
          expect(display.hasPhoto).toBe(true);
          expect(display.photoUrl).toBeDefined();
          expect(display.photoUrl!.length).toBeGreaterThan(0);

          // Photo should have valid dimensions
          expect(member.photo!.width).toBeGreaterThan(0);
          expect(member.photo!.height).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: sortTeamMembers should preserve all members
   */
  it('should preserve all team members after sorting', () => {
    fc.assert(
      fc.property(fc.array(teamMemberArbitrary, { minLength: 0, maxLength: 20 }), (members) => {
        const sorted = sortTeamMembers(members);

        // Same number of members
        expect(sorted.length).toBe(members.length);

        // All original members should be present
        const originalIds = new Set(members.map((m) => m.id));
        const sortedIds = new Set(sorted.map((m) => m.id));
        expect(sortedIds).toEqual(originalIds);
      }),
      { numRuns: 100 }
    );
  });
});
