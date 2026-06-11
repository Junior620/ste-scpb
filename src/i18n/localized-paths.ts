import type { Locale } from '@/domain/value-objects/Locale';
import { LOCALIZED_PATHNAMES } from '@/i18n/pathnames';

/**
 * Legacy French slugs still used in some EN/RU URLs — redirect to localized paths (301).
 *
 * Pages with identical slugs across locales (`/contact`, `/faq`, `/cocoatrack`, `/cocoatrack/demo`)
 * do not need entries here — the middleware skips when target === source.
 */
export const LEGACY_SLUG_REDIRECTS: Partial<Record<Exclude<Locale, 'fr'>, Record<string, string>>> =
  {
    en: {
      '/produits': '/products',
      '/a-propos': '/about',
      '/equipe': '/team',
      '/actualites': '/news',
      '/devis': '/quote',
      '/statistiques': '/statistics',
      '/mentions-legales': '/legal-notice',
      '/politique-confidentialite': '/privacy-policy',
      '/conformite-eudr': '/eudr-compliance',
      '/tracabilite-cacao': '/cocoa-traceability',
      '/partenaires': '/partners',
      '/cas-usage': '/use-cases',
    },
    ru: {
      '/produits': '/produkty',
      '/a-propos': '/o-nas',
      '/equipe': '/komanda',
      '/actualites': '/novosti',
      '/devis': '/zapros',
      '/statistiques': '/statistika',
      '/mentions-legales': '/yuridicheskaya-informaciya',
      '/politique-confidentialite': '/politika-konfidencialnosti',
      '/conformite-eudr': '/sootvetstvie-eudr',
      '/tracabilite-cacao': '/otslezhivaemost-kakao',
      '/partenaires': '/partnery',
      '/cas-usage': '/keysy-ispolzovaniya',
    },
  };

export { LOCALIZED_PATHNAMES };
