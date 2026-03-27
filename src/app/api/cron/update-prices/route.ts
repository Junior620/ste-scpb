/**
 * Cron Job: Update Commodity Prices
 * Automatically fetches and updates prices in Sanity CMS
 * Triggered by Vercel Cron Jobs
 *
 * Schedule: Monday-Friday at 17:30 UTC (18:30 WAT in winter, 19:30 WAT in summer)
 * Captures ICE London Cocoa closing price (market closes at 17:00 London time)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PriceServiceServer } from '@/infrastructure/cms/PriceServiceServer';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting price update cron job...');

    // 1. Récupérer les prix actuels depuis Sanity (pour comparaison)
    const currentPrices = await PriceServiceServer.getPrices();
    console.log(`Current prices in Sanity: ${currentPrices.length}`);

    // 2. Fetch new prices from external source
    const fetchResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/prices/fetch`
    );

    if (!fetchResponse.ok) {
      throw new Error('Failed to fetch prices from source');
    }

    const { prices: newPrices } = await fetchResponse.json();

    if (!newPrices || newPrices.length === 0) {
      throw new Error('No prices returned from source');
    }

    // 3. Calculer les variations automatiquement
    const pricesWithTrends = newPrices.map((newPrice: any) => {
      // Trouver le prix précédent pour ce produit
      const oldPrice = currentPrices.find((p) => p.product === newPrice.product);

      if (!oldPrice) {
        // Pas de prix précédent, on garde stable
        console.log(`${newPrice.product}: Nouveau produit, tendance stable`);
        return newPrice;
      }

      // Calculer la variation en pourcentage
      const priceDiff = newPrice.price - oldPrice.price;
      const percentChange = (priceDiff / oldPrice.price) * 100;

      // Déterminer la tendance (seuil de 0.1% pour éviter les micro-variations)
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (percentChange > 0.1) {
        trend = 'up';
      } else if (percentChange < -0.1) {
        trend = 'down';
      }

      console.log(
        `${newPrice.product}: ${oldPrice.price} → ${newPrice.price} (${percentChange.toFixed(2)}%) - ${trend}`
      );

      return {
        ...newPrice,
        trend,
        change: parseFloat(percentChange.toFixed(2)),
      };
    });

    // 4. Update prices in Sanity with calculated trends
    await PriceServiceServer.updatePrices(pricesWithTrends);

    console.log(`Successfully updated ${pricesWithTrends.length} prices with trends`);

    return NextResponse.json({
      success: true,
      message: `Updated ${pricesWithTrends.length} prices`,
      prices: pricesWithTrends,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in price update cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update prices',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
