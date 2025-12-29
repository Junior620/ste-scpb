import { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Locale, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { Hero, ProductsPreview, WorkforceSection, ValueChain, TeamPreview, CTASection, CertificationsSection, OtherProductsSection } from '@/components/sections';
import { createCMSClient } from '@/infrastructure/cms';
import type { Product } from '@/domain/entities/Product';

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
    keywords: ['cacao', 'café', 'bois', 'maïs', 'export', 'Cameroun', 'commodities', 'agriculture', 'B2B'],
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';

  // Enable static rendering
  if (isValidLocale(locale)) {
    setRequestLocale(locale as Locale);
  }

  // Fetch products for OtherProductsSection hover images
  let products: Product[] = [];
  try {
    const cmsClient = createCMSClient();
    products = await cmsClient.getProducts(validLocale);
    console.log(`[HomePage] Fetched ${products.length} products:`, products.map(p => p.slug));
  } catch (error) {
    // Silently fail - OtherProductsSection works without images
    console.warn('CMS unavailable, hover images disabled:', error instanceof Error ? error.message : 'Unknown error');
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <Hero />
      <ProductsPreview />
      <OtherProductsSection products={products} />
      <CertificationsSection />
      <ValueChain />
      <WorkforceSection />
      <TeamPreview />
      <CTASection />
    </main>
  );
}
