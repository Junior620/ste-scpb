import { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Locale, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import {
  Hero,
  ProductsPreview,
  ValueChain,
  CTASection,
  CertificationsSection,
  OtherProductsSection,
  PartnerTeaser,
  EudrProofSection,
  HomeTeamSection,
} from '@/components/sections';
import { createCMSClient } from '@/infrastructure/cms';
import type { Product } from '@/domain/entities/Product';
import type { TeamMember } from '@/domain/entities/TeamMember';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  const t = await getTranslations({ locale: validLocale, namespace: 'metadata.home' });

  return generateLocalizedMetadata({
    title: t('title'),
    description: t('description'),
    pathname: '',
    locale: validLocale,
    keywords: [
      'export cacao Douala',
      'conformité EUDR cacao',
      'cacao traçable Cameroun',
      'CocoaTrack',
      'cacao zéro déforestation',
      'fournisseur cacao EUDR',
      'export cacao Cameroun',
      'B2B',
    ],
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';

  if (isValidLocale(locale)) {
    setRequestLocale(locale as Locale);
  }

  let otherProducts: Product[] = [];
  let teamMembers: TeamMember[] = [];
  try {
    const cmsClient = await createCMSClient();
    [otherProducts, teamMembers] = await Promise.all([
      cmsClient.getProducts(validLocale),
      cmsClient.getTeamMembers(validLocale),
    ]);
  } catch (error) {
    console.warn(
      'CMS unavailable, hover images disabled:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <Hero />
      <EudrProofSection />
      <ProductsPreview />
      <OtherProductsSection products={otherProducts} />
      <PartnerTeaser />
      <CertificationsSection />
      <ValueChain />
      <HomeTeamSection members={teamMembers} locale={validLocale} />
      <CTASection />
    </main>
  );
}
