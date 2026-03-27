/**
 * Price Fetching API Route
 * Fetches commodity prices from multiple sources:
 * - Cacao: ICE London Cocoa Futures (https://www.ice.com/products/37089076/London-Cocoa-Futures/data)
 * - Coffee: ONCC Cameroon (https://www.oncc.cm/prices)
 */

import { NextResponse } from 'next/server';
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
 * Fetch cocoa price from ICE London Cocoa Futures
 * Source: https://www.ice.com/products/37089076/London-Cocoa-Futures/data
 * Unit: £/T (Pound Sterling per Tonne)
 *
 * Captures the closing price (market closes at 17:00 London time)
 * XPath: /html/body/div[1]/div/main/div/div/div/div/div/div[4]/div/div/div[1]/table/tbody[1]/tr[1]/td[2]
 */
async function fetchCocoaPriceFromICE(): Promise<PriceData | null> {
  try {
    console.log('Fetching cocoa price from ICE...');

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

    // Convert XPath to CSS selector
    // XPath: /html/body/div[1]/div/main/div/div/div/div/div/div[4]/div/div/div[1]/table/tbody[1]/tr[1]/td[2]
    // CSS: body > div:first-child > div > main > div > div > div > div > div > div:nth-child(4) > div > div > div:first-child > table > tbody:first-child > tr:first-child > td:nth-child(2)
    const selector =
      'body > div:first-child > div > main > div > div > div > div > div > div:nth-child(4) > div > div > div:first-child > table > tbody:first-child > tr:first-child > td:nth-child(2)';

    const element = $(selector);

    if (!element.length) {
      console.warn('Cocoa price element not found on ICE website');
      return null;
    }

    const priceText = element.text().trim();
    console.log('ICE Cocoa raw text:', priceText);

    // Extract numeric price (supports formats with commas and decimals)
    const priceMatch = priceText.match(/[\d,]+\.?\d*/);
    if (!priceMatch) {
      console.warn('No price found in ICE text:', priceText);
      return null;
    }

    const price = parseFloat(priceMatch[0].replace(/,/g, ''));

    if (isNaN(price) || price <= 0) {
      console.warn('Invalid ICE cocoa price:', price);
      return null;
    }

    console.log(`Successfully fetched cocoa price from ICE: £${price}/T`);

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
          unit: 'FCFA / KG FOB',
          trend: 'stable',
          change: 0,
          source: 'ONCC (Fallback)',
        },
        {
          product: 'Café Robusta',
          price: 2800,
          unit: 'FCFA / KG FOB',
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
        unit: 'FCFA / KG FOB',
        trend: 'stable',
        change: 0,
        source: 'ONCC (Error Fallback)',
      },
      {
        product: 'Café Robusta',
        price: 2800,
        unit: 'FCFA / KG FOB',
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
        unit: '£ / T',
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
