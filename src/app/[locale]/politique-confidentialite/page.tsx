import { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Locale, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { PrivacyPolicyContent } from './PrivacyPolicyContent';

// Static page - no revalidation needed
export const revalidate = false;

interface PrivacyPolicyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PrivacyPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  const t = await getTranslations({ locale: validLocale, namespace: 'metadata.privacyPolicy' });

  return generateLocalizedMetadata({
    title: t('title'),
    description: t('description'),
    pathname: '/politique-confidentialite',
    locale: validLocale,
    noIndex: false, // Privacy policy should be indexed
  });
}

export default async function PrivacyPolicyPage({ params }: PrivacyPolicyPageProps) {
  const { locale } = await params;

  // Enable static rendering
  if (isValidLocale(locale)) {
    setRequestLocale(locale as Locale);
  }

  return <PrivacyPolicyContent />;
}
