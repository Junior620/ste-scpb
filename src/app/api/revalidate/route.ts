import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * CMS Webhook Revalidation API Route
 *
 * This endpoint is called by the CMS (Strapi/Sanity) when content is updated.
 * It triggers ISR revalidation for the affected pages.
 *
 * @example POST /api/revalidate
 * Body: { "secret": "xxx", "path": "/fr/produits", "tag": "products" }
 */

interface RevalidateRequest {
  secret: string;
  path?: string;
  tag?: string;
  type?: 'product' | 'article' | 'team' | 'all';
  slug?: string;
  locale?: 'fr' | 'en';
}

// Mapping of content types to paths
const CONTENT_TYPE_PATHS: Record<string, string[]> = {
  product: ['/produits', '/'],
  article: ['/actualites', '/'],
  team: ['/equipe'],
  all: ['/', '/produits', '/actualites', '/equipe'],
};

export async function POST(request: NextRequest) {
  try {
    const body: RevalidateRequest = await request.json();

    // Validate secret
    if (body.secret !== process.env.REVALIDATE_SECRET) {
      console.error('[Revalidate] Invalid secret provided');
      return NextResponse.json(
        { error: 'Invalid secret', revalidated: false },
        { status: 401 }
      );
    }

    const revalidatedPaths: string[] = [];
    const revalidatedTags: string[] = [];

    // Revalidate by tag if provided
    if (body.tag) {
      revalidateTag(body.tag, 'default');
      revalidatedTags.push(body.tag);
    }

    // Revalidate by path if provided
    if (body.path) {
      revalidatePath(body.path, 'page');
      revalidatedPaths.push(body.path);
    }

    // Revalidate by content type
    if (body.type) {
      const paths = CONTENT_TYPE_PATHS[body.type] || [];
      const locales = body.locale ? [body.locale] : ['fr', 'en'];

      for (const locale of locales) {
        for (const basePath of paths) {
          const fullPath = `/${locale}${basePath}`;
          revalidatePath(fullPath, 'page');
          revalidatedPaths.push(fullPath);
        }

        // If slug is provided, also revalidate the detail page
        if (body.slug && body.type !== 'all') {
          const detailPath = `/${locale}/${getDetailBasePath(body.type)}/${body.slug}`;
          revalidatePath(detailPath, 'page');
          revalidatedPaths.push(detailPath);
        }
      }
    }

    // If nothing specific was provided, revalidate the home page
    if (!body.path && !body.tag && !body.type) {
      revalidatePath('/fr', 'page');
      revalidatePath('/en', 'page');
      revalidatedPaths.push('/fr', '/en');
    }

    console.log('[Revalidate] Success', {
      paths: revalidatedPaths,
      tags: revalidatedTags,
    });

    return NextResponse.json({
      revalidated: true,
      paths: revalidatedPaths,
      tags: revalidatedTags,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Revalidate] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to revalidate',
        revalidated: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function getDetailBasePath(type: string): string {
  switch (type) {
    case 'product':
      return 'produits';
    case 'article':
      return 'actualites';
    default:
      return type;
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'revalidate',
    timestamp: new Date().toISOString(),
  });
}
