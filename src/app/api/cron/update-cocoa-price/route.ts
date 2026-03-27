/**
 * Cron Job: Update Cocoa Price
 * Automatically fetches and updates cocoa closing price from ICE in Sanity CMS
 * Triggered by Vercel Cron Jobs
 *
 * Schedule: Monday-Friday at 17:30 UTC (18:30 WAT in winter, 19:30 WAT in summer)
 * Fetches: Cacao closing price from ICE London Cocoa Futures (market closes at 17:00 London time)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PriceServiceServer } from '@/infrastructure/cms/PriceServiceServer';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

interface PriceData {
  product: string;
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  source: string;
}

/**
 * Fetch cocoa closing price from ICE London Cocoa Futures
 */
async function fetchCocoaPriceFromICE(): Promise<PriceData> {
  try {
    console.log('Fetching cocoa closing price from ICE...');

    const response = await fetch(
      'https://www.ice.com/products/37089076/London-Cocoa-Futures/data',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`ICE returned status ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const selector =
      'body > div:first-child > div > main > div > div > div > div > div > div:nth-child(4) > div > div > div:first-child > table > tbody:first-child > tr:first-child > td:nth-child(2)';

    const element = $(selector);

    if (!element.length) {
      throw new Error('Cocoa price element not found on ICE website');
    }

    const priceText = element.text().trim();
    console.log('ICE Cocoa raw text:', priceText);

    const priceMatch = priceText.match(/[\d,]+\.?\d*/);
    if (!priceMatch) {
      throw new Error(`No price found in ICE text: ${priceText}`);
    }

    const price = parseFloat(priceMatch[0].replace(/,/g, ''));

    if (isNaN(price) || price <= 0) {
      throw new Error(`Invalid ICE cocoa price: ${price}`);
    }

    console.log(`Successfully fetched cocoa closing price from ICE: £${price}/T`);

    return {
      product: 'Cacao',
      price,
      unit: '£ / T',
      trend: 'stable',
      change: 0,
      source: 'ICE',
    };
  } catch (error) {
    console.error('Error fetching from ICE:', error);
    throw error;
  }
}

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

    console.log('Starting cocoa price update cron job...');

    // 1. Récupérer les prix actuels depuis Sanity (pour comparaison)
    const currentPrices = await PriceServiceServer.getPrices();
    console.log(`Current prices in Sanity: ${currentPrices.length}`);

    // 2. Fetch new cocoa closing price from ICE
    const newCocoaPrice = await fetchCocoaPriceFromICE();

    // 3. Calculer la variation automatiquement
    const oldPrice = currentPrices.find((p) => p.product === 'Cacao');

    let priceWithTrend = newCocoaPrice;

    if (oldPrice) {
      const priceDiff = newCocoaPrice.price - oldPrice.price;
      const percentChange = (priceDiff / oldPrice.price) * 100;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (percentChange > 0.1) {
        trend = 'up';
      } else if (percentChange < -0.1) {
        trend = 'down';
      }

      console.log(
        `Cacao: ${oldPrice.price} → ${newCocoaPrice.price} (${percentChange.toFixed(2)}%) - ${trend}`
      );

      priceWithTrend = {
        ...newCocoaPrice,
        trend,
        change: parseFloat(percentChange.toFixed(2)),
      };
    } else {
      console.log('Cacao: Nouveau produit, tendance stable');
    }

    // 4. Update cocoa price in Sanity
    await PriceServiceServer.updatePrices([priceWithTrend]);

    console.log('Successfully updated cocoa closing price with trend');

    return NextResponse.json({
      success: true,
      message: 'Updated cocoa closing price',
      prices: [priceWithTrend],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in cocoa price update cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update cocoa price',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
