import { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Locale, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { TeamSection } from '@/components/sections/TeamSection';
import { createCMSClient } from '@/infrastructure/cms';
import type { TeamMember } from '@/domain/entities/TeamMember';

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

export default async function TeamPage({ params }: TeamPageProps) {
  const { locale } = await params;

  // Enable static rendering
  if (isValidLocale(locale)) {
    setRequestLocale(locale as Locale);
  }

  // Get translations for client component
  const t = await getTranslations({ locale: locale as Locale, namespace: 'team' });
  const translations = {
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

  // Fetch team members from CMS
  let teamMembers: TeamMember[] = [];
  try {
    const cmsClient = createCMSClient();
    teamMembers = await cmsClient.getTeamMembers(locale as Locale);
  } catch {
    // Fallback to empty array if CMS is unavailable
    teamMembers = [];
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background">
      <TeamSection members={teamMembers} locale={locale as Locale} translations={translations} />
    </main>
  );
}
