/**
 * JSON-LD Schema Components for SEO
 * Clean, reusable components for structured data
 */

import type { Locale } from '@/domain/value-objects/Locale';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ste-scpb.com';

/**
 * Generic JSON-LD script renderer
 */
export function JsonLd<T extends object>({ data }: { data: T }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

/**
 * WebSite + SearchAction schema (global, in layout)
 */
export function WebSiteJsonLd({ locale }: { locale: Locale }) {
  const productsPath = locale === 'fr' ? '/fr/produits' : '/en/products';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'STE-SCPB',
    url: BASE_URL,
    description:
      locale === 'fr'
        ? 'Export de produits agricoles camerounais - Cacao, Café, Bois, Maïs'
        : 'Cameroonian agricultural products export - Cocoa, Coffee, Wood, Corn',
    inLanguage: ['fr', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}${productsPath}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={data} />;
}

/**
 * Organization schema (global, in layout)
 */
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'STE-SCPB',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      'Société camerounaise spécialisée dans le commerce de produits agricoles et matières premières: cacao, café, bois, maïs.',
    email: 'scpb@ste-scpb.com',
    telephone: '+237676905938',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Douala-Akwa',
      addressCountry: 'CM',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: '+237676905938',
        email: 'scpb@ste-scpb.com',
        availableLanguage: ['fr', 'en'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: '+19175939310',
        areaServed: 'US',
        availableLanguage: ['en', 'fr'],
      },
    ],
  };

  return <JsonLd data={data} />;
}

/**
 * BreadcrumbList schema (dynamic per page)
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };

  return <JsonLd data={data} />;
}

/**
 * Article schema (for blog posts)
 */
export interface ArticleJsonLdProps {
  title: string;
  description: string;
  url: string;
  images: Array<{ url: string; width?: number; height?: number }>;
  publishedAt: string;
  updatedAt: string;
}

export function ArticleJsonLd({
  title,
  description,
  url,
  images,
  publishedAt,
  updatedAt,
}: ArticleJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline: title,
    description,
    url,
    image:
      images.length > 0
        ? images.map((img) =>
            img.width && img.height
              ? {
                  '@type': 'ImageObject',
                  url: img.url,
                  width: img.width,
                  height: img.height,
                }
              : img.url
          )
        : undefined,
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: {
      '@type': 'Organization',
      name: 'STE-SCPB',
    },
    publisher: {
      '@type': 'Organization',
      name: 'STE-SCPB',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
  };

  return <JsonLd data={data} />;
}

/**
 * Product schema (for product pages)
 */
export interface ProductJsonLdProps {
  name: string;
  description: string;
  url: string;
  images: string[];
  category?: string;
  origin?: string[];
  certifications?: string[];
}

export function ProductJsonLd({
  name,
  description,
  url,
  images,
  category,
  origin,
  certifications,
}: ProductJsonLdProps) {
  const additionalProperties = [];

  if (origin && origin.length > 0) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Origin',
      value: origin.join(', '),
    });
  }

  if (certifications && certifications.length > 0) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Certifications',
      value: certifications.join(', '),
    });
  }

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    url,
    image: images,
    category,
    brand: {
      '@type': 'Brand',
      name: 'STE-SCPB',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'STE-SCPB',
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'STE-SCPB',
      },
    },
    ...(additionalProperties.length > 0 && { additionalProperty: additionalProperties }),
  };

  return <JsonLd data={data} />;
}

/**
 * FAQPage schema (only use if FAQ is visible on page!)
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return <JsonLd data={data} />;
}
