import { NextResponse } from 'next/server';
import { createCMSClient } from '@/infrastructure/cms';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug =
      searchParams.get('slug') ||
      'campagne-cafeiere-2025-2026-le-coup-d-envoi-est-donne-a-baditoum';

    const cmsClient = await createCMSClient();
    const article = await cmsClient.getArticleBySlug(slug, 'fr');

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({
      article: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        author: article.author,
        publishedAt: article.publishedAt,
        category: article.category,
      },
    });
  } catch (error) {
    console.error('[Debug Article] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
