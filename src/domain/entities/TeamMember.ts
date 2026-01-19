import type { LocalizedContent, Locale } from '../value-objects/Locale';

/**
 * Team member photo
 */
export interface TeamMemberPhoto {
  url: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * Team member entity
 * Validates: Requirements 11.1, 11.2
 */
export interface TeamMember {
  id: string;
  name: LocalizedContent;
  role: LocalizedContent;
  bio: LocalizedContent;
  photo?: TeamMemberPhoto;
  isCEO: boolean;
  order: number;
  email?: string;
  linkedIn?: string;
}

/**
 * Gets localized team member name
 */
export function getLocalizedName(member: TeamMember, locale: Locale): string {
  return member.name[locale];
}

/**
 * Gets localized team member role
 */
export function getLocalizedRole(member: TeamMember, locale: Locale): string {
  return member.role[locale];
}

/**
 * Gets localized team member bio
 */
export function getLocalizedBio(member: TeamMember, locale: Locale): string {
  return member.bio[locale];
}

/**
 * Sorts team members by order, with CEO first
 */
export function sortTeamMembers(members: TeamMember[]): TeamMember[] {
  return [...members].sort((a, b) => {
    // CEO always first
    if (a.isCEO && !b.isCEO) return -1;
    if (!a.isCEO && b.isCEO) return 1;
    // Then by order
    return a.order - b.order;
  });
}

/**
 * Gets the CEO from team members
 */
export function getCEO(members: TeamMember[]): TeamMember | undefined {
  return members.find((member) => member.isCEO);
}
