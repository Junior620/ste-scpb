import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Locale, isValidLocale, SUPPORTED_LOCALES } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { ProductDetailSection } from '@/components/sections/ProductDetailSection';
import { createCMSClient } from '@/infrastructure/cms';
import type { Product } from '@/domain/entities/Product';
import { generateProductSchema, renderSchemaScript } from '@/lib/schema';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

// ISR: Revalidate every hour
export const revalidate = 3600;

interface ProductDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  try {
    const cmsClient = await createCMSClient();
    const slugs = await cmsClient.getAllProductSlugs();
    return slugs.flatMap((productSlug: string) =>
      SUPPORTED_LOCALES.map((locale) => ({ locale, slug: productSlug }))
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  let product: Product | null = null;
  try {
    const cmsClient = await createCMSClient();
    product = await cmsClient.getProductBySlug(slug, locale as Locale);
  } catch {
    // Product not found
  }

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  const productName = product.name[validLocale];
  const productDescription = product.description[validLocale];
  const ogImage = product.images.length > 0 ? product.images[0].url : undefined;

  return generateLocalizedMetadata({
    title: productName,
    description: productDescription.substring(0, 160),
    pathname: `/produits/${slug}`,
    locale: validLocale,
    ogImage,
    keywords: [
      productName,
      product.category,
      'export',
      'B2B',
      'Cameroun',
      ...product.certifications,
    ],
  });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { locale, slug } = await params;

  // Enable static rendering
  if (isValidLocale(locale)) {
    setRequestLocale(locale as Locale);
  }

  // Get translations for breadcrumb
  const t = await getTranslations({ locale, namespace: 'nav' });

  // Fetch product from CMS
  let product: Product | null = null;
  let relatedProducts: Product[] = [];
  let similarProducts: Product[] = [];

  try {
    const cmsClient = await createCMSClient();
    product = await cmsClient.getProductBySlug(slug, locale as Locale);

    if (product) {
      // Fetch all products for related/similar products
      const allProducts = await cmsClient.getProducts(locale as Locale);

      // Get explicitly related products
      if (product.relatedProducts.length > 0) {
        relatedProducts = allProducts.filter((p: Product) =>
          product!.relatedProducts.includes(p.slug)
        );
      }

      // Get similar products (same category, excluding current product and already related)
      const relatedSlugs = new Set(product.relatedProducts);
      similarProducts = allProducts
        .filter(
          (p: Product) =>
            p.category === product!.category &&
            p.slug !== product!.slug &&
            !relatedSlugs.has(p.slug)
        )
        .slice(0, 3); // Limit to 3 similar products
    }
  } catch {
    // Product not found
  }

  if (!product) {
    notFound();
  }

  // Generate schema.org JSON-LD
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ste-scpb.com';
  const productSchema = generateProductSchema(product, locale as Locale, baseUrl);

  // Breadcrumb items: Accueil > Produits > [Product Name]
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  const breadcrumbItems = [
    { label: t('home'), href: `/${validLocale}` },
    { label: t('products'), href: `/${validLocale}/produits` },
    { label: product.name[validLocale] },
  ];

  return (
    <>
      {/* Schema.org JSON-LD for Product */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderSchemaScript(productSchema),
        }}
      />
      {/* Breadcrumb JSON-LD is included in the Breadcrumb UI component */}
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-background">
        {/* Breadcrumb navigation */}
        <div className="container mx-auto px-4 pt-20">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <ProductDetailSection
          product={product}
          relatedProducts={relatedProducts}
          similarProducts={similarProducts}
          locale={locale as Locale}
        />
      </main>
    </>
  );
}
