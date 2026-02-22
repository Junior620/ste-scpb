/**
 * Image Optimization Utilities
 * Provides helpers for optimizing Sanity CMS images with modern formats and proper sizing
 */

import imageUrlBuilder from '@sanity/image-url';

// Sanity project configuration
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0b1e7ens';
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

// Initialize Sanity image URL builder
const builder = imageUrlBuilder({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
});

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'auto';
  fit?: 'crop' | 'fill' | 'max' | 'min';
  auto?: 'format';
}

/**
 * Get optimized Sanity image URL with format and quality parameters
 * Automatically selects WebP/AVIF based on browser support
 */
export function getSanityImageUrl(
  source: any, // Using any to avoid type import issues
  options: ImageOptions = {}
): string {
  const { width, height, quality = 80, format = 'auto', fit = 'max', auto = 'format' } = options;

  let urlBuilder = builder.image(source);

  if (width) urlBuilder = urlBuilder.width(width);
  if (height) urlBuilder = urlBuilder.height(height);
  if (quality) urlBuilder = urlBuilder.quality(quality);
  if (fit) urlBuilder = urlBuilder.fit(fit);
  if (auto) urlBuilder = urlBuilder.auto(auto);
  if (format && format !== 'auto') {
    urlBuilder = urlBuilder.format(format as 'webp' | 'jpg' | 'png');
  }

  return urlBuilder.url();
}

/**
 * Generate responsive srcset for Sanity images
 * Creates multiple size variants for responsive loading
 */
export function generateSrcSet(
  source: any,
  sizes: number[] = [640, 750, 828, 1080, 1200, 1920],
  options: Omit<ImageOptions, 'width'> = {}
): string {
  return sizes
    .map((size) => {
      const url = getSanityImageUrl(source, { ...options, width: size });
      return `${url} ${size}w`;
    })
    .join(', ');
}

/**
 * Get optimized props for Next.js Image component
 */
export function getOptimizedImageProps(
  source: any,
  options: ImageOptions & { priority?: boolean; alt: string } = { alt: '' }
) {
  const { priority = false, alt, ...imageOptions } = options;

  return {
    src: getSanityImageUrl(source, imageOptions),
    alt,
    loading: priority ? ('eager' as const) : ('lazy' as const),
    fetchPriority: priority ? ('high' as const) : ('auto' as const),
  };
}
