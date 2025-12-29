import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Rate Limiter configuration
 */
export interface RateLimiterConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Prefix for Redis keys */
  prefix: string;
  /** Enable analytics (default: true) */
  analytics?: boolean;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of remaining requests in the window */
  remaining: number;
  /** Seconds until the rate limit resets */
  retryAfter: number;
  /** Total limit for the window */
  limit: number;
}

/**
 * Rate limit configuration by type
 */
export const RATE_LIMIT_CONFIG = {
  contact: { limit: 5, windowSeconds: 3600 },
  rfq: { limit: 10, windowSeconds: 3600 },
  newsletter: { limit: 3, windowSeconds: 3600 },
} as const;

/**
 * Rate limiter types for different routes
 */
export type RateLimiterType = keyof typeof RATE_LIMIT_CONFIG;

// Lazy-initialized Redis client and rate limiters
let redisClient: Redis | null = null;
let contactLimiter: Ratelimit | null = null;
let rfqLimiter: Ratelimit | null = null;
let newsletterLimiter: Ratelimit | null = null;

/**
 * Creates or returns the Redis client (lazy initialization)
 */
function getRedisClient(): Redis {
  if (!redisClient) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        'Missing Upstash Redis configuration. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.'
      );
    }

    redisClient = new Redis({ url, token });
  }
  return redisClient;
}

/**
 * Creates a rate limiter with the specified configuration
 */
function createRateLimiter(config: RateLimiterConfig): Ratelimit {
  const redis = getRedisClient();

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.limit, `${config.windowSeconds} s`),
    analytics: config.analytics ?? true,
    prefix: config.prefix,
  });
}

/**
 * Contact form rate limiter: 5 requests per hour
 * Validates: Requirements 5.7
 */
export function getContactFormLimiter(): Ratelimit {
  if (!contactLimiter) {
    contactLimiter = createRateLimiter({
      ...RATE_LIMIT_CONFIG.contact,
      prefix: 'ratelimit:contact',
    });
  }
  return contactLimiter;
}

/**
 * RFQ form rate limiter: 10 requests per hour (B2B needs more)
 * Validates: Requirements 17.9
 */
export function getRfqFormLimiter(): Ratelimit {
  if (!rfqLimiter) {
    rfqLimiter = createRateLimiter({
      ...RATE_LIMIT_CONFIG.rfq,
      prefix: 'ratelimit:rfq',
    });
  }
  return rfqLimiter;
}

/**
 * Newsletter subscription rate limiter: 3 requests per hour
 */
export function getNewsletterLimiter(): Ratelimit {
  if (!newsletterLimiter) {
    newsletterLimiter = createRateLimiter({
      ...RATE_LIMIT_CONFIG.newsletter,
      prefix: 'ratelimit:newsletter',
    });
  }
  return newsletterLimiter;
}

/**
 * Basic IP address validation
 */
export function isValidIp(ip: string): boolean {
  // IPv4 validation with range check
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipv4Match = ip.match(ipv4Pattern);
  if (ipv4Match) {
    // Check each octet is in valid range (0-255)
    const octets = [ipv4Match[1], ipv4Match[2], ipv4Match[3], ipv4Match[4]];
    return octets.every((octet) => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  // IPv6 pattern (simplified - accepts common formats)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  if (ipv6Pattern.test(ip)) {
    // Additional check: should not have more than 8 groups
    const groups = ip.split(':');
    return groups.length <= 8;
  }

  return false;
}

/**
 * Extracts client identifier from request headers
 * Compatible with Vercel, Cloudflare, and other proxies
 * Validates: Requirements 5.7, 17.9
 * 
 * @param request - The incoming request
 * @returns Client IP address or 'unknown' if not determinable
 */
export function getClientIdentifier(request: Request): string {
  // 1. Try x-forwarded-for (standard proxy header)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take first IP (original client IP)
    const clientIp = forwarded.split(',')[0].trim();
    if (clientIp && isValidIp(clientIp)) {
      return clientIp;
    }
  }

  // 2. Try x-real-ip (nginx, some proxies)
  const realIp = request.headers.get('x-real-ip');
  if (realIp && isValidIp(realIp)) {
    return realIp;
  }

  // 3. Try cf-connecting-ip (Cloudflare)
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp && isValidIp(cfIp)) {
    return cfIp;
  }

  // 4. Try true-client-ip (Akamai, Cloudflare Enterprise)
  const trueClientIp = request.headers.get('true-client-ip');
  if (trueClientIp && isValidIp(trueClientIp)) {
    return trueClientIp;
  }

  // 5. Fallback to 'unknown' (will still rate limit, just less precise)
  return 'unknown';
}

/**
 * Checks rate limit for a given limiter and identifier
 * 
 * @param limiter - The rate limiter to use
 * @param identifier - Client identifier (usually IP address)
 * @returns Rate limit result
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<RateLimitResult> {
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  const now = Date.now();
  const retryAfter = success ? 0 : Math.ceil((reset - now) / 1000);

  return {
    allowed: success,
    remaining,
    retryAfter,
    limit,
  };
}

/**
 * Gets the appropriate rate limiter for a route type
 */
export function getRateLimiter(type: RateLimiterType): Ratelimit {
  switch (type) {
    case 'contact':
      return getContactFormLimiter();
    case 'rfq':
      return getRfqFormLimiter();
    case 'newsletter':
      return getNewsletterLimiter();
    default:
      throw new Error(`Unknown rate limiter type: ${type}`);
  }
}

/**
 * Resets the rate limiter instances (useful for testing)
 */
export function resetRateLimiters(): void {
  redisClient = null;
  contactLimiter = null;
  rfqLimiter = null;
  newsletterLimiter = null;
}
