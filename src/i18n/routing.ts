/**
 * i18n Routing Configuration
 * Defines routing helpers for internationalized navigation
 */
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/domain/value-objects/Locale';
import { LOCALIZED_PATHNAMES } from '@/i18n/pathnames';

export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
  pathnames: LOCALIZED_PATHNAMES,
});
// Lightweight wrappers around Next.js' navigation APIs
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);

/** Typed href helpers for dynamic CMS routes */
export function productHref(slug: string) {
  return { pathname: '/produits/[slug]' as const, params: { slug } };
}

export function articleHref(slug: string) {
  return { pathname: '/actualites/[slug]' as const, params: { slug } };
}
