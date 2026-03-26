/**
 * Prices API Route
 * Returns current commodity prices from Sanity CMS
 */

import { NextResponse } from 'next/server';
import { PriceServiceServer } from '@/infrastructure/cms/PriceServiceServer';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const prices = await PriceServiceServer.getPrices();

    return NextResponse.json({
      success: true,
      prices,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch prices',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
