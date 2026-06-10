import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Locale, SUPPORTED_LOCALES, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { PartnerSection } from '@/components/sections/PartnerSection';
import { SolutionHero } from '@/components/sections/SolutionHero';

export const dynamic = 'force-static';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  const t = await getTranslations({ locale: validLocale, namespace: 'solutions.partners.meta' });

  return generateLocalizedMetadata({
    title: t('title'),
    description: t('description'),
    pathname: '/partenaires',
    locale: validLocale,
  });
}

export default async function PartnersPage({ params }: PageProps) {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  setRequestLocale(validLocale);

  const t = await getTranslations({ locale: validLocale, namespace: 'solutions.partners' });

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <SolutionHero badge={t('hero.badge')} title={t('hero.title')} subtitle={t('hero.subtitle')} />
      <PartnerSection />
    </main>
  );
}
