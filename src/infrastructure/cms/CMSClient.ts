import type { Product } from '@/domain/entities/Product';
import type { Article, ArticleListItem } from '@/domain/entities/Article';
import type { TeamMember } from '@/domain/entities/TeamMember';
import type { Locale } from '@/domain/value-objects/Locale';

/**
 * CMS Client interface - Abstract interface for headless CMS operations
 * Supports both Strapi and Sanity implementations
 * Validates: Requirements 4.2, 7.5, 11.3
 */
export interface CMSClient {
  /**
   * Fetches all products
   * @param locale - The locale for i18n content
   */
  getProducts(locale: Locale): Promise<Product[]>;

  /**
   * Fetches a single product by slug
   * @param slug - The product slug
   * @param locale - The locale for i18n content
   */
  getProductBySlug(slug: string, locale: Locale): Promise<Product | null>;

  /**
   * Fetches all product slugs (for static generation)
   */
  getAllProductSlugs(): Promise<string[]>;

  /**
   * Fetches articles with optional limit
   * @param locale - The locale for i18n content
   * @param limit - Optional limit for pagination
   */
  getArticles(locale: Locale, limit?: number): Promise<ArticleListItem[]>;

  /**
   * Fetches a single article by slug
   * @param slug - The article slug
   * @param locale - The locale for i18n content
   */
  getArticleBySlug(slug: string, locale: Locale): Promise<Article | null>;

  /**
   * Fetches all article slugs (for static generation)
   */
  getAllArticleSlugs(): Promise<string[]>;

  /**
   * Fetches team members
   * @param locale - The locale for i18n content
   */
  getTeamMembers(locale: Locale): Promise<TeamMember[]>;

  /**
   * Clears the internal cache
   * Useful for debugging and forcing fresh data
   */
  clearCache(): void;
}

/**
 * CMS Error types for better error handling
 */
export class CMSError extends Error {
  constructor(
    message: string,
    public readonly code: CMSErrorCode,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'CMSError';
  }
}

export type CMSErrorCode =
  | 'CONNECTION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED'
  | 'INVALID_RESPONSE'
  | 'UNKNOWN';

/**
 * CMS Response wrapper for cache metadata
 */
export interface CMSResponse<T> {
  data: T;
  meta?: {
    cached: boolean;
    cachedAt?: Date;
    revalidateAt?: Date;
  };
}
