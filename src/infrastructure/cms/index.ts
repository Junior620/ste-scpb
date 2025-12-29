/**
 * CMS Infrastructure exports
 */
export type { CMSClient, CMSResponse, CMSErrorCode } from './CMSClient';
export { CMSError } from './CMSClient';

export type { StrapiClientConfig } from './StrapiClient';
export { StrapiClient, createStrapiClient } from './StrapiClient';

export type { SanityClientConfig, ExportStatisticsData } from './SanityClient';
export { SanityClient, createSanityClient } from './SanityClient';

export * from './types';
export * from './transformers';

/**
 * Creates the appropriate CMS client based on environment configuration
 * Uses CMS_PROVIDER env variable to determine which client to use
 */
export async function createCMSClient(): Promise<CMSClient> {
  const provider = process.env.CMS_PROVIDER || 'strapi';

  if (provider === 'sanity') {
    const { createSanityClient } = await import('./SanityClient');
    return createSanityClient();
  }

  const { createStrapiClient } = await import('./StrapiClient');
  return createStrapiClient();
}

// Re-export CMSClient type for convenience
import type { CMSClient } from './CMSClient';
