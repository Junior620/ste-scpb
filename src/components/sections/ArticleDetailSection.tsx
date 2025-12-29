'use client';

/**
 * Article Detail Section Component
 * Validates: Requirements 7.2, 7.4
 *
 * Displays full article content with:
 * - Proper typography
 * - Social sharing buttons
 * - Author information
 * - Related tags
 */

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import type { Article } from '@/domain/entities/Article';
import { formatArticleDate, getLocalizedArticleContent } from '@/domain/entities/Article';
import type { Locale } from '@/domain/value-objects/Locale';
import { Button } from '@/components/ui/Button';

export interface ArticleDetailSectionProps {
  article: Article;
  locale: Locale;
}

/**
 * Social sharing buttons component
 * Validates: Requirements 7.4
 */
function SocialShareButtons({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const t = useTranslations('news');
  
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = [
    {
      name: 'Twitter',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'Email',
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-foreground-muted">{t('share')}:</span>
      <div className="flex gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-background-secondary hover:bg-background-tertiary transition-colors text-foreground-muted hover:text-foreground"
            aria-label={`Share on ${link.name}`}
          >
            {link.icon}
          </a>
        ))}
      </div>
    </div>
  );
}

/**
 * Article tags component
 */
function ArticleTags({
  tags,
  locale,
}: {
  tags: Article['tags'];
  locale: Locale;
}) {
  const t = useTranslations('news');

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-foreground-muted">{t('tags')}:</span>
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="px-3 py-1 text-xs font-medium rounded-full bg-background-secondary text-foreground-muted"
        >
          {tag.name[locale]}
        </span>
      ))}
    </div>
  );
}

/**
 * Main Article Detail Section component
 */
export function ArticleDetailSection({
  article,
  locale,
}: ArticleDetailSectionProps) {
  const t = useTranslations('news');
  const tNav = useTranslations('nav');

  // Get the current URL for sharing
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const articleUrl = `${baseUrl}/${locale}/actualites/${article.slug}`;

  return (
    <article className="py-8 md:py-16">
      <div className="container mx-auto px-4">
        {/* Back link */}
        <div className="mb-8">
          <Link
            href="/actualites"
            className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tNav('news')}
          </Link>
        </div>

        {/* Article Header */}
        <header className="max-w-4xl mx-auto mb-8">
          {/* Category */}
          {article.category && (
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium rounded-full bg-primary text-primary-foreground">
              {article.category.name[locale]}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            {article.title[locale]}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-muted mb-6">
            {/* Author */}
            {article.author && (
              <div className="flex items-center gap-2">
                {article.author.avatar && (
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                    loading="lazy"
                  />
                )}
                <span>{article.author.name}</span>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time dateTime={article.publishedAt.toISOString()}>
                {t('publishedOn')} {formatArticleDate(article.publishedAt, locale)}
              </time>
            </div>
          </div>

          {/* Social sharing */}
          <SocialShareButtons
            title={article.title[locale]}
            url={articleUrl}
          />
        </header>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <Image
                src={article.featuredImage.url}
                alt={article.featuredImage.alt[locale]}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-3xl mx-auto">
          <div
            className="prose prose-lg prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-foreground-muted prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-ul:text-foreground-muted prose-ol:text-foreground-muted
              prose-li:marker:text-primary
              prose-blockquote:border-l-primary prose-blockquote:text-foreground-muted
              prose-code:text-primary prose-code:bg-background-secondary prose-code:px-1 prose-code:rounded
              prose-pre:bg-background-secondary prose-pre:border prose-pre:border-border"
            dangerouslySetInnerHTML={{
              __html: getLocalizedArticleContent(article, locale),
            }}
          />

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <ArticleTags tags={article.tags} locale={locale} />
            </div>
          )}

          {/* Bottom sharing */}
          <div className="mt-8 pt-8 border-t border-border">
            <SocialShareButtons
              title={article.title[locale]}
              url={articleUrl}
            />
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 rounded-xl bg-background-secondary text-center">
            <h3 className="text-xl font-semibold mb-4">
              {locale === 'fr' ? 'Intéressé par nos produits ?' : 'Interested in our products?'}
            </h3>
            <p className="text-foreground-muted mb-6">
              {locale === 'fr'
                ? 'Contactez notre équipe commerciale pour plus d\'informations.'
                : 'Contact our sales team for more information.'}
            </p>
            <Button asChild>
              <Link href="/contact">
                {locale === 'fr' ? 'Nous contacter' : 'Contact us'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ArticleDetailSection;
