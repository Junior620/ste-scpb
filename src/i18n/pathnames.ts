/**
 * Localized URL pathnames (internal keys use French filesystem paths).
 * @see https://next-intl.dev/docs/routing/configuration#pathnames
 */
export const LOCALIZED_PATHNAMES = {
  '/': '/',
  '/produits': {
    fr: '/produits',
    en: '/products',
    ru: '/produkty',
  },
  '/a-propos': {
    fr: '/a-propos',
    en: '/about',
    ru: '/o-nas',
  },
  '/equipe': {
    fr: '/equipe',
    en: '/team',
    ru: '/komanda',
  },
  '/actualites': {
    fr: '/actualites',
    en: '/news',
    ru: '/novosti',
  },
  '/contact': '/contact',
  '/devis': {
    fr: '/devis',
    en: '/quote',
    ru: '/zapros',
  },
  '/statistiques': {
    fr: '/statistiques',
    en: '/statistics',
    ru: '/statistika',
  },
  '/mentions-legales': {
    fr: '/mentions-legales',
    en: '/legal-notice',
    ru: '/yuridicheskaya-informaciya',
  },
  '/politique-confidentialite': {
    fr: '/politique-confidentialite',
    en: '/privacy-policy',
    ru: '/politika-konfidencialnosti',
  },
  '/conformite-eudr': {
    fr: '/conformite-eudr',
    en: '/eudr-compliance',
    ru: '/sootvetstvie-eudr',
  },
  '/tracabilite-cacao': {
    fr: '/tracabilite-cacao',
    en: '/cocoa-traceability',
    ru: '/otslezhivaemost-kakao',
  },
  '/cocoatrack': '/cocoatrack',
  '/partenaires': {
    fr: '/partenaires',
    en: '/partners',
    ru: '/partnery',
  },
  '/faq': '/faq',
  '/cas-usage': {
    fr: '/cas-usage',
    en: '/use-cases',
    ru: '/keysy-ispolzovaniya',
  },
  '/cocoatrack/demo': '/cocoatrack/demo',
  '/produits/[slug]': {
    fr: '/produits/[slug]',
    en: '/products/[slug]',
    ru: '/produkty/[slug]',
  },
  '/actualites/[slug]': {
    fr: '/actualites/[slug]',
    en: '/news/[slug]',
    ru: '/novosti/[slug]',
  },
} as const;
