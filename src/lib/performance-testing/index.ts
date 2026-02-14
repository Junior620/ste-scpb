/**
 * Performance Testing Utilities
 * 
 * Centralized exports for bundle analysis and cache header validation utilities.
 * 
 * Requirements: 6.5, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 11.5
 */

// Bundle analysis utilities
export {
  getBundleStats,
  calculateGzipSize,
  identifyLargestChunks,
  formatBytes,
  checkBundleBudgets,
  generateBundleReport,
  type BundleChunkStats,
  type BundleStats,
} from './bundle-analysis';

// Cache header validation utilities
export {
  parseCacheControl,
  validateCacheHeaders,
  checkETagPresence,
  validateETag,
  getResourceType,
  validateCacheHeadersForPath,
  generateCacheHeader,
  CACHE_CONFIGS,
  type CacheControlDirectives,
  type CacheConfig,
  type CacheHeaderValidation,
} from './cache-headers';
