import { Metadata } from 'next';
import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Locale, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { ProductsSection } from '@/components/sections/ProductsSection';
import { createCMSClient } from '@/infrastructure/cms';
import { PRODUCT_CATEGORIES, type ProductCategory, type Product } from '@/domain/entities/Product';
import { ProductsGridSkeleton } from '@/components/ui';

// ISR: Revalidate every hour
export const revalidate = 3600;

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string }>;
}

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  const t = await getTranslations({ locale: validLocale, namespace: 'metadata.products' });

  return generateLocalizedMetadata({
    title: t('title'),
    description: t('description'),
    pathname: '/produits',
    locale: validLocale,
    keywords: ['produits agricoles', 'cacao', 'café', 'bois', 'maïs', 'export', 'B2B', 'Cameroun'],
  });
}

/**
 * Async component that fetches and displays products
 */
async function ProductsContent({
  locale,
  category,
  searchQuery,
}: {
  locale: Locale;
  category?: ProductCategory;
  searchQuery?: string;
}) {
  // Fetch products from CMS
  let products: Product[] = [];
  try {
    const cmsClient = await createCMSClient();
    products = await cmsClient.getProducts(locale);
    console.log('[ProductsPage] Fetched products:', products.length);
  } catch (error) {
    // Fallback to empty array if CMS is unavailable
    console.error('[ProductsPage] Error fetching products:', error);
    products = [];
  }

  return (
    <ProductsSection
      products={products}
      initialCategory={category}
      initialSearchQuery={searchQuery}
      locale={locale}
    />
  );
}

/**
 * Skeleton fallback for products loading state
 */
function ProductsLoadingFallback() {
  return (
    <section className="relative">
      {/* Hero skeleton */}
      <div className="relative h-[40vh] min-h-[300px] bg-background-secondary animate-pulse">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <div className="h-12 w-64 bg-border/50 rounded-lg mb-4" />
          <div className="h-6 w-96 max-w-full bg-border/50 rounded-lg" />
        </div>
      </div>
      {/* Grid skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-border/50 rounded-full animate-pulse" />
          ))}
        </div>
        <ProductsGridSkeleton count={6} />
      </div>
    </section>
  );
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params;
  const { category, q } = await searchParams;

  // Enable static rendering
  if (isValidLocale(locale)) {
    setRequestLocale(locale as Locale);
  }

  // Validate category filter
  const validCategory =
    category && PRODUCT_CATEGORIES.includes(category as ProductCategory)
      ? (category as ProductCategory)
      : undefined;

  // Sanitize search query
  const searchQuery = q?.trim() || undefined;

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background">
      <Suspense fallback={<ProductsLoadingFallback />}>
        <ProductsContent
          locale={locale as Locale}
          category={validCategory}
          searchQuery={searchQuery}
        />
      </Suspense>
    </main>
  );
}
