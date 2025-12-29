import { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Locale, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { BlogSection } from '@/components/sections/BlogSection';
import { createCMSClient } from '@/infrastructure/cms';
import type { ArticleListItem } from '@/domain/entities/Article';

// ISR: Revalidate every 30 minutes (articles update more frequently)
export const revalidate = 1800;

interface BlogPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  const t = await getTranslations({ locale: validLocale, namespace: 'metadata.news' });

  return generateLocalizedMetadata({
    title: t('title'),
    description: t('description'),
    pathname: '/actualites',
    locale: validLocale,
    keywords: ['actualités', 'nouvelles', 'agriculture', 'export', 'marché agricole'],
  });
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = await params;
  const { category } = await searchParams;

  // Enable static rendering
  if (isValidLocale(locale)) {
    setRequestLocale(locale as Locale);
  }

  // Fetch articles from CMS
  let articles: ArticleListItem[] = [];
  try {
    const cmsClient = createCMSClient();
    articles = await cmsClient.getArticles(locale as Locale);
  } catch {
    // Fallback to empty array if CMS is unavailable
    articles = [];
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background">
      <BlogSection
        articles={articles}
        initialCategory={category}
        locale={locale as Locale}
      />
    </main>
  );
}
