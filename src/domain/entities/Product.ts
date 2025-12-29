import type { LocalizedContent, Locale } from '../value-objects/Locale';

/**
 * Product categories for STE-SCPB commodities
 * Validates: Requirements 4.2
 */
export const PRODUCT_CATEGORIES = [
  'cacao',
  'cafe',
  'bois',
  'mais',
  'hevea',
  'sesame',
  'cajou',
  'amandes',
  'sorgho',
  'soja',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/**
 * Product certifications
 */
export const CERTIFICATIONS = ['rainforest-alliance', 'utz', 'fairtrade', 'organic'] as const;

export type Certification = (typeof CERTIFICATIONS)[number];

/**
 * Packaging options for products
 */
export const PACKAGING_OPTIONS = ['bulk', 'bags', 'containers'] as const;

export type PackagingOption = (typeof PACKAGING_OPTIONS)[number];

/**
 * Product image with metadata
 */
export interface ProductImage {
  url: string;
  alt: LocalizedContent;
  width: number;
  height: number;
}

/**
 * Constellation configuration for 3D visualization
 */
export interface ConstellationConfig {
  nodes: ConstellationNode[];
  connections: [number, number][];
  color: string;
  glowIntensity: number;
  animationSpeed: number;
}

export interface ConstellationNode {
  id: string;
  position: [number, number, number];
  size: number;
  label?: string;
}

/**
 * Product entity
 * Validates: Requirements 4.2, 2.3
 */
export interface Product {
  id: string;
  slug: string;
  name: LocalizedContent;
  description: LocalizedContent;
  category: ProductCategory;
  origin: string[];
  season: string;
  certifications: Certification[];
  packagingOptions: PackagingOption[];
  images: ProductImage[];
  constellation: ConstellationConfig;
  relatedProducts: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product selection for RFQ form
 */
export interface ProductSelection {
  productId: string;
  productName: string;
}

/**
 * Validates if a string is a valid product category
 */
export function isValidProductCategory(value: string): value is ProductCategory {
  return PRODUCT_CATEGORIES.includes(value as ProductCategory);
}

/**
 * Validates if a string is a valid certification
 */
export function isValidCertification(value: string): value is Certification {
  return CERTIFICATIONS.includes(value as Certification);
}

/**
 * Validates if a string is a valid packaging option
 */
export function isValidPackagingOption(value: string): value is PackagingOption {
  return PACKAGING_OPTIONS.includes(value as PackagingOption);
}

/**
 * Gets localized product name
 */
export function getLocalizedProductName(product: Product, locale: Locale): string {
  return product.name[locale];
}

/**
 * Gets localized product description
 */
export function getLocalizedProductDescription(product: Product, locale: Locale): string {
  return product.description[locale];
}
