/**
 * i18n Metadata Utilities
 * Generates hreflang tags and localized metadata for SEO
 */
import type { Metadata } from 'next';
import { Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/domain/value-objects/Locale';
import { resolveLocalizedUrl } from '@/i18n/localized-url';

/**
 * Base URL for the website
 * Should be set in environment variables for production
 */
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ste-scpb.com';

/**
 * Default Open Graph image
 * Using dynamic OG image generation for better social media previews
 */
export const DEFAULT_OG_IMAGE = `${BASE_URL}/api/og`;

/**
 * Site name for Open Graph
 */
export const SITE_NAME = 'STE-SCPB';

/**
 * Open Graph locale for a given site locale
 */
export function getOpenGraphLocale(locale: Locale): string {
  switch (locale) {
    case 'fr':
      return 'fr_FR';
    case 'en':
      return 'en_US';
    case 'ru':
      return 'ru_RU';
    default:
      return 'fr_FR';
  }
}

/**
 * Build a fully qualified localized URL for hreflang/canonical tags
 */
export function buildLocalizedUrl(pathname: string, locale: Locale): string {
  return resolveLocalizedUrl(BASE_URL, locale, pathname);
}

export function buildLocalizedDynamicUrl(
  pathname: '/produits/[slug]' | '/actualites/[slug]',
  locale: Locale,
  params: { slug: string }
): string {
  return resolveLocalizedUrl(BASE_URL, locale, pathname, params);
}

/**
 * Generate alternate language links for hreflang tags
 * @param pathname - The current pathname without locale prefix (internal route key)
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
  const languages: Record<string, string> = {};

  for (const locale of SUPPORTED_LOCALES) {
    languages[locale] = buildLocalizedUrl(pathname, locale);
  }

  languages['x-default'] = buildLocalizedUrl(pathname, DEFAULT_LOCALE);

  const canonicalLocale = currentLocale || DEFAULT_LOCALE;

  return {
    canonical: buildLocalizedUrl(pathname, canonicalLocale),
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
  const fullUrl = buildLocalizedUrl(pathname, locale);
  const imageUrl = ogImage || DEFAULT_OG_IMAGE;

  const metadata: Metadata = {
    title: {
      absolute: title,
    },
    description,
    // Pass current locale to ensure canonical points to current language (REQ-7)
    alternates: generateAlternateLanguages(pathname, locale),
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: SITE_NAME,
      locale: getOpenGraphLocale(locale),
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
    keywords: [
      'export cacao Douala',
      'export cacao Cameroun',
      'fournisseur cacao Douala',
      'exportateur cacao Cameroun',
      'cacao Douala',
      'café',
      'bois',
      'maïs',
      'export',
      'Cameroun',
      'Douala',
      'commodities',
      'agriculture',
      'B2B',
    ],
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
  const links: Array<{ rel: string; hrefLang: string; href: string }> = SUPPORTED_LOCALES.map(
    (locale) => ({
      rel: 'alternate',
      hrefLang: locale as string,
      href: buildLocalizedUrl(pathname, locale),
    })
  );

  links.push({
    rel: 'alternate',
    hrefLang: 'x-default',
    href: buildLocalizedUrl(pathname, DEFAULT_LOCALE),
  });

  return links;
}
