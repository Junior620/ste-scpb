import { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES } from '@/domain/value-objects/Locale';
import { createCMSClient } from '@/infrastructure/cms';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ste-scpb.com';

/**
 * Generate XML sitemap for the website
 * Includes all static pages and dynamic content from CMS
 * **Validates: Requirements 10.5**
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static pages with their priorities and change frequencies
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/produits', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/a-propos', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/equipe', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/actualites', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/devis', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/statistiques', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/mentions-legales', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/politique-confidentialite', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  // Add static pages for each locale
  for (const locale of SUPPORTED_LOCALES) {
    for (const page of staticPages) {
      sitemapEntries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  // Fetch dynamic content from CMS
  try {
    const cmsClient = await createCMSClient();

    // Add product pages
    const productSlugs = await cmsClient.getAllProductSlugs();
    for (const slug of productSlugs) {
      for (const locale of SUPPORTED_LOCALES) {
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}/produits/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    // Add article pages
    const articleSlugs = await cmsClient.getAllArticleSlugs();
    for (const slug of articleSlugs) {
      for (const locale of SUPPORTED_LOCALES) {
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}/actualites/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    // If CMS is unavailable, continue with static pages only
    console.error('Failed to fetch CMS content for sitemap:', error);
  }

  return sitemapEntries;
}
