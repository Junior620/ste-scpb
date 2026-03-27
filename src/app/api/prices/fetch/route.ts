/**
 * Price Fetching API Route
 * Fetches commodity prices from multiple sources:
 * - Cacao: ICE London Cocoa Futures (https://www.ice.com/products/37089076/London-Cocoa-Futures/data)
 * - Coffee: ONCC Cameroon (https://www.oncc.cm/prices)
 */

import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
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
 * Fetch cocoa price from ICE London Cocoa Futures using Playwright
 * Source: https://www.ice.com/products/37089076/London-Cocoa-Futures/data?marketId=7758984
 * Unit: £/T (Pound Sterling per Tonne)
 *
 * Captures the closing price (market closes at 17:00 London time)
 * XPath: /html/body/div[1]/div/main/div/div/div/div/div/div[4]/div/div/div[1]/table/tbody[1]/tr[1]/td[2]
 */
async function fetchCocoaPriceFromICE(): Promise<PriceData | null> {
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
    const priceElement = await page
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

    console.log(`Successfully fetched cocoa price from ICE: £${price}/T`);

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
    return null;
  }
}

/**
 * Fetch coffee prices from ONCC website
 * Scrapes https://www.oncc.cm/prices for coffee commodity prices
 *
 * XPath References:
 * - Arabica: /html/body/main/div/div[5]/div/div/section[2]/section/section[2]/span[1]
 * - Robusta: /html/body/main/div/div[6]/div/div/section[2]/section/section[2]/span[1]
 */
async function fetchCoffeePricesFromONCC(): Promise<PriceData[]> {
  try {
    console.log('Fetching prices from ONCC...');

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

    // Fonction helper pour extraire le prix depuis un élément
    const extractPrice = (selector: string, productName: string): PriceData | null => {
      try {
        const element = $(selector);
        if (!element.length) {
          console.warn(`Element not found for ${productName} with selector: ${selector}`);
          return null;
        }

        const priceText = element.text().trim();
        console.log(`${productName} raw text:`, priceText);

        // Extraire le prix numérique (supporte les formats avec espaces et virgules)
        const priceMatch = priceText.match(/[\d\s,]+/);
        if (!priceMatch) {
          console.warn(`No price found in text for ${productName}:`, priceText);
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
          unit: 'FCFA/KG FOB ONCC',
          trend: 'stable',
          change: 0,
          source: 'ONCC',
        };
      } catch (err) {
        console.error(`Error extracting price for ${productName}:`, err);
        return null;
      }
    };

    // Extract coffee prices only (not cocoa)
    // XPath: /html/body/main/div/div[5]/div/div/section[2]/section/section[2]/span[1]
    const arabicaPrice = extractPrice(
      'body > main > div > div:nth-child(5) > div > div > section:nth-child(2) > section > section:nth-child(2) > span:first-child',
      'Café Arabica'
    );

    // XPath: /html/body/main/div/div[6]/div/div/section[2]/section/section[2]/span[1]
    const robustaPrice = extractPrice(
      'body > main > div > div:nth-child(6) > div > div > section:nth-child(2) > section > section:nth-child(2) > span:first-child',
      'Café Robusta'
    );

    // Add valid prices to array
    if (arabicaPrice) prices.push(arabicaPrice);
    if (robustaPrice) prices.push(robustaPrice);

    if (prices.length === 0) {
      console.warn('No coffee prices found on ONCC website, using fallback data');
      return [
        {
          product: 'Café Arabica',
          price: 3200,
          unit: 'FCFA/KG FOB ONCC',
          trend: 'stable',
          change: 0,
          source: 'ONCC (Fallback)',
        },
        {
          product: 'Café Robusta',
          price: 2800,
          unit: 'FCFA/KG FOB ONCC',
          trend: 'stable',
          change: 0,
          source: 'ONCC (Fallback)',
        },
      ];
    }

    console.log(`Successfully fetched ${prices.length} coffee prices from ONCC`);
    return prices;
  } catch (error) {
    console.error('Error fetching from ONCC:', error);

    // Fallback for coffee prices
    return [
      {
        product: 'Café Arabica',
        price: 3200,
        unit: 'FCFA/KG FOB ONCC',
        trend: 'stable',
        change: 0,
        source: 'ONCC (Error Fallback)',
      },
      {
        product: 'Café Robusta',
        price: 2800,
        unit: 'FCFA/KG FOB ONCC',
        trend: 'stable',
        change: 0,
        source: 'ONCC (Error Fallback)',
      },
    ];
  }
}

export async function GET() {
  try {
    const allPrices: PriceData[] = [];

    // 1. Fetch cocoa price from ICE
    const cocoaPrice = await fetchCocoaPriceFromICE();
    if (cocoaPrice) {
      allPrices.push(cocoaPrice);
    } else {
      // Fallback cocoa price
      console.warn('Using fallback cocoa price');
      allPrices.push({
        product: 'Cacao',
        price: 2356, // Last known price: £2356/T
        unit: '£ / T ICE London',
        trend: 'stable',
        change: 0,
        source: 'ICE (Fallback)',
      });
    }

    // 2. Fetch coffee prices from ONCC
    const coffeePrices = await fetchCoffeePricesFromONCC();
    allPrices.push(...coffeePrices);

    return NextResponse.json({
      success: true,
      prices: allPrices,
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
