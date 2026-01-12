/**
 * i18n Metadata Utilities
 * Generates hreflang tags and localized metadata for SEO
 */
import type { Metadata } from 'next';
import { Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/domain/value-objects/Locale';

/**
 * Base URL for the website
 * Should be set in environment variables for production
 */
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ste-scpb.com';

/**
 * Default Open Graph image
 */
export const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;

/**
 * Site name for Open Graph
 */
export const SITE_NAME = 'STE-SCPB';

/**
 * Generate alternate language links for hreflang tags
 * @param pathname - The current pathname without locale prefix
 * @param currentLocale - The current locale (optional, for locale-specific canonical)
 * @returns Object with alternates for metadata
 *
 * SEO Rule (REQ-7): Each language should have its own canonical (FR→FR, EN→EN)
 * Never cross-canonical between languages
 */
export function generateAlternateLanguages(
  pathname: string = '',
  currentLocale?: Locale
): Metadata['alternates'] {
  // Ensure pathname starts with /
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  // Generate language alternates
  const languages: Record<string, string> = {};

  for (const locale of SUPPORTED_LOCALES) {
    languages[locale] = `${BASE_URL}/${locale}${normalizedPath}`;
  }

  // Canonical should point to the current locale's URL (FR→FR, EN→EN)
  // If no locale provided, default to DEFAULT_LOCALE for backwards compatibility
  const canonicalLocale = currentLocale || DEFAULT_LOCALE;

  return {
    canonical: `${BASE_URL}/${canonicalLocale}${normalizedPath}`,
    languages,
  };
}

/**
 * Generate full metadata with hreflang for a page
 * @param options - Metadata options
 * @returns Complete metadata object with alternates
 */
export interface LocalizedMetadataOptions {
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Current pathname without locale prefix */
  pathname?: string;
  /** Current locale */
  locale: Locale;
  /** Open Graph image URL */
  ogImage?: string;
  /** Additional keywords */
  keywords?: string[];
  /** No index flag */
  noIndex?: boolean;
}

export function generateLocalizedMetadata({
  title,
  description,
  pathname = '',
  locale,
  ogImage,
  keywords,
  noIndex = false,
}: LocalizedMetadataOptions): Metadata {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const fullUrl = `${BASE_URL}/${locale}${normalizedPath}`;
  const imageUrl = ogImage || DEFAULT_OG_IMAGE;

  const metadata: Metadata = {
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    // Pass current locale to ensure canonical points to current language (REQ-7)
    alternates: generateAlternateLanguages(pathname, locale),
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: SITE_NAME,
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };

  if (keywords && keywords.length > 0) {
    metadata.keywords = keywords;
  }

  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  return metadata;
}

/**
 * Page-specific metadata configurations
 * Each page has unique title and description for SEO
 */
export interface PageMetadataConfig {
  titleKey: string;
  descriptionKey: string;
  pathname: string;
  keywords?: string[];
}

export const PAGE_METADATA_CONFIGS: Record<string, PageMetadataConfig> = {
  home: {
    titleKey: 'metadata.home.title',
    descriptionKey: 'metadata.home.description',
    pathname: '',
    keywords: ['cacao', 'café', 'bois', 'maïs', 'export', 'Cameroun', 'commodities', 'agriculture'],
  },
  products: {
    titleKey: 'metadata.products.title',
    descriptionKey: 'metadata.products.description',
    pathname: '/produits',
    keywords: ['produits agricoles', 'cacao', 'café', 'bois', 'export', 'B2B'],
  },
  team: {
    titleKey: 'metadata.team.title',
    descriptionKey: 'metadata.team.description',
    pathname: '/equipe',
    keywords: ['équipe', 'experts', 'commerce agricole'],
  },
  news: {
    titleKey: 'metadata.news.title',
    descriptionKey: 'metadata.news.description',
    pathname: '/actualites',
    keywords: ['actualités', 'nouvelles', 'agriculture', 'export'],
  },
  contact: {
    titleKey: 'metadata.contact.title',
    descriptionKey: 'metadata.contact.description',
    pathname: '/contact',
    keywords: ['contact', 'devis', 'partenariat'],
  },
  rfq: {
    titleKey: 'metadata.rfq.title',
    descriptionKey: 'metadata.rfq.description',
    pathname: '/devis',
    keywords: ['devis', 'demande', 'B2B', 'export'],
  },
  legalMentions: {
    titleKey: 'metadata.legalMentions.title',
    descriptionKey: 'metadata.legalMentions.description',
    pathname: '/mentions-legales',
  },
  privacyPolicy: {
    titleKey: 'metadata.privacyPolicy.title',
    descriptionKey: 'metadata.privacyPolicy.description',
    pathname: '/politique-confidentialite',
  },
};

/**
 * Get hreflang link elements for manual insertion
 * Useful for pages that need custom hreflang handling
 * @param pathname - The current pathname without locale prefix
 * @returns Array of link element props
 */
export function getHreflangLinks(pathname: string = ''): Array<{
  rel: string;
  hrefLang: string;
  href: string;
}> {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  const links: Array<{ rel: string; hrefLang: string; href: string }> = SUPPORTED_LOCALES.map(
    (locale) => ({
      rel: 'alternate',
      hrefLang: locale as string,
      href: `${BASE_URL}/${locale}${normalizedPath}`,
    })
  );

  // Add x-default pointing to default locale
  links.push({
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `${BASE_URL}/${DEFAULT_LOCALE}${normalizedPath}`,
  });

  return links;
}
