import { Metadata } from 'next';
import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Locale, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { BlogSection } from '@/components/sections/BlogSection';
import { createCMSClient } from '@/infrastructure/cms';
import type { ArticleListItem } from '@/domain/entities/Article';
import { ArticlesGridSkeleton } from '@/components/ui';

// ISR: Revalidate every 30 minutes (articles update more frequently)
export const revalidate = 1800;

interface BlogPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
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

/**
 * Async component that fetches and displays articles
 */
async function ArticlesContent({
  locale,
  category,
  initialPage,
}: {
  locale: Locale;
  category?: string;
  initialPage?: number;
}) {
  // Fetch articles from CMS
  let articles: ArticleListItem[] = [];
  try {
    const cmsClient = await createCMSClient();
    articles = await cmsClient.getArticles(locale);
  } catch {
    // Fallback to empty array if CMS is unavailable
    articles = [];
  }

  return (
    <BlogSection
      articles={articles}
      initialCategory={category}
      initialPage={initialPage}
      locale={locale}
    />
  );
}

/**
 * Skeleton fallback for articles loading state
 */
function ArticlesLoadingFallback() {
  return (
    <section className="relative">
      {/* Hero skeleton */}
      <div className="relative h-[40vh] min-h-[300px] bg-background-secondary animate-pulse">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <div className="h-12 w-56 bg-border/50 rounded-lg mb-4" />
          <div className="h-6 w-72 max-w-full bg-border/50 rounded-lg" />
        </div>
      </div>
      {/* Grid skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-28 bg-border/50 rounded-full animate-pulse" />
          ))}
        </div>
        <ArticlesGridSkeleton count={6} />
      </div>
    </section>
  );
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = await params;
  const { category, page } = await searchParams;
  const initialPage = page ? parseInt(page, 10) : 1;

  // Enable static rendering
  if (isValidLocale(locale)) {
    setRequestLocale(locale as Locale);
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background">
      <Suspense fallback={<ArticlesLoadingFallback />}>
        <ArticlesContent locale={locale as Locale} category={category} initialPage={initialPage} />
      </Suspense>
    </main>
  );
}
