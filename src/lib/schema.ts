/**
 * Schema.org JSON-LD Markup Utilities
 * Validates: Requirements 4.3, 10.4
 *
 * Generates structured data for SEO and rich snippets
 */

import type { Product } from '@/domain/entities/Product';
import type { Locale } from '@/domain/value-objects/Locale';

/**
 * Schema.org Product type
 */
export interface ProductSchema {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description: string;
  image?: string[];
  category?: string;
  brand?: {
    '@type': 'Brand';
    name: string;
  };
  manufacturer?: {
    '@type': 'Organization';
    name: string;
  };
  offers?: {
    '@type': 'Offer';
    availability: string;
    priceCurrency?: string;
    seller?: {
      '@type': 'Organization';
      name: string;
    };
  };
  additionalProperty?: Array<{
    '@type': 'PropertyValue';
    name: string;
    value: string;
  }>;
}

/**
 * Schema.org Organization type
 */
export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  description?: string;
  address?: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality: string;
    addressCountry: string;
  };
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone: string;
    contactType: string;
    availableLanguage?: string[];
  };
  sameAs?: string[];
}

/**
 * Schema.org LocalBusiness type
 */
export interface LocalBusinessSchema {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness';
  name: string;
  url: string;
  image?: string;
  description?: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality: string;
    addressCountry: string;
  };
  telephone?: string;
  openingHours?: string;
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
}

/**
 * Generates Product schema.org JSON-LD
 */
export function generateProductSchema(
  product: Product,
  locale: Locale,
  _baseUrl: string
): ProductSchema {
  const schema: ProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name[locale],
    description: product.description[locale],
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
  };

  // Add images if available
  if (product.images.length > 0) {
    schema.image = product.images.map((img) => img.url);
  }

  // Add category
  schema.category = product.category;

  // Add additional properties
  const additionalProperties: ProductSchema['additionalProperty'] = [];

  // Origin
  if (product.origin.length > 0) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Origin',
      value: product.origin.join(', '),
    });
  }

  // Season
  if (product.season) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Season',
      value: product.season,
    });
  }

  // Certifications
  if (product.certifications.length > 0) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Certifications',
      value: product.certifications.join(', '),
    });
  }

  // Packaging options
  if (product.packagingOptions.length > 0) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Packaging Options',
      value: product.packagingOptions.join(', '),
    });
  }

  if (additionalProperties.length > 0) {
    schema.additionalProperty = additionalProperties;
  }

  return schema;
}

/**
 * Generates Organization schema.org JSON-LD
 */
export function generateOrganizationSchema(baseUrl: string): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'STE-SCPB',
    url: baseUrl,
    description:
      'Société camerounaise spécialisée dans le commerce de produits agricoles et matières premières: cacao, café, bois, maïs et plus.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Douala-Akwa',
      addressCountry: 'CM',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+237 676 905 938',
      contactType: 'sales',
      availableLanguage: ['French', 'English'],
    },
  };
}

/**
 * Generates LocalBusiness schema.org JSON-LD
 */
export function generateLocalBusinessSchema(baseUrl: string): LocalBusinessSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'STE-SCPB',
    url: baseUrl,
    description: 'Commerce de produits agricoles et matières premières - Cacao, Café, Bois, Maïs',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Douala-Akwa',
      addressCountry: 'CM',
    },
    telephone: '+237 676 905 938',
    openingHours: 'Mo-Sa 08:00-16:45',
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 4.0511,
      longitude: 9.7679,
    },
  };
}

/**
 * Renders schema as JSON-LD script tag content
 */
export function renderSchemaScript<T extends object>(schema: T): string {
  return JSON.stringify(schema, null, 0);
}

/**
 * Schema.org WebSite type with SearchAction
 */
export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  inLanguage: string[];
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

/**
 * Generates WebSite schema.org JSON-LD with SearchAction
 */
export function generateWebSiteSchema(baseUrl: string): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'STE-SCPB',
    url: baseUrl,
    description:
      'Export de produits agricoles camerounais - Cacao, Café, Bois, Maïs. Commerce B2B international.',
    inLanguage: ['fr', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/fr/produits?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Schema.org BreadcrumbList type
 */
export interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

/**
 * Generates BreadcrumbList schema.org JSON-LD
 */
export function generateBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>,
  baseUrl: string
): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`,
    })),
  };
}

/**
 * Schema.org Article type
 */
export interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  author: {
    '@type': 'Organization';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
}

/**
 * Generates Article schema.org JSON-LD
 */
export function generateArticleSchema(
  article: {
    title: string;
    description: string;
    image?: string;
    publishedAt: Date;
    updatedAt?: Date;
    slug: string;
  },
  locale: string,
  baseUrl: string
): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.publishedAt.toISOString(),
    dateModified: (article.updatedAt || article.publishedAt).toISOString(),
    author: {
      '@type': 'Organization',
      name: 'STE-SCPB',
    },
    publisher: {
      '@type': 'Organization',
      name: 'STE-SCPB',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/${locale}/actualites/${article.slug}`,
    },
  };
}

/**
 * Schema.org FAQPage type
 */
export interface FAQSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

/**
 * Generates FAQPage schema.org JSON-LD
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): FAQSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
