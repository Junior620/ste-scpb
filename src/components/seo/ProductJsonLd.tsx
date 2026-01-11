'use client';

import { Product } from '@/domain/entities/Product';
import { Locale } from '@/domain/value-objects/Locale';
import { BASE_URL, SITE_NAME } from '@/i18n/metadata';

export interface ProductJsonLdProps {
  product: Product;
  locale: Locale;
  url?: string;
}

export function ProductJsonLd({ product, locale, url }: ProductJsonLdProps) {
  const productUrl = url || `${BASE_URL}/${locale}/produits/${product.slug}`;
  const imageUrl = product.images.length > 0 ? product.images[0].url : `${BASE_URL}/images/product-placeholder.jpg`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: imageUrl,
    url: productUrl,
    brand: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
    },
    manufacturer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
    },
    category: product.category,
    ...(product.origin && {
      countryOfOrigin: {
        '@type': 'Country',
        name: product.origin,
      },
    }),
    ...(product.certifications && product.certifications.length > 0 && {
      additionalProperty: product.certifications.map((cert) => ({
        '@type': 'PropertyValue',
        name: 'Certification',
        value: cert,
      })),
    }),
    offers: {
      '@type': 'Offer',
      url: productUrl,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: BASE_URL,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
