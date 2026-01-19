import { createClient, type SanityClient as SanityClientType } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { CMSClient, CMSErrorCode } from './CMSClient';
import { CMSError } from './CMSClient';
import type { Product, ConstellationConfig } from '@/domain/entities/Product';
import type { Article, ArticleListItem } from '@/domain/entities/Article';
import type { TeamMember } from '@/domain/entities/TeamMember';
import type { Locale, LocalizedContent } from '@/domain/value-objects/Locale';

/**
 * Sanity CMS Client configuration
 */
export interface SanityClientConfig {
  projectId: string;
  dataset: string;
  apiToken?: string;
  useCdn?: boolean;
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
 * Raw Sanity product type
 */
interface SanityProduct {
  _id: string;
  name: { fr: string; en: string };
  slug: { current: string };
  description?: { fr: string; en: string };
  category: string;
  isFlagship?: boolean;
  image?: SanityImage;
  gallery?: SanityImage[];
  origin?: { region?: string; country?: string };
  technicalSpecs?: {
    humidity?: number;
    fatContent?: number;
    grainCount?: number;
    fermentationDays?: number;
    aromaticProfile?: { fr?: string; en?: string; ru?: string };
    grade?: string;
    standard?: string;
  };
  packaging?: {
    type?: string;
    weight?: number;
    containerCapacity?: string;
  };
  certifications?: string[];
  moq?: string;
  availability?: { fr?: string; en?: string; ru?: string };
  incoterms?: string[];
  order?: number;
  _createdAt: string;
  _updatedAt: string;
}

/**
 * Raw Sanity article type
 */
interface SanityArticle {
  _id: string;
  title: { fr: string; en: string };
  slug: { current: string };
  category?: string;
  excerpt?: { fr: string; en: string };
  content?: { fr: unknown[]; en: unknown[]; ru?: unknown[] };
  image?: SanityImage;
  publishedAt: string;
  author?:
    | {
        // New format (object with authorType)
        authorType?: string;
        teamMember?: {
          _id: string;
          name: string | { fr: string; en: string; ru?: string };
          photo?: SanityImage;
        };
        externalName?: string;
        externalLink?: string;
      }
    | {
        // Old format (direct reference to team member)
        _id: string;
        name: string | { fr: string; en: string; ru?: string };
        photo?: SanityImage;
      };
  relatedProducts?: Array<{ slug: { current: string } }>;
  featured?: boolean;
  _createdAt: string;
  _updatedAt: string;
}

/**
 * Raw Sanity team member type
 */
interface SanityTeamMember {
  _id: string;
  name: string | { fr: string; en: string; ru?: string }; // Support both old (string) and new (object) formats
  role: { fr: string; en: string; ru?: string };
  department?: string;
  bio?: { fr: string; en: string; ru?: string };
  photo?: SanityImage;
  email?: string;
  phone?: string;
  linkedin?: string;
  isKeyContact?: boolean;
  order?: number;
}

/**
 * Raw Sanity export statistics type
 */
interface SanityExportStatistics {
  lastUpdated: string;
  kpi?: {
    tonnesExported?: number;
    countriesServed?: number;
    producerPartners?: number;
    yearsExperience?: number;
    tracedLots?: number;
  };
  exportsByRegion?: Array<{
    region: string;
    percentage: number;
    countries?: string[];
  }>;
  topDestinations?: Array<{
    country: string;
    countryCode: string;
    percentage: number;
    port?: string;
  }>;
  monthlyVolumes?: Array<{
    month: string;
    year: number;
    volume: number;
  }>;
  productMix?: Array<{
    product: string;
    slug: string;
    volume: number;
    percentage: number;
    color: string;
  }>;
}

/**
 * Export statistics data type (transformed)
 */
export interface ExportStatisticsData {
  lastUpdated: string;
  kpi: {
    tonnesExported: number;
    countriesServed: number;
    producerPartners: number;
    yearsExperience: number;
    tracedLots: number;
  };
  exportsByRegion: Array<{
    region: 'eu' | 'asia' | 'usa' | 'africa' | 'other';
    percentage: number;
    countries: string[];
  }>;
  topDestinations: Array<{
    country: string;
    countryCode: string;
    percentage: number;
    port?: string;
  }>;
  monthlyVolumes: Array<{
    month: string;
    year: number;
    volume: number;
  }>;
  productMix: Array<{
    product: string;
    slug: string;
    volume: number;
    percentage: number;
    color: string;
  }>;
}

/**
 * Sanity image reference
 */
interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

/**
 * Sanity CMS Client implementation
 * Implements CMSClient interface for Sanity
 */
export class SanityClient implements CMSClient {
  private readonly client: SanityClientType;
  private readonly imageBuilder: ReturnType<typeof imageUrlBuilder>;
  private readonly cacheTTL: number;
  private readonly cache: Map<string, CacheEntry<unknown>> = new Map();

  constructor(config: SanityClientConfig) {
    this.client = createClient({
      projectId: config.projectId,
      dataset: config.dataset,
      token: config.apiToken,
      useCdn: config.useCdn ?? true,
      apiVersion: '2024-01-01',
    });
    this.imageBuilder = imageUrlBuilder(this.client);
    // Use shorter cache in development for faster iteration
    const isDev = process.env.NODE_ENV === 'development';
    this.cacheTTL = isDev ? 60 : (config.cacheTTL ?? 3600); // 1 min in dev, 1 hour in prod
  }

  /**
   * Gets image URL from Sanity image reference
   */
  private getImageUrl(image: SanityImage | undefined, width = 800): string {
    if (!image?.asset?._ref) {
      return '/images/placeholder-product.svg';
    }
    try {
      const url = this.imageBuilder
        .image(image)
        .width(width)
        .height(width) // Make it square for profile photos
        .fit('crop')
        .auto('format')
        .quality(85)
        .url();
      return url || '/images/placeholder-product.svg';
    } catch {
      return '/images/placeholder-product.svg';
    }
  }

  /**
   * Makes a GROQ query to Sanity
   */
  private async query<T>(groq: string, params?: Record<string, string>): Promise<T> {
    try {
      return await this.client.fetch<T>(groq, params ?? {});
    } catch (error) {
      const errorCode = this.mapErrorToCode(error);
      throw new CMSError(
        `Sanity query error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorCode,
        error
      );
    }
  }

  /**
   * Maps errors to CMS error codes
   */
  private mapErrorToCode(error: unknown): CMSErrorCode {
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        return 'UNAUTHORIZED';
      }
      if (error.message.includes('404')) {
        return 'NOT_FOUND';
      }
      if (error.message.includes('429')) {
        return 'RATE_LIMITED';
      }
      if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        return 'CONNECTION_ERROR';
      }
    }
    return 'UNKNOWN';
  }

  /**
   * Gets data from cache or fetches from API
   */
  private async getWithCache<T>(cacheKey: string, fetcher: () => Promise<T>): Promise<T> {
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
      if (cached) {
        console.warn(`Using stale cache for ${cacheKey} due to fetch error`);
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Clears the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Transforms Sanity product to domain Product
   */
  private transformProduct(sanityProduct: SanityProduct): Product {
    const toLocalized = (obj?: { fr?: string; en?: string; ru?: string }): LocalizedContent => ({
      fr: obj?.fr || '',
      en: obj?.en || '',
      ru: obj?.ru || '',
    });

    const defaultConstellation: ConstellationConfig = {
      nodes: [],
      connections: [],
      color: '#D4A574',
      glowIntensity: 1,
      animationSpeed: 1,
    };

    return {
      id: sanityProduct._id,
      slug: sanityProduct.slug.current,
      name: toLocalized(sanityProduct.name),
      description: toLocalized(sanityProduct.description),
      category: sanityProduct.category as Product['category'],
      origin: sanityProduct.origin?.region ? [sanityProduct.origin.region] : [],
      season: sanityProduct.availability?.fr || '',
      certifications: (sanityProduct.certifications || []) as Product['certifications'],
      packagingOptions: sanityProduct.packaging?.type ? ['bulk'] : [],
      images: [
        {
          url: this.getImageUrl(sanityProduct.image),
          alt: toLocalized(sanityProduct.name),
          width: 800,
          height: 600,
        },
        ...(sanityProduct.gallery || []).map((img) => ({
          url: this.getImageUrl(img),
          alt: toLocalized(sanityProduct.name),
          width: 800,
          height: 600,
        })),
      ],
      constellation: defaultConstellation,
      relatedProducts: [],
      createdAt: new Date(sanityProduct._createdAt),
      updatedAt: new Date(sanityProduct._updatedAt),
    };
  }

  /**
   * Transforms Sanity article to domain Article
   */
  private transformArticle(sanityArticle: SanityArticle): Article {
    const toLocalized = (obj?: { fr?: string; en?: string; ru?: string }): LocalizedContent => ({
      fr: obj?.fr || '',
      en: obj?.en || '',
      ru: obj?.ru || '',
    });

    // Transform author - handle both old and new formats
    let author: Article['author'] = undefined;
    if (sanityArticle.author) {
      // Check if it's the new format (has authorType field)
      if ('authorType' in sanityArticle.author) {
        const authorType = sanityArticle.author.authorType || 'team';

        if (authorType === 'team' && sanityArticle.author.teamMember) {
          const teamMemberName =
            typeof sanityArticle.author.teamMember.name === 'string'
              ? sanityArticle.author.teamMember.name
              : sanityArticle.author.teamMember.name.fr; // Use French name as default

          author = {
            id: sanityArticle.author.teamMember._id,
            name: teamMemberName,
            avatar: sanityArticle.author.teamMember.photo
              ? this.getImageUrl(sanityArticle.author.teamMember.photo, 100)
              : undefined,
            isExternal: false,
          };
        } else if (authorType === 'external' && sanityArticle.author.externalName) {
          author = {
            id: `external-${sanityArticle._id}`,
            name: sanityArticle.author.externalName,
            link: sanityArticle.author.externalLink,
            isExternal: true,
          };
        }
      } else if ('_id' in sanityArticle.author && '_id' in sanityArticle.author) {
        // Old format - direct reference to team member
        const teamMemberName =
          typeof sanityArticle.author.name === 'string'
            ? sanityArticle.author.name
            : sanityArticle.author.name.fr; // Use French name as default

        author = {
          id: sanityArticle.author._id,
          name: teamMemberName,
          avatar: sanityArticle.author.photo
            ? this.getImageUrl(sanityArticle.author.photo, 100)
            : undefined,
          isExternal: false,
        };
      }
    }

    return {
      id: sanityArticle._id,
      slug: sanityArticle.slug.current,
      title: toLocalized(sanityArticle.title),
      excerpt: toLocalized(sanityArticle.excerpt),
      content: {
        fr: sanityArticle.content?.fr ? JSON.stringify(sanityArticle.content.fr) : '',
        en: sanityArticle.content?.en ? JSON.stringify(sanityArticle.content.en) : '',
        ru: sanityArticle.content?.ru ? JSON.stringify(sanityArticle.content.ru) : '',
      },
      featuredImage: sanityArticle.image
        ? {
            url: this.getImageUrl(sanityArticle.image),
            alt: toLocalized(sanityArticle.title),
            width: 1200,
            height: 630,
          }
        : undefined,
      category: sanityArticle.category
        ? {
            id: sanityArticle.category,
            slug: sanityArticle.category,
            name: {
              fr: sanityArticle.category,
              en: sanityArticle.category,
              ru: sanityArticle.category,
            },
          }
        : undefined,
      tags: [],
      author,
      publishedAt: new Date(sanityArticle.publishedAt),
      createdAt: new Date(sanityArticle._createdAt),
      updatedAt: new Date(sanityArticle._updatedAt),
    };
  }

  /**
   * Transforms Sanity article to ArticleListItem
   */
  private transformArticleListItem(sanityArticle: SanityArticle): ArticleListItem {
    const toLocalized = (obj?: { fr?: string; en?: string; ru?: string }): LocalizedContent => ({
      fr: obj?.fr || '',
      en: obj?.en || '',
      ru: obj?.ru || '',
    });

    return {
      id: sanityArticle._id,
      slug: sanityArticle.slug.current,
      title: toLocalized(sanityArticle.title),
      excerpt: toLocalized(sanityArticle.excerpt),
      featuredImage: sanityArticle.image
        ? {
            url: this.getImageUrl(sanityArticle.image),
            alt: toLocalized(sanityArticle.title),
            width: 800,
            height: 450,
          }
        : undefined,
      category: sanityArticle.category
        ? {
            id: sanityArticle.category,
            slug: sanityArticle.category,
            name: {
              fr: sanityArticle.category,
              en: sanityArticle.category,
              ru: sanityArticle.category,
            },
          }
        : undefined,
      publishedAt: new Date(sanityArticle.publishedAt),
    };
  }

  /**
   * Transforms Sanity team member to domain TeamMember
   */
  private transformTeamMember(sanityMember: SanityTeamMember): TeamMember {
    const toLocalized = (obj?: { fr?: string; en?: string; ru?: string }): LocalizedContent => ({
      fr: obj?.fr || '',
      en: obj?.en || '',
      ru: obj?.ru || '',
    });

    // Handle both old format (string) and new format (object with localized names)
    const memberName =
      typeof sanityMember.name === 'string' ? sanityMember.name : sanityMember.name.fr; // Use French name as default for alt text

    const localizedName =
      typeof sanityMember.name === 'string'
        ? { fr: sanityMember.name, en: sanityMember.name, ru: sanityMember.name }
        : toLocalized(sanityMember.name);

    return {
      id: sanityMember._id,
      name: localizedName,
      role: toLocalized(sanityMember.role),
      bio: toLocalized(sanityMember.bio),
      photo: sanityMember.photo
        ? {
            url: this.getImageUrl(sanityMember.photo, 400),
            alt: memberName,
            width: 400,
            height: 400,
          }
        : undefined,
      isCEO: sanityMember.department === 'management',
      order: sanityMember.order || 0,
      email: sanityMember.email,
      linkedIn: sanityMember.linkedin,
    };
  }

  // ============================================
  // Products
  // ============================================

  async getProducts(_locale: Locale): Promise<Product[]> {
    const cacheKey = 'products';

    return this.getWithCache(cacheKey, async () => {
      const products = await this.query<SanityProduct[]>(`
        *[_type == "product"] | order(order asc) {
          _id,
          name,
          slug,
          description,
          category,
          isFlagship,
          image,
          gallery,
          origin,
          technicalSpecs,
          packaging,
          certifications,
          moq,
          availability,
          incoterms,
          order,
          _createdAt,
          _updatedAt
        }
      `);
      return products.map((p) => this.transformProduct(p));
    });
  }

  async getProductBySlug(slug: string, _locale: Locale): Promise<Product | null> {
    const cacheKey = `product:${slug}`;

    return this.getWithCache(cacheKey, async () => {
      const products = await this.query<SanityProduct[]>(
        `*[_type == "product" && slug.current == $slug][0...1] {
          _id,
          name,
          slug,
          description,
          category,
          isFlagship,
          image,
          gallery,
          origin,
          technicalSpecs,
          packaging,
          certifications,
          moq,
          availability,
          incoterms,
          order,
          _createdAt,
          _updatedAt
        }`,
        { slug }
      );

      if (!products || products.length === 0) {
        return null;
      }

      return this.transformProduct(products[0]);
    });
  }

  async getAllProductSlugs(): Promise<string[]> {
    const cacheKey = 'product-slugs';

    return this.getWithCache(cacheKey, async () => {
      const products = await this.query<Array<{ slug: { current: string } }>>(
        `*[_type == "product"] { slug }`
      );
      return products.map((p) => p.slug.current);
    });
  }

  // ============================================
  // Articles
  // ============================================

  async getArticles(_locale: Locale, limit?: number): Promise<ArticleListItem[]> {
    const cacheKey = `articles:${limit ?? 'all'}`;

    return this.getWithCache(cacheKey, async () => {
      const limitClause = limit ? `[0...${limit}]` : '';
      const articles = await this.query<SanityArticle[]>(`
        *[_type == "article"] | order(publishedAt desc) ${limitClause} {
          _id,
          title,
          slug,
          category,
          excerpt,
          image,
          publishedAt,
          featured,
          _createdAt,
          _updatedAt
        }
      `);
      return articles.map((a) => this.transformArticleListItem(a));
    });
  }

  async getArticleBySlug(slug: string, _locale: Locale): Promise<Article | null> {
    const cacheKey = `article:${slug}`;

    return this.getWithCache(cacheKey, async () => {
      const articles = await this.query<SanityArticle[]>(
        `*[_type == "article" && slug.current == $slug][0...1] {
          _id,
          title,
          slug,
          category,
          excerpt,
          content,
          image,
          publishedAt,
          author {
            authorType,
            teamMember->{
              _id,
              name,
              photo
            },
            externalName,
            externalLink,
            // Also fetch old format for backward compatibility
            _id,
            name,
            photo
          },
          relatedProducts[]->{
            slug
          },
          featured,
          _createdAt,
          _updatedAt
        }`,
        { slug }
      );

      if (!articles || articles.length === 0) {
        return null;
      }

      return this.transformArticle(articles[0]);
    });
  }

  async getAllArticleSlugs(): Promise<string[]> {
    const cacheKey = 'article-slugs';

    return this.getWithCache(cacheKey, async () => {
      const articles = await this.query<Array<{ slug: { current: string } }>>(
        `*[_type == "article"] { slug }`
      );
      return articles.map((a) => a.slug.current);
    });
  }

  // ============================================
  // Team Members
  // ============================================

  async getTeamMembers(_locale: Locale): Promise<TeamMember[]> {
    const cacheKey = 'team-members';

    return this.getWithCache(cacheKey, async () => {
      const members = await this.query<SanityTeamMember[]>(`
        *[_type == "teamMember"] | order(order asc) {
          _id,
          name,
          role,
          department,
          bio,
          photo,
          email,
          phone,
          linkedin,
          isKeyContact,
          order
        }
      `);
      return members.map((m) => this.transformTeamMember(m));
    });
  }

  // ============================================
  // Export Statistics
  // ============================================

  async getExportStatistics(): Promise<ExportStatisticsData | null> {
    const cacheKey = 'export-statistics';

    try {
      return await this.getWithCache(cacheKey, async () => {
        const stats = await this.query<SanityExportStatistics[]>(`
          *[_type == "exportStatistics"][0...1] {
            lastUpdated,
            kpi,
            exportsByRegion,
            topDestinations,
            monthlyVolumes,
            productMix
          }
        `);

        if (!stats || stats.length === 0) {
          return null;
        }

        return this.transformExportStatistics(stats[0]);
      });
    } catch (error) {
      console.warn('[SanityClient] Failed to fetch export statistics, returning null:', error);
      return null;
    }
  }

  /**
   * Transforms Sanity export statistics to domain format
   */
  private transformExportStatistics(sanityStats: SanityExportStatistics): ExportStatisticsData {
    return {
      lastUpdated: sanityStats.lastUpdated,
      kpi: {
        tonnesExported: sanityStats.kpi?.tonnesExported ?? 0,
        countriesServed: sanityStats.kpi?.countriesServed ?? 0,
        producerPartners: sanityStats.kpi?.producerPartners ?? 0,
        yearsExperience: sanityStats.kpi?.yearsExperience ?? 0,
        tracedLots: sanityStats.kpi?.tracedLots ?? 0,
      },
      exportsByRegion: (sanityStats.exportsByRegion || []).map((r) => ({
        region: r.region as 'eu' | 'asia' | 'usa' | 'africa' | 'other',
        percentage: r.percentage,
        countries: r.countries || [],
      })),
      topDestinations: (sanityStats.topDestinations || []).map((d) => ({
        country: d.country,
        countryCode: d.countryCode,
        percentage: d.percentage,
        port: d.port,
      })),
      monthlyVolumes: (sanityStats.monthlyVolumes || []).map((v) => ({
        month: v.month,
        year: v.year,
        volume: v.volume,
      })),
      productMix: (sanityStats.productMix || []).map((p) => ({
        product: p.product,
        slug: p.slug,
        volume: p.volume,
        percentage: p.percentage,
        color: p.color,
      })),
    };
  }
}

/**
 * Creates a Sanity client instance from environment variables
 */
export function createSanityClient(): SanityClient {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;
  const apiToken = process.env.SANITY_API_TOKEN;

  if (!projectId || !dataset) {
    throw new Error(
      'Missing Sanity configuration. Please set SANITY_PROJECT_ID and SANITY_DATASET environment variables.'
    );
  }

  return new SanityClient({
    projectId,
    dataset,
    apiToken,
    useCdn: process.env.NODE_ENV === 'production',
    cacheTTL: parseInt(process.env.CMS_CACHE_TTL ?? '3600', 10),
  });
}
