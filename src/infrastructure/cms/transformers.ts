import type { Product, ConstellationConfig, ProductImage } from '@/domain/entities/Product';
import type {
  Article,
  ArticleListItem,
  ArticleCategory,
  ArticleTag,
  ArticleAuthor,
  ArticleImage,
} from '@/domain/entities/Article';
import type { TeamMember, TeamMemberPhoto } from '@/domain/entities/TeamMember';
import type { LocalizedContent } from '@/domain/value-objects/Locale';
import type {
  CMSProduct,
  CMSArticle,
  CMSTeamMember,
  CMSImage,
  CMSCategory,
  CMSTag,
  CMSAuthor,
  CMSConstellationConfig,
} from './types';

/**
 * Transforms CMS i18n fields (_fr, _en, _ru) to LocalizedContent Record
 */
function toLocalizedContent(fr: string, en: string, ru: string = ''): LocalizedContent {
  return { fr, en, ru };
}

/**
 * Transforms CMS image to domain ProductImage
 */
function transformProductImage(image: CMSImage): ProductImage {
  return {
    url: image.url,
    alt: toLocalizedContent(image.alt_fr || '', image.alt_en || ''),
    width: image.width,
    height: image.height,
  };
}

/**
 * Transforms CMS image to domain ArticleImage
 */
function transformArticleImage(image: CMSImage): ArticleImage {
  return {
    url: image.url,
    alt: toLocalizedContent(image.alt_fr || '', image.alt_en || ''),
    width: image.width,
    height: image.height,
  };
}

/**
 * Transforms CMS image to domain TeamMemberPhoto
 */
function transformTeamMemberPhoto(image: CMSImage): TeamMemberPhoto {
  return {
    url: image.url,
    alt: image.alt_fr || image.alt_en || '',
    width: image.width,
    height: image.height,
  };
}

/**
 * Transforms CMS constellation config to domain ConstellationConfig
 */
function transformConstellationConfig(config: CMSConstellationConfig | null): ConstellationConfig {
  if (!config) {
    // Default constellation config
    return {
      nodes: [],
      connections: [],
      color: '#ffffff',
      glowIntensity: 1,
      animationSpeed: 1,
    };
  }
  return {
    nodes: config.nodes.map((node) => ({
      id: node.id,
      position: node.position,
      size: node.size,
      label: node.label,
    })),
    connections: config.connections,
    color: config.color,
    glowIntensity: config.glowIntensity,
    animationSpeed: config.animationSpeed,
  };
}

/**
 * Transforms CMS category to domain ArticleCategory
 */
function transformCategory(category: CMSCategory): ArticleCategory {
  return {
    id: category.id,
    slug: category.slug,
    name: toLocalizedContent(category.name_fr, category.name_en),
  };
}

/**
 * Transforms CMS tag to domain ArticleTag
 */
function transformTag(tag: CMSTag): ArticleTag {
  return {
    id: tag.id,
    slug: tag.slug,
    name: toLocalizedContent(tag.name_fr, tag.name_en),
  };
}

/**
 * Transforms CMS author to domain ArticleAuthor
 */
function transformAuthor(author: CMSAuthor): ArticleAuthor {
  return {
    id: author.id,
    name: author.name,
    avatar: author.avatar,
    link: author.link,
    isExternal: author.isExternal,
  };
}

/**
 * Transforms CMS Product to domain Product
 * Validates: Requirements 4.2
 */
export function transformProduct(cmsProduct: CMSProduct): Product {
  return {
    id: cmsProduct.id,
    slug: cmsProduct.slug,
    name: toLocalizedContent(cmsProduct.name_fr, cmsProduct.name_en),
    description: toLocalizedContent(cmsProduct.description_fr, cmsProduct.description_en),
    category: cmsProduct.category as Product['category'],
    origin: cmsProduct.origin,
    season: cmsProduct.season,
    certifications: cmsProduct.certifications as Product['certifications'],
    packagingOptions: cmsProduct.packaging_options as Product['packagingOptions'],
    images: cmsProduct.images.map(transformProductImage),
    constellation: transformConstellationConfig(cmsProduct.constellation_config),
    relatedProducts: cmsProduct.related_products.map((rp) => rp.slug),
    createdAt: new Date(cmsProduct.createdAt),
    updatedAt: new Date(cmsProduct.updatedAt),
  };
}

/**
 * Transforms CMS Article to domain Article
 * Validates: Requirements 7.1, 7.2
 */
export function transformArticle(cmsArticle: CMSArticle): Article {
  return {
    id: cmsArticle.id,
    slug: cmsArticle.slug,
    title: toLocalizedContent(cmsArticle.title_fr, cmsArticle.title_en),
    excerpt: toLocalizedContent(cmsArticle.excerpt_fr, cmsArticle.excerpt_en),
    content: toLocalizedContent(cmsArticle.content_fr, cmsArticle.content_en),
    featuredImage: cmsArticle.featured_image
      ? transformArticleImage(cmsArticle.featured_image)
      : undefined,
    category: cmsArticle.category ? transformCategory(cmsArticle.category) : undefined,
    tags: cmsArticle.tags.map(transformTag),
    author: cmsArticle.author ? transformAuthor(cmsArticle.author) : undefined,
    publishedAt: new Date(cmsArticle.published_at),
    createdAt: new Date(cmsArticle.createdAt),
    updatedAt: new Date(cmsArticle.updatedAt),
  };
}

/**
 * Transforms CMS Article to domain ArticleListItem (lighter version for listings)
 */
export function transformArticleListItem(cmsArticle: CMSArticle): ArticleListItem {
  return {
    id: cmsArticle.id,
    slug: cmsArticle.slug,
    title: toLocalizedContent(cmsArticle.title_fr, cmsArticle.title_en),
    excerpt: toLocalizedContent(cmsArticle.excerpt_fr, cmsArticle.excerpt_en),
    featuredImage: cmsArticle.featured_image
      ? transformArticleImage(cmsArticle.featured_image)
      : undefined,
    category: cmsArticle.category ? transformCategory(cmsArticle.category) : undefined,
    publishedAt: new Date(cmsArticle.published_at),
  };
}

/**
 * Transforms CMS TeamMember to domain TeamMember
 * Validates: Requirements 11.1, 11.2
 */
export function transformTeamMember(cmsMember: CMSTeamMember): TeamMember {
  return {
    id: cmsMember.id,
    name: cmsMember.name,
    role: toLocalizedContent(cmsMember.role_fr, cmsMember.role_en),
    bio: toLocalizedContent(cmsMember.bio_fr, cmsMember.bio_en),
    photo: cmsMember.photo ? transformTeamMemberPhoto(cmsMember.photo) : undefined,
    isCEO: cmsMember.is_ceo,
    order: cmsMember.order,
    email: cmsMember.email,
    linkedIn: cmsMember.linkedin,
  };
}
