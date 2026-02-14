import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/domain/value-objects/Locale';
import { SECURITY_HEADERS, buildCSPHeader, getCSPHeaderName } from '@/lib/security-headers';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
  localeDetection: true,
  // Don't add locale prefix to static files
  pathnames: {
    // This tells next-intl to not handle these paths
  } as any,
});

// Apply cache headers based on resource type
function applyCacheHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const { pathname } = request.nextUrl;

  // Static assets with content hashes (immutable)
  if (pathname.match(/\/_next\/static\/.+\.(js|css)$/)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
    return response;
  }

  // Images - long cache with stale-while-revalidate
  if (pathname.match(/\.(jpg|jpeg|png|webp|avif|gif|svg|ico)$/)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, stale-while-revalidate=86400'
    );
    // Add ETag support for conditional requests
    response.headers.set('ETag', `"${Date.now()}"`);
    return response;
  }

  // Fonts - immutable cache
  if (pathname.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
    return response;
  }

  // HTML pages - no cache to ensure freshness
  if (pathname.match(/\.html$/) || !pathname.includes('.')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, must-revalidate'
    );
    return response;
  }

  // API routes - private, no cache
  if (pathname.startsWith('/api/')) {
    response.headers.set(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // Default: no specific cache headers
  return response;
}

// Apply security headers to response
function applySecurityHeaders(response: NextResponse): NextResponse {
  // Apply standard security headers
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    response.headers.set(header, value as string);
  });

  // Apply CSP header
  const cspHeader = buildCSPHeader();
  const isProduction = process.env.NODE_ENV === 'production';
  const cspHeaderName = getCSPHeaderName(isProduction);

  response.headers.set(cspHeaderName, cspHeader);

  return response;
}

export default function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files - check both original path and without locale prefix
  const pathWithoutLocale = pathname.replace(/^\/(fr|en|ru)/, '');
  const isStaticFile = 
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|avif|mp4|webm|woff|woff2|ttf|otf|eot)$/) ||
    pathWithoutLocale.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|avif|mp4|webm|woff|woff2|ttf|otf|eot)$/) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api');

  if (isStaticFile) {
    // For static files with locale prefix, redirect to the file without locale
    if (pathname.match(/^\/(fr|en|ru)\/.+\.(png|jpg|jpeg|gif|svg|ico|webp|avif|mp4|webm|woff|woff2|ttf|otf|eot)$/)) {
      const url = request.nextUrl.clone();
      url.pathname = pathWithoutLocale;
      return NextResponse.redirect(url, 301); // Permanent redirect
    }
    return NextResponse.next();
  }

  // Run the intl middleware
  const response = intlMiddleware(request);

  // Apply cache headers based on resource type
  applyCacheHeaders(request, response);

  // Apply security headers to the response
  applySecurityHeaders(response);

  // Add X-Robots-Tag: noindex for preview/draft pages
  const url = request.nextUrl;
  if (url.searchParams.has('preview') || url.searchParams.has('draft')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  // Match all pathnames - we handle static file exclusion in the middleware function
  matcher: [
    // Match all pathnames except for
    // - /_next (Next.js internals)
    // - /api (API routes)
    // - /monitoring (Sentry tunnel)
    '/((?!api|_next/static|_next/image|monitoring).*)',
  ],
};
