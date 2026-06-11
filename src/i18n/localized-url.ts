import type { Locale } from '@/domain/value-objects/Locale';
import { getPathname } from '@/i18n/routing';

type StaticHref = Parameters<typeof getPathname>[0]['href'];

/**
 * Resolve a localized pathname (without domain) via next-intl routing config.
 */
export function resolveLocalizedPath(
  locale: Locale,
  pathname: string,
  params?: Record<string, string>
): string {
  if (pathname.includes('[slug]') && params?.slug) {
    return getPathname({
      locale,
      href: {
        pathname: pathname as '/produits/[slug]' | '/actualites/[slug]',
        params: { slug: params.slug },
      },
    });
  }

  const href = (pathname === '' ? '/' : pathname) as StaticHref;
  return getPathname({ locale, href });
}

export function resolveLocalizedUrl(
  baseUrl: string,
  locale: Locale,
  pathname: string,
  params?: Record<string, string>
): string {
  return `${baseUrl}${resolveLocalizedPath(locale, pathname, params)}`;
}
