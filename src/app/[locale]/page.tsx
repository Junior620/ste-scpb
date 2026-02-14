import { Metadata } from 'next';
import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Locale, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import {
  Hero,
  ProductsPreview,
  WorkforceSection,
  ValueChain,
  TeamPreview,
  CTASection,
  CertificationsSection,
  OtherProductsSection,
} from '@/components/sections';
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
    keywords: [
      'cacao',
      'café',
      'bois',
      'maïs',
      'export',
      'Cameroun',
      'commodities',
      'agriculture',
      'B2B',
    ],
  });
}

/**
 * Async component that fetches products for OtherProductsSection
 */
async function OtherProductsSectionWithData({ locale }: { locale: Locale }) {
  // Fetch products for OtherProductsSection hover images
  let products: Product[] = [];
  try {
    const cmsClient = await createCMSClient();
    products = await cmsClient.getProducts(locale);
    console.log(
      `[HomePage] Fetched ${products.length} products:`,
      products.map((p) => p.slug)
    );
  } catch (error) {
    // Silently fail - OtherProductsSection works without images
    console.warn(
      'CMS unavailable, hover images disabled:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Import NextIntlClientProvider to wrap the client component
  const { NextIntlClientProvider } = await import('next-intl');
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <OtherProductsSection products={products} />
    </NextIntlClientProvider>
  );
}

/**
 * Skeleton fallback for OtherProductsSection loading state
 */
function OtherProductsSectionSkeleton() {
  return (
    <section className="py-16 md:py-24 bg-background-secondary">
      <div className="container mx-auto px-4">
        <div className="h-8 w-64 bg-border/50 rounded-lg mx-auto mb-4 animate-pulse" />
        <div className="h-6 w-96 max-w-full bg-border/50 rounded-lg mx-auto mb-12 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-background rounded-xl p-6 border border-border animate-pulse"
            >
              <div className="w-12 h-12 bg-border/50 rounded-full mx-auto mb-4" />
              <div className="h-6 bg-border/50 rounded mb-2" />
              <div className="h-4 bg-border/50 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';

  // Enable static rendering
  if (isValidLocale(locale)) {
    setRequestLocale(locale as Locale);
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <Hero />
      <ProductsPreview />
      <Suspense fallback={<OtherProductsSectionSkeleton />}>
        <OtherProductsSectionWithData locale={validLocale} />
      </Suspense>
      <CertificationsSection />
      <ValueChain />
      <WorkforceSection />
      <TeamPreview />
      <CTASection />
    </main>
  );
}
