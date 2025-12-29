import type { CMSClient, CMSErrorCode } from './CMSClient';
import { CMSError } from './CMSClient';
import type { Product } from '@/domain/entities/Product';
import type { Article, ArticleListItem } from '@/domain/entities/Article';
import type { TeamMember } from '@/domain/entities/TeamMember';
import type { Locale } from '@/domain/value-objects/Locale';
import type {
  CMSProduct,
  CMSArticle,
  CMSTeamMember,
  StrapiResponse,
} from './types';
import {
  transformProduct,
  transformArticle,
  transformArticleListItem,
  transformTeamMember,
} from './transformers';

/**
 * Strapi CMS Client configuration
 */
export interface StrapiClientConfig {
  baseUrl: string;
  apiToken: string;
  /** Cache TTL in seconds (default: 3600 = 1 hour) */
  cacheTTL?: number;
}

/**
 * In-memory cache entry
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Strapi CMS Client implementation
 * Implements CMSClient interface with i18n field transformation
 * Validates: Requirements 4.2, 7.5, 11.3
 */
export class StrapiClient implements CMSClient {
  private readonly baseUrl: string;
  private readonly apiToken: string;
  private readonly cacheTTL: number;
  private readonly cache: Map<string, CacheEntry<unknown>> = new Map();

  constructor(config: StrapiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiToken = config.apiToken;
    this.cacheTTL = config.cacheTTL ?? 3600;
  }

  /**
   * Makes an authenticated request to Strapi API
   */
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiToken}`,
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorCode = this.mapHttpStatusToErrorCode(response.status);
        throw new CMSError(
          `Strapi API error: ${response.status} ${response.statusText}`,
          errorCode
        );
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof CMSError) {
        throw error;
      }
      throw new CMSError(
        'Failed to connect to Strapi CMS',
        'CONNECTION_ERROR',
        error
      );
    }
  }

  /**
   * Maps HTTP status codes to CMS error codes
   */
  private mapHttpStatusToErrorCode(status: number): CMSErrorCode {
    switch (status) {
      case 401:
      case 403:
        return 'UNAUTHORIZED';
      case 404:
        return 'NOT_FOUND';
      case 429:
        return 'RATE_LIMITED';
      default:
        return 'UNKNOWN';
    }
  }

  /**
   * Gets data from cache or fetches from API
   */
  private async getWithCache<T>(
    cacheKey: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(cacheKey) as CacheEntry<T> | undefined;
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    try {
      const data = await fetcher();
      this.cache.set(cacheKey, {
        data,
        expiresAt: now + this.cacheTTL * 1000,
      });
      return data;
    } catch (error) {
      // If fetch fails and we have stale cache, return it as fallback
      if (cached) {
        console.warn(`Using stale cache for ${cacheKey} due to fetch error`);
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Clears the cache (useful for on-demand revalidation)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clears a specific cache entry
   */
  clearCacheEntry(key: string): void {
    this.cache.delete(key);
  }

  // ============================================
  // Products
  // ============================================

  async getProducts(_locale: Locale): Promise<Product[]> {
    const cacheKey = `products`;

    return this.getWithCache(cacheKey, async () => {
      const response = await this.fetch<StrapiResponse<CMSProduct[]>>(
        '/products?populate=*'
      );
      return response.data.map(transformProduct);
    });
  }

  async getProductBySlug(slug: string, _locale: Locale): Promise<Product | null> {
    const cacheKey = `product:${slug}`;

    return this.getWithCache(cacheKey, async () => {
      const response = await this.fetch<StrapiResponse<CMSProduct[]>>(
        `/products?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`
      );

      if (!response.data || response.data.length === 0) {
        return null;
      }

      return transformProduct(response.data[0]);
    });
  }

  async getAllProductSlugs(): Promise<string[]> {
    const cacheKey = 'product-slugs';

    return this.getWithCache(cacheKey, async () => {
      const response = await this.fetch<StrapiResponse<Array<{ slug: string }>>>(
        '/products?fields[0]=slug'
      );
      return response.data.map((p) => p.slug);
    });
  }

  // ============================================
  // Articles
  // ============================================

  async getArticles(_locale: Locale, limit?: number): Promise<ArticleListItem[]> {
    const cacheKey = `articles:${limit ?? 'all'}`;

    return this.getWithCache(cacheKey, async () => {
      let endpoint = '/articles?populate=*&sort=published_at:desc';
      if (limit) {
        endpoint += `&pagination[limit]=${limit}`;
      }

      const response = await this.fetch<StrapiResponse<CMSArticle[]>>(endpoint);
      return response.data.map(transformArticleListItem);
    });
  }

  async getArticleBySlug(slug: string, _locale: Locale): Promise<Article | null> {
    const cacheKey = `article:${slug}`;

    return this.getWithCache(cacheKey, async () => {
      const response = await this.fetch<StrapiResponse<CMSArticle[]>>(
        `/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`
      );

      if (!response.data || response.data.length === 0) {
        return null;
      }

      return transformArticle(response.data[0]);
    });
  }

  async getAllArticleSlugs(): Promise<string[]> {
    const cacheKey = 'article-slugs';

    return this.getWithCache(cacheKey, async () => {
      const response = await this.fetch<StrapiResponse<Array<{ slug: string }>>>(
        '/articles?fields[0]=slug'
      );
      return response.data.map((a) => a.slug);
    });
  }

  // ============================================
  // Team Members
  // ============================================

  async getTeamMembers(_locale: Locale): Promise<TeamMember[]> {
    const cacheKey = 'team-members';

    return this.getWithCache(cacheKey, async () => {
      const response = await this.fetch<StrapiResponse<CMSTeamMember[]>>(
        '/team-members?populate=*&sort=order:asc'
      );
      return response.data.map(transformTeamMember);
    });
  }
}

/**
 * Creates a Strapi client instance from environment variables
 */
export function createStrapiClient(): StrapiClient {
  const baseUrl = process.env.STRAPI_URL;
  const apiToken = process.env.STRAPI_API_TOKEN;

  if (!baseUrl || !apiToken) {
    throw new Error(
      'Missing Strapi configuration. Please set STRAPI_URL and STRAPI_API_TOKEN environment variables.'
    );
  }

  return new StrapiClient({
    baseUrl,
    apiToken,
    cacheTTL: parseInt(process.env.CMS_CACHE_TTL ?? '3600', 10),
  });
}
