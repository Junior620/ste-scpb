import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Locale, isValidLocale, SUPPORTED_LOCALES } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata, BASE_URL, SITE_NAME } from '@/i18n/metadata';
import { ArticleDetailSection } from '@/components/sections/ArticleDetailSection';
import { createCMSClient } from '@/infrastructure/cms';
import type { Article } from '@/domain/entities/Article';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

// ISR: Revalidate every 30 minutes
export const revalidate = 1800;

interface ArticleDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  try {
    const cmsClient = await createCMSClient();
    const slugs = await cmsClient.getAllArticleSlugs();
    return slugs.flatMap((articleSlug: string) =>
      SUPPORTED_LOCALES.map((locale) => ({ locale, slug: articleSlug }))
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  
  let article: Article | null = null;
  try {
    const cmsClient = await createCMSClient();
    article = await cmsClient.getArticleBySlug(slug, locale as Locale);
  } catch {
    // Article not found
  }

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  const articleTitle = article.title[validLocale];
  const articleExcerpt = article.excerpt[validLocale];
  const ogImage = article.featuredImage?.url;

  const metadata = generateLocalizedMetadata({
    title: articleTitle,
    description: articleExcerpt.substring(0, 160),
    pathname: `/actualites/${slug}`,
    locale: validLocale,
    ogImage,
    keywords: article.tags.map(tag => tag.name[validLocale]),
  });

  // Add article-specific Open Graph properties
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: 'article',
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: article.author ? [article.author.name] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { locale, slug } = await params;

  // Enable static rendering
  if (isValidLocale(locale)) {
    setRequestLocale(locale as Locale);
  }

  // Get translations for breadcrumb
  const t = await getTranslations({ locale, namespace: 'nav' });

  // Fetch article from CMS
  let article: Article | null = null;
  
  try {
    const cmsClient = await createCMSClient();
    article = await cmsClient.getArticleBySlug(slug, locale as Locale);
  } catch {
    // Article not found
  }

  if (!article) {
    notFound();
  }

  // Generate schema.org JSON-LD for Article
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title[validLocale],
    description: article.excerpt[validLocale],
    image: article.featuredImage?.url,
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: article.author
      ? {
          '@type': 'Person',
          name: article.author.name,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/${locale}/actualites/${slug}`,
    },
  };

  // Breadcrumb items: Accueil > Actualités > [Article Title]
  const breadcrumbItems = [
    { label: t('home'), href: `/${validLocale}` },
    { label: t('news'), href: `/${validLocale}/actualites` },
    { label: article.title[validLocale] },
  ];

  return (
    <>
      {/* Schema.org JSON-LD for Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-background">
        {/* Breadcrumb navigation */}
        <div className="container mx-auto px-4 pt-20">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <ArticleDetailSection
          article={article}
          locale={locale as Locale}
        />
      </main>
    </>
  );
}
