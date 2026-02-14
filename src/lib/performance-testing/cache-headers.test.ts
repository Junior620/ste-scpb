/**
 * Unit tests for cache header validation utilities
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */

import { describe, it, expect } from 'vitest';
import {
  parseCacheControl,
  validateCacheHeaders,
  checkETagPresence,
  validateETag,
  getResourceType,
  validateCacheHeadersForPath,
  generateCacheHeader,
  CACHE_CONFIGS,
  type CacheConfig,
} from './cache-headers';

describe('Cache Header Validation Utilities', () => {
  describe('parseCacheControl', () => {
    it('should parse simple directives', () => {
      const result = parseCacheControl('public, max-age=3600');
      
      expect(result.public).toBe(true);
      expect(result.maxAge).toBe(3600);
    });
    
    it('should parse immutable directive', () => {
      const result = parseCacheControl('public, max-age=31536000, immutable');
      
      expect(result.public).toBe(true);
      expect(result.maxAge).toBe(31536000);
      expect(result.immutable).toBe(true);
    });
    
    it('should parse stale-while-revalidate', () => {
      const result = parseCacheControl('public, max-age=3600, stale-while-revalidate=86400');
      
      expect(result.public).toBe(true);
      expect(result.maxAge).toBe(3600);
      expect(result.staleWhileRevalidate).toBe(86400);
    });
    
    it('should parse no-cache directive', () => {
      const result = parseCacheControl('no-cache, must-revalidate');
      
      expect(result.noCache).toBe(true);
      expect(result.mustRevalidate).toBe(true);
    });
    
    it('should parse private directive', () => {
      const result = parseCacheControl('private, no-store');
      
      expect(result.private).toBe(true);
      expect(result.noStore).toBe(true);
    });
    
    it('should handle empty string', () => {
      const result = parseCacheControl('');
      
      expect(result).toEqual({});
    });
    
    it('should handle s-maxage', () => {
      const result = parseCacheControl('public, max-age=3600, s-maxage=7200');
      
      expect(result.maxAge).toBe(3600);
      expect(result.sMaxAge).toBe(7200);
    });
    
    it('should be case-insensitive', () => {
      const result = parseCacheControl('Public, Max-Age=3600, Immutable');
      
      expect(result.public).toBe(true);
      expect(result.maxAge).toBe(3600);
      expect(result.immutable).toBe(true);
    });
  });
  
  describe('validateCacheHeaders', () => {
    it('should validate static asset headers', () => {
      const headers = {
        'cache-control': 'public, max-age=31536000, immutable',
      };
      
      const result = validateCacheHeaders(headers, CACHE_CONFIGS.static);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should detect missing Cache-Control header', () => {
      const headers = {};
      
      const result = validateCacheHeaders(headers, CACHE_CONFIGS.static);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing Cache-Control header');
    });
    
    it('should detect missing public directive', () => {
      const headers = {
        'cache-control': 'max-age=31536000, immutable',
      };
      
      const result = validateCacheHeaders(headers, CACHE_CONFIGS.static);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('public'))).toBe(true);
    });
    
    it('should detect missing immutable directive', () => {
      const headers = {
        'cache-control': 'public, max-age=31536000',
      };
      
      const result = validateCacheHeaders(headers, CACHE_CONFIGS.static);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('immutable'))).toBe(true);
    });
    
    it('should validate image headers with stale-while-revalidate', () => {
      const headers = {
        'cache-control': 'public, max-age=31536000, stale-while-revalidate=86400',
      };
      
      const result = validateCacheHeaders(headers, CACHE_CONFIGS.image);
      
      expect(result.valid).toBe(true);
    });
    
    it('should validate HTML no-cache headers', () => {
      const headers = {
        'cache-control': 'public, no-cache, must-revalidate',
      };
      
      const result = validateCacheHeaders(headers, CACHE_CONFIGS.html);
      
      expect(result.valid).toBe(true);
    });
    
    it('should validate private API headers', () => {
      const headers = {
        'cache-control': 'private, no-cache, must-revalidate',
      };
      
      const result = validateCacheHeaders(headers, CACHE_CONFIGS.api);
      
      expect(result.valid).toBe(true);
    });
    
    it('should work with Headers instance', () => {
      const headers = new Headers();
      headers.set('cache-control', 'public, max-age=31536000, immutable');
      
      const result = validateCacheHeaders(headers, CACHE_CONFIGS.static);
      
      expect(result.valid).toBe(true);
    });
    
    it('should warn about incorrect max-age', () => {
      const headers = {
        'cache-control': 'public, max-age=3600, immutable',
      };
      
      const result = validateCacheHeaders(headers, CACHE_CONFIGS.static);
      
      expect(result.warnings.some(w => w.includes('max-age'))).toBe(true);
    });
  });
  
  describe('checkETagPresence', () => {
    it('should detect ETag in object headers', () => {
      const headers = { etag: '"abc123"' };
      
      expect(checkETagPresence(headers)).toBe(true);
    });
    
    it('should detect ETag with capital E', () => {
      const headers = { ETag: '"abc123"' };
      
      expect(checkETagPresence(headers)).toBe(true);
    });
    
    it('should detect missing ETag', () => {
      const headers = { 'cache-control': 'public' };
      
      expect(checkETagPresence(headers)).toBe(false);
    });
    
    it('should work with Headers instance', () => {
      const headers = new Headers();
      headers.set('etag', '"abc123"');
      
      expect(checkETagPresence(headers)).toBe(true);
    });
  });
  
  describe('validateETag', () => {
    it('should validate properly formatted strong ETag', () => {
      const headers = { etag: '"abc123"' };
      
      const result = validateETag(headers);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should validate weak ETag with warning', () => {
      const headers = { etag: 'W/"abc123"' };
      
      const result = validateETag(headers);
      
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes('weak'))).toBe(true);
    });
    
    it('should detect missing ETag', () => {
      const headers = {};
      
      const result = validateETag(headers);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing ETag header for conditional requests');
    });
    
    it('should detect invalid ETag format', () => {
      const headers = { etag: 'abc123' }; // Missing quotes
      
      const result = validateETag(headers);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid ETag format'))).toBe(true);
    });
    
    it('should work with Headers instance', () => {
      const headers = new Headers();
      headers.set('etag', '"abc123"');
      
      const result = validateETag(headers);
      
      expect(result.valid).toBe(true);
    });
  });
  
  describe('getResourceType', () => {
    it('should identify static assets', () => {
      expect(getResourceType('/_next/static/chunks/main-abc123.js')).toBe('static');
      expect(getResourceType('/_next/static/css/app-xyz789.css')).toBe('static');
    });
    
    it('should identify images', () => {
      expect(getResourceType('/images/hero.jpg')).toBe('image');
      expect(getResourceType('/photo.png')).toBe('image');
      expect(getResourceType('/logo.webp')).toBe('image');
      expect(getResourceType('/icon.svg')).toBe('image');
    });
    
    it('should identify fonts', () => {
      expect(getResourceType('/fonts/montserrat.woff2')).toBe('font');
      expect(getResourceType('/font.ttf')).toBe('font');
    });
    
    it('should identify API routes', () => {
      expect(getResourceType('/api/contact')).toBe('api');
      expect(getResourceType('/api/products/123')).toBe('api');
    });
    
    it('should identify HTML pages', () => {
      expect(getResourceType('/about.html')).toBe('html');
      expect(getResourceType('/products')).toBe('html');
      expect(getResourceType('/')).toBe('html');
    });
    
    it('should default to data for unknown types', () => {
      expect(getResourceType('/data.json')).toBe('data');
    });
  });
  
  describe('validateCacheHeadersForPath', () => {
    it('should validate static asset path', () => {
      const headers = {
        'cache-control': 'public, max-age=31536000, immutable',
      };
      
      const result = validateCacheHeadersForPath(
        '/_next/static/chunks/main-abc.js',
        headers
      );
      
      expect(result.valid).toBe(true);
    });
    
    it('should validate image path', () => {
      const headers = {
        'cache-control': 'public, max-age=31536000, stale-while-revalidate=86400',
      };
      
      const result = validateCacheHeadersForPath('/images/hero.jpg', headers);
      
      expect(result.valid).toBe(true);
    });
    
    it('should validate API path', () => {
      const headers = {
        'cache-control': 'private, no-cache, must-revalidate',
      };
      
      const result = validateCacheHeadersForPath('/api/contact', headers);
      
      expect(result.valid).toBe(true);
    });
  });
  
  describe('generateCacheHeader', () => {
    it('should generate static asset header', () => {
      const header = generateCacheHeader(CACHE_CONFIGS.static);
      
      expect(header).toBe('public, max-age=31536000, immutable');
    });
    
    it('should generate image header with SWR', () => {
      const header = generateCacheHeader(CACHE_CONFIGS.image);
      
      expect(header).toContain('public');
      expect(header).toContain('max-age=31536000');
      expect(header).toContain('stale-while-revalidate=86400');
    });
    
    it('should generate no-cache header for HTML', () => {
      const header = generateCacheHeader(CACHE_CONFIGS.html);
      
      expect(header).toContain('public');
      expect(header).toContain('no-cache');
      expect(header).toContain('must-revalidate');
    });
    
    it('should generate private header for API', () => {
      const header = generateCacheHeader(CACHE_CONFIGS.api);
      
      expect(header).toContain('private');
      expect(header).toContain('no-cache');
    });
    
    it('should generate custom config header', () => {
      const config: CacheConfig = {
        resourceType: 'data',
        maxAge: 7200,
        staleWhileRevalidate: 3600,
        immutable: false,
        scope: 'public',
      };
      
      const header = generateCacheHeader(config);
      
      expect(header).toContain('public');
      expect(header).toContain('max-age=7200');
      expect(header).toContain('stale-while-revalidate=3600');
      expect(header).not.toContain('immutable');
    });
  });
});
