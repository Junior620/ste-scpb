import { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES, Locale } from '@/domain/value-objects/Locale';
import { createCMSClient } from '@/infrastructure/cms';
import { buildLocalizedUrl, buildLocalizedDynamicUrl } from '@/i18n/metadata';

/**
 * Generate XML sitemap for the website
 * Includes all static pages and dynamic content from CMS
 * **Validates: Requirements 10.5**
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/produits', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/conformite-eudr', priority: 0.95, changeFrequency: 'weekly' as const },
    { path: '/tracabilite-cacao', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/cocoatrack', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/cocoatrack/demo', priority: 0.85, changeFrequency: 'monthly' as const },
    { path: '/faq', priority: 0.75, changeFrequency: 'monthly' as const },
    { path: '/cas-usage', priority: 0.75, changeFrequency: 'monthly' as const },
    { path: '/a-propos', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/partenaires', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/equipe', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/actualites', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/devis', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/statistiques', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/mentions-legales', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/politique-confidentialite', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  for (const locale of SUPPORTED_LOCALES) {
    for (const page of staticPages) {
      sitemapEntries.push({
        url: buildLocalizedUrl(page.path, locale as Locale),
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  try {
    const cmsClient = await createCMSClient();
    const productSlugs = await cmsClient.getAllProductSlugs();
    for (const slug of productSlugs) {
      for (const locale of SUPPORTED_LOCALES) {
        sitemapEntries.push({
          url: buildLocalizedDynamicUrl('/produits/[slug]', locale as Locale, { slug }),
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    const articleSlugs = await cmsClient.getAllArticleSlugs();
    for (const slug of articleSlugs) {
      for (const locale of SUPPORTED_LOCALES) {
        sitemapEntries.push({
          url: buildLocalizedDynamicUrl('/actualites/[slug]', locale as Locale, { slug }),
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error('Failed to fetch CMS content for sitemap:', error);
  }

  return sitemapEntries;
}
