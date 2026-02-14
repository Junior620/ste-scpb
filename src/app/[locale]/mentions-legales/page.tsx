import { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Locale, isValidLocale, SUPPORTED_LOCALES } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { LegalMentionsContent } from './LegalMentionsContent';

// Force static generation for this page
export const dynamic = 'force-static';

interface LegalMentionsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LegalMentionsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  const t = await getTranslations({ locale: validLocale, namespace: 'metadata.legalMentions' });

  return generateLocalizedMetadata({
    title: t('title'),
    description: t('description'),
    pathname: '/mentions-legales',
    locale: validLocale,
    noIndex: false, // Legal pages should be indexed
  });
}

export default async function LegalMentionsPage({ params }: LegalMentionsPageProps) {
  const { locale } = await params;

  // Enable static rendering
  if (isValidLocale(locale)) {
    setRequestLocale(locale as Locale);
  }

  return <LegalMentionsContent />;
}
