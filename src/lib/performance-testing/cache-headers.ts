/**
 * Cache Header Validation Utilities
 * 
 * Functions to parse Cache-Control headers, validate headers against configuration,
 * and check ETag presence.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */

/**
 * Parsed Cache-Control header directives
 */
export interface CacheControlDirectives {
  public?: boolean;
  private?: boolean;
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
  proxyRevalidate?: boolean;
  immutable?: boolean;
  maxAge?: number; // seconds
  sMaxAge?: number; // seconds
  staleWhileRevalidate?: number; // seconds
  staleIfError?: number; // seconds
}

/**
 * Cache configuration for a resource type
 */
export interface CacheConfig {
  resourceType: 'static' | 'image' | 'font' | 'html' | 'api' | 'data';
  maxAge: number; // seconds
  staleWhileRevalidate?: number; // seconds
  immutable: boolean;
  scope: 'public' | 'private';
}

/**
 * Validation result for cache headers
 */
export interface CacheHeaderValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Parse Cache-Control header string into structured directives
 * 
 * @param cacheControl - Cache-Control header value
 * @returns Parsed directives object
 * 
 * @example
 * parseCacheControl('public, max-age=31536000, immutable')
 * // Returns: { public: true, maxAge: 31536000, immutable: true }
 */
export function parseCacheControl(cacheControl: string): CacheControlDirectives {
  const directives: CacheControlDirectives = {};
  
  if (!cacheControl) {
    return directives;
  }
  
  // Split by comma and process each directive
  const parts = cacheControl.split(',').map(part => part.trim());
  
  for (const part of parts) {
    const [key, value] = part.split('=').map(s => s.trim());
    const lowerKey = key.toLowerCase();
    
    switch (lowerKey) {
      case 'public':
        directives.public = true;
        break;
      case 'private':
        directives.private = true;
        break;
      case 'no-cache':
        directives.noCache = true;
        break;
      case 'no-store':
        directives.noStore = true;
        break;
      case 'must-revalidate':
        directives.mustRevalidate = true;
        break;
      case 'proxy-revalidate':
        directives.proxyRevalidate = true;
        break;
      case 'immutable':
        directives.immutable = true;
        break;
      case 'max-age':
        directives.maxAge = parseInt(value, 10);
        break;
      case 's-maxage':
        directives.sMaxAge = parseInt(value, 10);
        break;
      case 'stale-while-revalidate':
        directives.staleWhileRevalidate = parseInt(value, 10);
        break;
      case 'stale-if-error':
        directives.staleIfError = parseInt(value, 10);
        break;
    }
  }
  
  return directives;
}

/**
 * Validate cache headers against expected configuration
 * 
 * @param headers - Response headers object or Headers instance
 * @param config - Expected cache configuration
 * @returns Validation result with errors and warnings
 */
export function validateCacheHeaders(
  headers: Record<string, string> | Headers,
  config: CacheConfig
): CacheHeaderValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Get Cache-Control header
  const cacheControl = headers instanceof Headers
    ? headers.get('cache-control')
    : headers['cache-control'] || headers['Cache-Control'];
  
  if (!cacheControl) {
    errors.push('Missing Cache-Control header');
    return { valid: false, errors, warnings };
  }
  
  const directives = parseCacheControl(cacheControl);
  
  // Validate scope (public/private)
  if (config.scope === 'public' && !directives.public) {
    errors.push(`Expected 'public' directive for ${config.resourceType} resources`);
  }
  if (config.scope === 'private' && !directives.private) {
    errors.push(`Expected 'private' directive for ${config.resourceType} resources`);
  }
  
  // Validate max-age
  if (config.maxAge > 0) {
    if (directives.maxAge === undefined) {
      errors.push(`Missing 'max-age' directive`);
    } else if (directives.maxAge !== config.maxAge) {
      warnings.push(
        `max-age is ${directives.maxAge}s, expected ${config.maxAge}s`
      );
    }
  } else if (config.maxAge === 0) {
    // For no-cache scenarios
    if (!directives.noCache && directives.maxAge !== 0) {
      errors.push(`Expected 'no-cache' or 'max-age=0' for ${config.resourceType}`);
    }
  }
  
  // Validate immutable
  if (config.immutable && !directives.immutable) {
    errors.push(`Expected 'immutable' directive for ${config.resourceType} resources`);
  }
  
  // Validate stale-while-revalidate
  if (config.staleWhileRevalidate !== undefined) {
    if (directives.staleWhileRevalidate === undefined) {
      warnings.push(`Missing 'stale-while-revalidate' directive`);
    } else if (directives.staleWhileRevalidate !== config.staleWhileRevalidate) {
      warnings.push(
        `stale-while-revalidate is ${directives.staleWhileRevalidate}s, expected ${config.staleWhileRevalidate}s`
      );
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if ETag header is present in response
 * 
 * @param headers - Response headers object or Headers instance
 * @returns True if ETag header exists
 */
export function checkETagPresence(headers: Record<string, string> | Headers): boolean {
  if (headers instanceof Headers) {
    return headers.has('etag');
  }
  return 'etag' in headers || 'ETag' in headers;
}

/**
 * Validate that ETag header is present and properly formatted
 * 
 * @param headers - Response headers object or Headers instance
 * @returns Validation result
 */
export function validateETag(
  headers: Record<string, string> | Headers
): CacheHeaderValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const etag = headers instanceof Headers
    ? headers.get('etag')
    : headers['etag'] || headers['ETag'];
  
  if (!etag) {
    errors.push('Missing ETag header for conditional requests');
    return { valid: false, errors, warnings };
  }
  
  // Validate ETag format (should be quoted string or W/"...")
  const validFormat = /^(W\/)?"[^"]*"$/.test(etag);
  if (!validFormat) {
    errors.push(`Invalid ETag format: ${etag}`);
  }
  
  // Check for weak ETag
  if (etag.startsWith('W/')) {
    warnings.push('Using weak ETag (W/), consider strong ETag for better caching');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Predefined cache configurations for different resource types
 */
export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  static: {
    resourceType: 'static',
    maxAge: 31536000, // 1 year
    immutable: true,
    scope: 'public',
  },
  image: {
    resourceType: 'image',
    maxAge: 31536000, // 1 year
    staleWhileRevalidate: 86400, // 1 day
    immutable: false,
    scope: 'public',
  },
  font: {
    resourceType: 'font',
    maxAge: 31536000, // 1 year
    immutable: true,
    scope: 'public',
  },
  html: {
    resourceType: 'html',
    maxAge: 0,
    immutable: false,
    scope: 'public',
  },
  api: {
    resourceType: 'api',
    maxAge: 0,
    immutable: false,
    scope: 'private',
  },
  data: {
    resourceType: 'data',
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 1 day
    immutable: false,
    scope: 'public',
  },
};

/**
 * Determine resource type from URL path
 * 
 * @param path - URL path
 * @returns Resource type
 */
export function getResourceType(path: string): CacheConfig['resourceType'] {
  // Static assets with hashes
  if (path.match(/\/_next\/static\/.+\.(js|css)$/)) {
    return 'static';
  }
  
  // Images
  if (path.match(/\.(jpg|jpeg|png|webp|avif|svg|ico|gif)$/i)) {
    return 'image';
  }
  
  // Fonts
  if (path.match(/\.(woff|woff2|ttf|otf|eot)$/i)) {
    return 'font';
  }
  
  // API routes
  if (path.startsWith('/api/')) {
    return 'api';
  }
  
  // HTML pages
  if (path.match(/\.html$/) || !path.includes('.')) {
    return 'html';
  }
  
  // Default to data
  return 'data';
}

/**
 * Validate cache headers for a given URL path
 * 
 * @param path - URL path
 * @param headers - Response headers
 * @returns Validation result
 */
export function validateCacheHeadersForPath(
  path: string,
  headers: Record<string, string> | Headers
): CacheHeaderValidation {
  const resourceType = getResourceType(path);
  const config = CACHE_CONFIGS[resourceType];
  
  return validateCacheHeaders(headers, config);
}

/**
 * Generate cache header string from configuration
 * 
 * @param config - Cache configuration
 * @returns Cache-Control header value
 */
export function generateCacheHeader(config: CacheConfig): string {
  const parts: string[] = [];
  
  // Scope
  parts.push(config.scope);
  
  // Max-age
  if (config.maxAge === 0) {
    parts.push('no-cache');
    parts.push('must-revalidate');
  } else {
    parts.push(`max-age=${config.maxAge}`);
  }
  
  // Immutable
  if (config.immutable) {
    parts.push('immutable');
  }
  
  // Stale-while-revalidate
  if (config.staleWhileRevalidate !== undefined) {
    parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }
  
  return parts.join(', ');
}
