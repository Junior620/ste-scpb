/**
 * CMS Raw Types - Types for raw CMS responses before transformation
 * These types represent the data structure from Strapi/Sanity with _fr/_en suffixed fields
 */

/**
 * Raw product from CMS (with suffixed i18n fields)
 */
export interface CMSProduct {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  category: string;
  origin: string[];
  season: string;
  certifications: string[];
  packaging_options: string[];
  images: CMSImage[];
  constellation_config: CMSConstellationConfig | null;
  related_products: CMSRelatedProduct[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Raw article from CMS
 */
export interface CMSArticle {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string;
  excerpt_fr: string;
  excerpt_en: string;
  content_fr: string;
  content_en: string;
  featured_image: CMSImage | null;
  category: CMSCategory | null;
  tags: CMSTag[];
  author: CMSAuthor | null;
  published_at: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Raw team member from CMS
 */
export interface CMSTeamMember {
  id: string;
  name: string;
  role_fr: string;
  role_en: string;
  bio_fr: string;
  bio_en: string;
  photo: CMSImage | null;
  is_ceo: boolean;
  order: number;
  email?: string;
  linkedin?: string;
}

/**
 * CMS Image type
 */
export interface CMSImage {
  url: string;
  alt_fr?: string;
  alt_en?: string;
  width: number;
  height: number;
}

/**
 * CMS Category type
 */
export interface CMSCategory {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
}

/**
 * CMS Tag type
 */
export interface CMSTag {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
}

/**
 * CMS Author type
 */
export interface CMSAuthor {
  id: string;
  name: string;
  avatar?: string;
}

/**
 * CMS Related Product reference
 */
export interface CMSRelatedProduct {
  id: string;
  slug: string;
}

/**
 * CMS Constellation Config
 */
export interface CMSConstellationConfig {
  nodes: Array<{
    id: string;
    position: [number, number, number];
    size: number;
    label?: string;
  }>;
  connections: [number, number][];
  color: string;
  glowIntensity: number;
  animationSpeed: number;
}

/**
 * Strapi API response wrapper
 */
export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Strapi single item response
 */
export interface StrapiSingleResponse<T> {
  data: T | null;
}
