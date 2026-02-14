# Performance Testing Utilities

This directory contains utilities for testing and validating performance optimizations in the STE-SCPB website.

## Bundle Analysis

Functions for analyzing Next.js bundle statistics, calculating gzipped sizes, and identifying largest chunks.

### Usage

```typescript
import { 
  getBundleStats, 
  checkBundleBudgets, 
  generateBundleReport 
} from '@/lib/performance-testing';

// Get bundle statistics from build output
const stats = getBundleStats('.next');

// Check against performance budgets
const budgetCheck = checkBundleBudgets(stats, {
  maxJsSize: 200 * 1024, // 200KB
  maxCssSize: 50 * 1024, // 50KB
  maxTotalSize: 1000 * 1024, // 1MB
  maxInitialBundle: 200 * 1024, // 200KB
});

if (!budgetCheck.withinBudget) {
  console.error('Budget violations:', budgetCheck.violations);
}

// Generate human-readable report
console.log(generateBundleReport(stats));
```

### Functions

- `getBundleStats(buildDir)` - Analyze bundle from .next directory
- `calculateGzipSize(content)` - Calculate gzipped size of content
- `identifyLargestChunks(chunks, limit)` - Find largest chunks
- `formatBytes(bytes)` - Format bytes to human-readable string
- `checkBundleBudgets(stats, budgets)` - Validate against budgets
- `generateBundleReport(stats)` - Generate formatted report

## Cache Header Validation

Functions for parsing Cache-Control headers, validating headers against configuration, and checking ETag presence.

### Usage

```typescript
import { 
  validateCacheHeadersForPath,
  validateETag,
  CACHE_CONFIGS 
} from '@/lib/performance-testing';

// Validate cache headers for a specific path
const headers = {
  'cache-control': 'public, max-age=31536000, immutable',
  'etag': '"abc123"'
};

const validation = validateCacheHeadersForPath(
  '/_next/static/chunks/main-abc.js',
  headers
);

if (!validation.valid) {
  console.error('Cache header errors:', validation.errors);
}

// Validate ETag header
const etagValidation = validateETag(headers);
if (!etagValidation.valid) {
  console.error('ETag errors:', etagValidation.errors);
}
```

### Functions

- `parseCacheControl(header)` - Parse Cache-Control header string
- `validateCacheHeaders(headers, config)` - Validate against config
- `checkETagPresence(headers)` - Check if ETag exists
- `validateETag(headers)` - Validate ETag format
- `getResourceType(path)` - Determine resource type from path
- `validateCacheHeadersForPath(path, headers)` - Validate for specific path
- `generateCacheHeader(config)` - Generate Cache-Control header

### Predefined Configurations

The `CACHE_CONFIGS` object contains predefined configurations for:

- `static` - Static assets with content hashes (JS, CSS)
- `image` - Images with stale-while-revalidate
- `font` - Font files with immutable caching
- `html` - HTML pages with no-cache
- `api` - API routes with private no-cache
- `data` - Data resources with TTL

## Testing

Run tests for these utilities:

```bash
npm test -- src/lib/performance-testing/
```

## Requirements

These utilities implement the following requirements:

- **6.5**: JavaScript bundle size optimization
- **10.1**: Immutable cache headers for static assets
- **10.2**: Stale-while-revalidate for images and fonts
- **10.3**: No-cache headers for HTML pages
- **10.4**: Cache headers matching resource type
- **10.5**: Appropriate cache headers for API responses
- **10.6**: ETag support for conditional requests
- **11.5**: Bundle analysis in CI pipeline
