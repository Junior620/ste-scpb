/**
 * JSON-LD Schema Components for SEO (v5)
 * Clean, reusable components for structured data
 *
 * Changes v5:
 * - Added @id to Organization and WebSite for deduplication
 * - SearchAction is conditional (only if search works)
 * - Article references @id instead of duplicating Organization
 * - Secure image mapping (filter invalid fields)
 * - Organization enriched with sameAs, areaServed, knowsAbout
 */

import type { Locale } from '@/domain/value-objects/Locale';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ste-scpb.com';

// Unique IDs for schema deduplication (Google best practice)
const ORGANIZATION_ID = `${BASE_URL}/#organization`;
const WEBSITE_ID = `${BASE_URL}/#website`;

/**
 * Generic JSON-LD script renderer
 */
export function JsonLd<T extends object>({ data }: { data: T }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

/**
 * WebSite schema (global, in head.tsx)
 * SearchAction is CONDITIONAL - only include if search actually works
 */
export function WebSiteJsonLd({ locale }: { locale: Locale }) {
  // Search is now implemented on /produits with ?q= parameter
  const hasWorkingSearch = true;

  const productsPath = locale === 'fr' ? '/fr/produits' : '/en/products';

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'STE-SCPB',
    url: BASE_URL,
    description:
      locale === 'fr'
        ? 'Export de produits agricoles camerounais - Cacao, Café, Bois, Maïs'
        : 'Cameroonian agricultural products export - Cocoa, Coffee, Wood, Corn',
    inLanguage: ['fr', 'en'],
    publisher: { '@id': ORGANIZATION_ID },
  };

  // Only add SearchAction if search is functional
  if (hasWorkingSearch) {
    data.potentialAction = {
      '@type': 'SearchAction',
      target: `${BASE_URL}${productsPath}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    };
  }

  return <JsonLd data={data} />;
}

/**
 * Organization schema (global, in head.tsx)
 * Enriched with sameAs, areaServed, knowsAbout for B2B context
 */
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'STE-SCPB',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    image: `${BASE_URL}/logo.png`, // Google recommends image in addition to logo
    description:
      'Société camerounaise spécialisée dans le commerce de produits agricoles et matières premières: cacao, café, bois, maïs.',
    email: 'scpb@ste-scpb.com',
    telephone: '+237676905938',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rue Franqueville, Akwa',
      addressLocality: 'Douala',
      postalCode: 'BP 5765',
      addressRegion: 'Littoral',
      addressCountry: 'CM',
    },
    // B2B enrichments (P2)
    areaServed: ['CM', 'FR', 'EU', 'US'],
    knowsAbout: [
      'cocoa export',
      'coffee export',
      'wood export',
      'corn export',
      'phytosanitary certificate',
      'COA certificate',
      'agricultural commodities',
      'B2B trading',
    ],
    // Social links - add URLs when available (LinkedIn, Facebook, etc.)
    sameAs: [
      // 'https://www.linkedin.com/company/ste-scpb',
      // 'https://www.facebook.com/ste-scpb',
    ],
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
 * Only use if breadcrumb UI is visible on the page!
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
 * Uses @id reference to Organization (no duplication)
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
  // Secure image mapping - filter invalid entries
  const imageData = images
    .filter((img) => img.url && typeof img.url === 'string')
    .map((img) => {
      if (img.width && img.height) {
        return {
          '@type': 'ImageObject',
          url: img.url,
          width: img.width,
          height: img.height,
        };
      }
      return img.url;
    });

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
    image: imageData.length > 0 ? imageData : undefined,
    datePublished: publishedAt,
    dateModified: updatedAt,
    // Reference @id instead of duplicating Organization
    author: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
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
    // Reference @id for manufacturer
    manufacturer: { '@id': ORGANIZATION_ID },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      seller: { '@id': ORGANIZATION_ID },
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
