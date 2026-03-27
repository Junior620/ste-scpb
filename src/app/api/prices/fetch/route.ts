/**
 * Price Fetching API Route
 * Fetches commodity prices from ONCC (Office National du Cacao et du Café)
 * Source: https://www.oncc.cm/prices
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
 * Fetch prices from ONCC website
 * Scrapes https://www.oncc.cm/prices for commodity prices
 *
 * XPath References:
 * - Cacao: /html/body/main/div/div[4]/div/div/section[2]/section/section[2]/span[1]
 * - Arabica: /html/body/main/div/div[5]/div/div/section[2]/section/section[2]/span[1]
 * - Robusta: /html/body/main/div/div[6]/div/div/section[2]/section/section[2]/span[1]
 */
async function fetchPricesFromONCC(): Promise<PriceData[]> {
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

        // Pour l'instant, on met la tendance à 'stable' car on n'a pas l'info de tendance
        // TODO: Ajouter la logique de détection de tendance si disponible sur le site
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

    // Extraire les prix en utilisant les sélecteurs CSS basés sur les XPath fournis
    // XPath: /html/body/main/div/div[4]/div/div/section[2]/section/section[2]/span[1]
    const cacaoPrice = extractPrice(
      'body > main > div > div:nth-child(4) > div > div > section:nth-child(2) > section > section:nth-child(2) > span:first-child',
      'Cacao'
    );

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

    // Ajouter les prix valides au tableau
    if (cacaoPrice) prices.push(cacaoPrice);
    if (arabicaPrice) prices.push(arabicaPrice);
    if (robustaPrice) prices.push(robustaPrice);

    if (prices.length === 0) {
      console.warn('No prices found on ONCC website, using fallback data');
      // Fallback: retourner des prix de démonstration
      return [
        {
          product: 'Cacao',
          price: 2500,
          unit: 'FCFA / KG FOB',
          trend: 'stable',
          change: 0,
          source: 'ONCC (Fallback)',
        },
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

    console.log(`Successfully fetched ${prices.length} prices from ONCC`);
    return prices;
  } catch (error) {
    console.error('Error fetching from ONCC:', error);

    // Fallback en cas d'erreur
    return [
      {
        product: 'Cacao',
        price: 2500,
        unit: 'FCFA / KG FOB',
        trend: 'stable',
        change: 0,
        source: 'ONCC (Error Fallback)',
      },
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
    const prices = await fetchPricesFromONCC();

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
