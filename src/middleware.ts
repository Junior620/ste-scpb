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
});

// Apply security headers to response
function applySecurityHeaders(response: NextResponse): NextResponse {
  // Apply standard security headers
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    response.headers.set(header, value);
  });

  // Apply CSP header
  const cspHeader = buildCSPHeader();
  const isProduction = process.env.NODE_ENV === 'production';
  const cspHeaderName = getCSPHeaderName(isProduction);

  response.headers.set(cspHeaderName, cspHeader);

  return response;
}

export default function middleware(request: NextRequest): NextResponse {
  // Run the intl middleware
  const response = intlMiddleware(request);

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
  // Match all pathnames except for
  // - API routes
  // - Static files
  // - Internal Next.js paths
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - /monitoring (Sentry tunnel)
    // - Static files (with extensions)
    '/((?!api|_next|_vercel|monitoring|.*\\..*).*)',
  ],
};
