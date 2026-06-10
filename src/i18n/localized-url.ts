import type { Locale } from '@/domain/value-objects/Locale';
import { LOCALIZED_PATHNAMES } from '@/i18n/localized-paths';

function getLocalizedSegment(locale: Locale, segment: string): string {
  const config = LOCALIZED_PATHNAMES[segment as keyof typeof LOCALIZED_PATHNAMES];
  if (!config) return segment;
  if (typeof config === 'string') return config === '/' ? '' : config;
  return config[locale] ?? config.fr;
}

/**
 * Resolve a localized pathname segment (without domain) for SEO/sitemap.
 */
export function resolveLocalizedPath(
  locale: Locale,
  pathname: string,
  params?: Record<string, string>
): string {
  let normalized = pathname === '' ? '/' : pathname.startsWith('/') ? pathname : `/${pathname}`;

  if (params) {
    normalized = Object.entries(params).reduce(
      (result, [key, value]) => result.replace(`[${key}]`, value),
      normalized
    );
  }

  if (normalized === '/') {
    return `/${locale}`;
  }

  const segments = normalized.split('/').filter(Boolean);
  if (segments.length === 0) {
    return `/${locale}`;
  }

  const firstSegment = `/${segments[0]}`;
  const localizedFirst = getLocalizedSegment(locale, firstSegment);
  const rest = segments.slice(1).join('/');

  return `/${locale}${localizedFirst}${rest ? `/${rest}` : ''}`;
}

export function resolveLocalizedUrl(
  baseUrl: string,
  locale: Locale,
  pathname: string,
  params?: Record<string, string>
): string {
  return `${baseUrl}${resolveLocalizedPath(locale, pathname, params)}`;
}
