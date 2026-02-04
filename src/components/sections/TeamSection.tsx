'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { TeamMember } from '@/domain/entities/TeamMember';
import type { Locale } from '@/domain/value-objects/Locale';
import {
  getLocalizedName,
  getLocalizedRole,
  getLocalizedBio,
  sortTeamMembers,
  getCEO,
} from '@/domain/entities/TeamMember';
import { Card } from '@/components/ui/Card';
import {
  Scene3DWrapper,
  Starfield,
  Constellation,
  PostProcessing,
  StaticHeroFallback,
} from '@/components/3d';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';

/**
 * Translations interface for TeamSection
 */
export interface TeamTranslations {
  title: string;
  subtitle: string;
  ceoMessage: string;
  ceoQuote: string;
  contactExport: string;
  contactLogistics: string;
  contactSales: string;
  languages: string;
  responseTime: string;
  location: string;
}

/**
 * Props for TeamSection component
 */
export interface TeamSectionProps {
  members: TeamMember[];
  locale: Locale;
  translations: TeamTranslations;
}

/**
 * Props for TeamMemberCard component
 */
interface TeamMemberCardProps {
  member: TeamMember;
  locale: Locale;
}

/**
 * Color palette for initials based on role
 */
const ROLE_COLORS: Record<string, string> = {
  ceo: 'from-amber-500 to-amber-600',
  gm: 'from-blue-500 to-blue-600',
  operations: 'from-emerald-500 to-emerald-600',
  export: 'from-purple-500 to-purple-600',
  default: 'from-primary to-primary/80',
};

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get role color based on member role
 */
function getRoleColor(role: string): string {
  const lowerRole = role.toLowerCase();
  if (lowerRole.includes('ceo') || lowerRole.includes('directeur général')) return ROLE_COLORS.ceo;
  if (lowerRole.includes('coo') || lowerRole.includes('opérations')) return ROLE_COLORS.gm;
  if (lowerRole.includes('supply') || lowerRole.includes('logistique'))
    return ROLE_COLORS.operations;
  if (lowerRole.includes('export') || lowerRole.includes('commercial')) return ROLE_COLORS.export;
  return ROLE_COLORS.default;
}

/**
 * Individual team member card component
 */
function TeamMemberCard({ member, locale }: TeamMemberCardProps) {
  const name = getLocalizedName(member, locale);
  const role = getLocalizedRole(member, locale);
  const bio = getLocalizedBio(member, locale);
  const initials = getInitials(name);
  const colorClass = getRoleColor(role);

  return (
    <Card className="flex flex-col items-center text-center p-6">
      {/* Photo or Styled Initials */}
      <div className="relative rounded-full overflow-hidden mb-4 w-24 h-24 md:w-28 md:h-28">
        {member.photo ? (
          <Image
            src={member.photo.url}
            alt={member.photo.alt || name}
            fill
            className="object-cover"
            sizes="112px"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${colorClass}`}
          >
            <span className="font-bold text-white text-2xl">{initials}</span>
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="font-semibold text-foreground text-lg">{name}</h3>

      {/* Role */}
      <p className="text-primary font-medium mt-1 text-sm">{role}</p>

      {/* Bio */}
      {bio && (
        <p className="text-muted-foreground mt-3 leading-relaxed text-sm line-clamp-3">{bio}</p>
      )}

      {/* Languages & Response time */}
      <div className="flex flex-wrap justify-center gap-3 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
          FR / EN
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          &lt; 24–48h
        </span>
      </div>

      {/* Contact button */}
      <div className="mt-4">
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
            aria-label={`Email ${name}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {member.email}
          </a>
        )}
      </div>
    </Card>
  );
}

/**
 * CEO Message section component
 */
function CEOMessage({
  ceo,
  locale,
  translations,
}: {
  ceo: TeamMember;
  locale: Locale;
  translations: TeamTranslations;
}) {
  const name = getLocalizedName(ceo, locale);
  const role = getLocalizedRole(ceo, locale);
  const initials = getInitials(name);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const showImage = ceo.photo?.url && !imageError;

  return (
    <section className="mb-16 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl p-8 md:p-12">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
        {translations.ceoMessage}
      </h2>
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* CEO Photo */}
        <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-500 to-amber-600">
          {showImage && (
            <Image
              src={ceo.photo!.url}
              alt={ceo.photo!.alt || name}
              fill
              className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              sizes="192px"
              priority
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
          {/* Fallback initials - shown when no image or image failed to load */}
          {(!showImage || !imageLoaded) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold text-white">{initials}</span>
            </div>
          )}
        </div>

        {/* CEO Info & Message */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl md:text-2xl font-semibold text-foreground">{name}</h3>
          <p className="text-primary font-medium mt-1">{role}</p>

          {/* CEO Quote from translations */}
          <blockquote className="mt-4 text-muted-foreground leading-relaxed italic border-l-4 border-primary/30 pl-4">
            &ldquo;{translations.ceoQuote}&rdquo;
          </blockquote>

          {/* Languages & Response */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              {translations.languages}: FR / EN
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {translations.location}: Douala
            </span>
          </div>

          {/* CEO Email */}
          {ceo.email && (
            <div className="mt-6">
              <a
                href={`mailto:${ceo.email}`}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
                aria-label={`Email ${name}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {ceo.email}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * 3D Scene for team hero - constellation background
 */
function TeamHeroScene() {
  const { config } = usePerformanceMode();

  // Simple constellation config for team page
  const constellationConfig = {
    nodes: [
      { id: 'team-1', position: [-3, 2, 0] as [number, number, number], size: 0.2, label: '' },
      { id: 'team-2', position: [3, 2, 0] as [number, number, number], size: 0.2, label: '' },
      { id: 'team-3', position: [0, -2, 0] as [number, number, number], size: 0.25, label: '' },
      { id: 'team-4', position: [-2, 0, 0] as [number, number, number], size: 0.15, label: '' },
      { id: 'team-5', position: [2, 0, 0] as [number, number, number], size: 0.15, label: '' },
    ],
    connections: [
      [0, 3],
      [3, 2],
      [2, 4],
      [4, 1],
      [0, 1],
    ] as [number, number][],
    color: '#fbbf24',
    glowIntensity: 0.8,
    animationSpeed: 0.6,
  };

  return (
    <>
      <Starfield
        config={config}
        color="#ffffff"
        secondaryColor="#fbbf24"
        depth={30}
        parallaxIntensity={0.05}
        enableParallax={true}
      />
      <Constellation config={constellationConfig} isActive={true} />
      <PostProcessing config={config} />
      <ambientLight intensity={0.3} />
    </>
  );
}

/**
 * TeamSection component - Displays team members with CEO message prominently
 * Validates: Requirements 11.1, 11.2
 */
export function TeamSection({ members, locale, translations }: TeamSectionProps) {
  // Sort members (CEO first, then by order)
  const sortedMembers = sortTeamMembers(members);
  const ceo = getCEO(members);
  const otherMembers = sortedMembers.filter((m) => !m.isCEO);

  return (
    <section className="relative" aria-label={translations.title}>
      {/* 3D Constellation Hero Header */}
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Scene3DWrapper
            className="h-full w-full"
            fallback={<StaticHeroFallback starCount={100} />}
            camera={{ position: [0, 0, 8], fov: 60 }}
          >
            <TeamHeroScene />
          </Scene3DWrapper>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-background/30 to-background" />

        {/* Title overlay */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl holographic">
            {translations.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-foreground-muted">{translations.subtitle}</p>
        </div>
      </div>

      {/* Content section */}
      <div className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
        {/* CEO Message (if CEO exists) */}
        {ceo && <CEOMessage ceo={ceo} locale={locale} translations={translations} />}

        {/* Team Grid */}
        {otherMembers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} locale={locale} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {members.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No team members to display.</p>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Renders team member display content for testing
 * Returns an object with all required display fields
 */
export function renderTeamMemberDisplay(
  member: TeamMember,
  locale: Locale
): {
  name: string;
  role: string;
  bio: string;
  hasPhoto: boolean;
  photoUrl?: string;
} {
  return {
    name: getLocalizedName(member, locale),
    role: getLocalizedRole(member, locale),
    bio: getLocalizedBio(member, locale),
    hasPhoto: !!member.photo,
    photoUrl: member.photo?.url,
  };
}
