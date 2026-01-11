import { Metadata } from 'next';
import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Locale, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { TeamSection, type TeamTranslations } from '@/components/sections/TeamSection';
import { createCMSClient } from '@/infrastructure/cms';
import type { TeamMember } from '@/domain/entities/TeamMember';
import { TeamGridSkeleton } from '@/components/ui';

// ISR: Revalidate every 24 hours (team rarely changes)
export const revalidate = 86400;

interface TeamPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  const t = await getTranslations({ locale: validLocale, namespace: 'metadata.team' });

  return generateLocalizedMetadata({
    title: t('title'),
    description: t('description'),
    pathname: '/equipe',
    locale: validLocale,
    keywords: ['équipe', 'experts', 'commerce agricole', 'Cameroun'],
  });
}

/**
 * Async component that fetches and displays team members
 */
async function TeamContent({
  locale,
  translations,
}: {
  locale: Locale;
  translations: TeamTranslations;
}) {
  // Fetch team members from CMS
  let teamMembers: TeamMember[] = [];
  try {
    const cmsClient = await createCMSClient();
    teamMembers = await cmsClient.getTeamMembers(locale);
  } catch {
    // Fallback to empty array if CMS is unavailable
    teamMembers = [];
  }

  return <TeamSection members={teamMembers} locale={locale} translations={translations} />;
}

/**
 * Skeleton fallback for team loading state
 */
function TeamLoadingFallback() {
  return (
    <section className="relative">
      {/* Hero skeleton */}
      <div className="relative h-[40vh] min-h-[300px] bg-background-secondary animate-pulse">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <div className="h-12 w-48 bg-border/50 rounded-lg mb-4" />
          <div className="h-6 w-80 max-w-full bg-border/50 rounded-lg" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
        {/* CEO Message skeleton */}
        <div className="mb-16 bg-background-secondary/50 rounded-2xl p-8 md:p-12 animate-pulse">
          <div className="h-8 w-64 bg-border/50 rounded-lg mx-auto mb-8" />
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-border/50" />
            <div className="flex-1 space-y-4">
              <div className="h-6 w-48 bg-border/50 rounded-lg" />
              <div className="h-4 w-32 bg-border/50 rounded-lg" />
              <div className="h-20 w-full bg-border/50 rounded-lg" />
            </div>
          </div>
        </div>
        {/* Team grid skeleton */}
        <TeamGridSkeleton count={4} />
      </div>
    </section>
  );
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { locale } = await params;

  // Enable static rendering
  if (isValidLocale(locale)) {
    setRequestLocale(locale as Locale);
  }

  // Get translations for client component
  const t = await getTranslations({ locale: locale as Locale, namespace: 'team' });
  const translations: TeamTranslations = {
    title: t('title'),
    subtitle: t('subtitle'),
    ceoMessage: t('ceoMessage'),
    ceoQuote: t('ceoQuote'),
    contactExport: t('contactExport'),
    contactLogistics: t('contactLogistics'),
    contactSales: t('contactSales'),
    languages: t('languages'),
    responseTime: t('responseTime'),
    location: t('location'),
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background">
      <Suspense fallback={<TeamLoadingFallback />}>
        <TeamContent locale={locale as Locale} translations={translations} />
      </Suspense>
    </main>
  );
}
