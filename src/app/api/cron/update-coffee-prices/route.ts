/**
 * Cron Job: Update Coffee Prices
 * Automatically fetches and updates coffee prices from ONCC in Sanity CMS
 * Triggered by Vercel Cron Jobs
 *
 * Schedule: Monday-Friday at 13:00 UTC (14:00 WAT)
 * Fetches: Café Arabica & Café Robusta from ONCC Cameroon
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
 * Fetch coffee prices from ONCC website
 */
async function fetchCoffeePricesFromONCC(): Promise<PriceData[]> {
  try {
    console.log('Fetching coffee prices from ONCC...');

    const response = await fetch('https://www.oncc.cm/prices', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`ONCC returned status ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const prices: PriceData[] = [];

    const extractPrice = (selector: string, productName: string): PriceData | null => {
      try {
        const element = $(selector);
        if (!element.length) {
          console.warn(`Element not found for ${productName}`);
          return null;
        }

        const priceText = element.text().trim();
        console.log(`${productName} raw text:`, priceText);

        const priceMatch = priceText.match(/[\d\s,]+/);
        if (!priceMatch) {
          console.warn(`No price found for ${productName}`);
          return null;
        }

        const price = parseInt(priceMatch[0].replace(/[\s,]/g, ''), 10);

        if (isNaN(price) || price <= 0) {
          console.warn(`Invalid price for ${productName}:`, price);
          return null;
        }

        return {
          product: productName,
          price,
          unit: 'FCFA / KG FOB',
          trend: 'stable',
          change: 0,
          source: 'ONCC',
        };
      } catch (err) {
        console.error(`Error extracting price for ${productName}:`, err);
        return null;
      }
    };

    const arabicaPrice = extractPrice(
      'body > main > div > div:nth-child(5) > div > div > section:nth-child(2) > section > section:nth-child(2) > span:first-child',
      'Café Arabica'
    );

    const robustaPrice = extractPrice(
      'body > main > div > div:nth-child(6) > div > div > section:nth-child(2) > section > section:nth-child(2) > span:first-child',
      'Café Robusta'
    );

    if (arabicaPrice) prices.push(arabicaPrice);
    if (robustaPrice) prices.push(robustaPrice);

    if (prices.length === 0) {
      throw new Error('No coffee prices found on ONCC website');
    }

    console.log(`Successfully fetched ${prices.length} coffee prices from ONCC`);
    return prices;
  } catch (error) {
    console.error('Error fetching from ONCC:', error);
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

    console.log('Starting coffee price update cron job...');

    // 1. Récupérer les prix actuels depuis Sanity (pour comparaison)
    const currentPrices = await PriceServiceServer.getPrices();
    console.log(`Current prices in Sanity: ${currentPrices.length}`);

    // 2. Fetch new coffee prices from ONCC
    const newCoffeePrices = await fetchCoffeePricesFromONCC();

    // 3. Calculer les variations automatiquement
    const pricesWithTrends = newCoffeePrices.map((newPrice) => {
      const oldPrice = currentPrices.find((p) => p.product === newPrice.product);

      if (!oldPrice) {
        console.log(`${newPrice.product}: Nouveau produit, tendance stable`);
        return newPrice;
      }

      const priceDiff = newPrice.price - oldPrice.price;
      const percentChange = (priceDiff / oldPrice.price) * 100;

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

    // 4. Update coffee prices in Sanity
    await PriceServiceServer.updatePrices(pricesWithTrends);

    console.log(`Successfully updated ${pricesWithTrends.length} coffee prices with trends`);

    return NextResponse.json({
      success: true,
      message: `Updated ${pricesWithTrends.length} coffee prices`,
      prices: pricesWithTrends,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in coffee price update cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update coffee prices',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
