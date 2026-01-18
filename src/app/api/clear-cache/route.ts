import { NextRequest, NextResponse } from 'next/server';
import { createCMSClient } from '@/infrastructure/cms';

export const dynamic = 'force-dynamic';

/**
 * Clear CMS Cache API Route
 *
 * This endpoint clears the in-memory cache of the CMS client.
 * Useful for debugging and forcing fresh data from Sanity.
 *
 * @example GET /api/clear-cache?secret=xxx
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Validate secret
    if (secret !== process.env.REVALIDATE_SECRET) {
      console.error('[Clear Cache] Invalid secret provided');
      return NextResponse.json({ error: 'Invalid secret', cleared: false }, { status: 401 });
    }

    // Clear the CMS cache
    const cmsClient = await createCMSClient();
    cmsClient.clearCache();

    console.log('[Clear Cache] Success - CMS cache cleared');

    return NextResponse.json({
      cleared: true,
      message: 'CMS cache cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Clear Cache] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to clear cache',
        cleared: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
