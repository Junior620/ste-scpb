import type { LocalizedContent, Locale } from '../value-objects/Locale';

/**
 * Article category
 * Validates: Requirements 7.1, 7.3
 */
export interface ArticleCategory {
  id: string;
  slug: string;
  name: LocalizedContent;
}

/**
 * Article tag
 */
export interface ArticleTag {
  id: string;
  slug: string;
  name: LocalizedContent;
}

/**
 * Article author
 */
export interface ArticleAuthor {
  id: string;
  name: string;
  avatar?: string;
}

/**
 * Article featured image
 */
export interface ArticleImage {
  url: string;
  alt: LocalizedContent;
  width: number;
  height: number;
}

/**
 * Article entity for blog/news section
 * Validates: Requirements 7.1, 7.2
 */
export interface Article {
  id: string;
  slug: string;
  title: LocalizedContent;
  excerpt: LocalizedContent;
  content: LocalizedContent;
  featuredImage?: ArticleImage;
  category?: ArticleCategory;
  tags: ArticleTag[];
  author?: ArticleAuthor;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Article list item (for listing pages)
 */
export interface ArticleListItem {
  id: string;
  slug: string;
  title: LocalizedContent;
  excerpt: LocalizedContent;
  featuredImage?: ArticleImage;
  category?: ArticleCategory;
  publishedAt: Date;
}

/**
 * Gets localized article title
 */
export function getLocalizedArticleTitle(article: Article | ArticleListItem, locale: Locale): string {
  return article.title[locale];
}

/**
 * Gets localized article excerpt
 */
export function getLocalizedArticleExcerpt(article: Article | ArticleListItem, locale: Locale): string {
  return article.excerpt[locale];
}

/**
 * Gets localized article content
 */
export function getLocalizedArticleContent(article: Article, locale: Locale): string {
  return article.content[locale];
}

/**
 * Formats article date for display
 */
export function formatArticleDate(date: Date, locale: Locale): string {
  return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
