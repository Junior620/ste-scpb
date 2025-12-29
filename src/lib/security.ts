/**
 * Security utilities for the STE-SCPB website
 * Provides helper functions for security-related operations
 */

/**
 * Required security headers that must be present on all responses
 * Based on OWASP recommendations and Requirements 14.5
 */
export const REQUIRED_SECURITY_HEADERS = [
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'Content-Security-Policy',
  'Strict-Transport-Security',
] as const;

export type SecurityHeader = (typeof REQUIRED_SECURITY_HEADERS)[number];

/**
 * Expected values for security headers
 */
export const EXPECTED_HEADER_VALUES: Record<string, string | RegExp> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': /camera=\(\), microphone=\(\)/,
  'Strict-Transport-Security': /max-age=\d+/,
};

/**
 * CSP directives that must be present
 */
export const REQUIRED_CSP_DIRECTIVES = [
  'default-src',
  'script-src',
  'style-src',
  'img-src',
  'connect-src',
  'frame-src',
  'object-src',
] as const;

/**
 * Check if a URL is using HTTPS
 */
export function isHttps(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Check if a URL is localhost (exempt from HTTPS requirement)
 */
export function isLocalhost(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '[::1]' // IPv6 with brackets
    );
  } catch {
    return false;
  }
}

/**
 * Validate that a URL enforces HTTPS (or is localhost)
 */
export function validateHttpsEnforcement(url: string): boolean {
  if (isLocalhost(url)) {
    return true; // Localhost is exempt
  }
  return isHttps(url);
}

/**
 * Parse CSP header into directives
 */
export function parseCSPHeader(cspHeader: string): Map<string, string[]> {
  const directives = new Map<string, string[]>();
  
  const parts = cspHeader.split(';').map(p => p.trim()).filter(Boolean);
  
  for (const part of parts) {
    const [directive, ...values] = part.split(/\s+/);
    if (directive) {
      directives.set(directive.toLowerCase(), values);
    }
  }
  
  return directives;
}

/**
 * Validate that all required CSP directives are present
 */
export function validateCSPDirectives(cspHeader: string): {
  valid: boolean;
  missingDirectives: string[];
} {
  const directives = parseCSPHeader(cspHeader);
  const missingDirectives: string[] = [];
  
  for (const required of REQUIRED_CSP_DIRECTIVES) {
    if (!directives.has(required)) {
      missingDirectives.push(required);
    }
  }
  
  return {
    valid: missingDirectives.length === 0,
    missingDirectives,
  };
}

/**
 * Validate security headers presence and values
 */
export function validateSecurityHeaders(headers: Headers | Record<string, string>): {
  valid: boolean;
  missingHeaders: string[];
  invalidHeaders: string[];
} {
  const missingHeaders: string[] = [];
  const invalidHeaders: string[] = [];
  
  const getHeader = (name: string): string | null => {
    if (headers instanceof Headers) {
      return headers.get(name);
    }
    return headers[name] ?? null;
  };
  
  for (const header of REQUIRED_SECURITY_HEADERS) {
    const value = getHeader(header);
    
    // Check for CSP or CSP-Report-Only
    if (header === 'Content-Security-Policy') {
      const cspValue = value ?? getHeader('Content-Security-Policy-Report-Only');
      if (!cspValue) {
        missingHeaders.push(header);
      }
      continue;
    }
    
    if (!value) {
      missingHeaders.push(header);
      continue;
    }
    
    // Validate expected values
    const expectedValue = EXPECTED_HEADER_VALUES[header];
    if (expectedValue) {
      if (expectedValue instanceof RegExp) {
        if (!expectedValue.test(value)) {
          invalidHeaders.push(header);
        }
      } else if (value !== expectedValue) {
        invalidHeaders.push(header);
      }
    }
  }
  
  return {
    valid: missingHeaders.length === 0 && invalidHeaders.length === 0,
    missingHeaders,
    invalidHeaders,
  };
}

/**
 * Get client identifier from request headers (for rate limiting)
 * Vercel/Proxy compatible
 */
export function getClientIdentifier(request: Request): string {
  // 1. Try x-forwarded-for (proxy/Vercel)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take first IP (client IP)
    return forwarded.split(',')[0].trim();
  }

  // 2. Try x-real-ip
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // 3. Fallback to unknown (will still rate limit, just less precise)
  return 'unknown';
}
