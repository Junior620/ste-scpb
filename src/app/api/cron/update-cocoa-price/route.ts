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
import { chromium } from 'playwright';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel serverless function timeout

interface PriceData {
  product: string;
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  source: string;
}

/**
 * Fetch cocoa closing price from ICE London Cocoa Futures using Playwright
 * Source: https://www.ice.com/products/37089076/London-Cocoa-Futures/data?marketId=7758984
 * Unit: £/T (Pound Sterling per Tonne)
 *
 * Captures the closing price (market closes at 17:00 London time)
 * XPath: /html/body/div[1]/div/main/div/div/div/div/div/div[4]/div/div/div[1]/table/tbody[1]/tr[1]/td[2]
 */
async function fetchCocoaPriceFromICE(): Promise<PriceData> {
  let browser;
  try {
    console.log('Launching browser for ICE scraping...');

    // Launch headless browser
    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    const page = await context.newPage();

    console.log('Navigating to ICE website...');
    await page.goto(
      'https://www.ice.com/products/37089076/London-Cocoa-Futures/data?marketId=7758984',
      {
        waitUntil: 'networkidle',
        timeout: 30000,
      }
    );

    console.log('Waiting for price table to load...');
    // Wait for the table to be visible
    await page.waitForSelector('table tbody tr td', { timeout: 10000 });

    // Extract price using XPath
    const priceElement = page
      .locator(
        'xpath=/html/body/div[1]/div/main/div/div/div/div/div/div[4]/div/div/div[1]/table/tbody[1]/tr[1]/td[2]'
      )
      .first();
    const priceText = await priceElement.textContent();

    console.log('ICE Cocoa raw text:', priceText);

    if (!priceText) {
      throw new Error('Price element found but no text content');
    }

    // Extract numeric price
    const priceMatch = priceText.trim().match(/[\d,]+\.?\d*/);
    if (!priceMatch) {
      throw new Error(`No price found in ICE text: ${priceText}`);
    }

    const price = parseFloat(priceMatch[0].replace(/,/g, ''));

    if (isNaN(price) || price <= 0) {
      throw new Error(`Invalid ICE cocoa price: ${price}`);
    }

    console.log(`Successfully fetched cocoa closing price from ICE: £${price}/T`);

    await browser.close();

    return {
      product: 'Cacao',
      price,
      unit: '£ / T ICE London',
      trend: 'stable',
      change: 0,
      source: 'ICE',
    };
  } catch (error) {
    console.error('Error fetching from ICE with Playwright:', error);
    if (browser) {
      await browser.close();
    }
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
