import { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Locale, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { ProductsSection } from '@/components/sections/ProductsSection';
import { createCMSClient } from '@/infrastructure/cms';
import { PRODUCT_CATEGORIES, type ProductCategory, type Product } from '@/domain/entities/Product';

// ISR: Revalidate every hour
export const revalidate = 3600;

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
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

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params;
  const { category } = await searchParams;

  // Enable static rendering
  if (isValidLocale(locale)) {
    setRequestLocale(locale as Locale);
  }

  // Validate category filter
  const validCategory = category && PRODUCT_CATEGORIES.includes(category as ProductCategory)
    ? (category as ProductCategory)
    : undefined;

  // Fetch products from CMS
  let products: Product[] = [];
  try {
    const cmsClient = createCMSClient();
    products = await cmsClient.getProducts(locale as Locale);
  } catch {
    // Fallback to empty array if CMS is unavailable
    products = [];
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background">
      <ProductsSection
        products={products}
        initialCategory={validCategory}
        locale={locale as Locale}
      />
    </main>
  );
}
