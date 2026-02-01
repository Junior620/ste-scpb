import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ste-scpb.com';

/**
 * Generate robots.txt for the website
 * Comprehensive rules for SEO optimization
 * **Validates: Requirements REQ-1 (SEO Optimization)**
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/_next/static/', // Allow Next.js static assets
          '/_next/image/', // Allow Next.js image optimization
        ],
        disallow: [
          '/api/', // Block API routes
          '/studio/', // Block Sanity Studio
          '/_next/data/', // Block Next.js internal data
          '/*?preview=*', // Block preview pages
          '/*?draft=*', // Block draft pages
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
