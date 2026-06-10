/**
 * Price Service Server
 * Server-side only service for updating prices in Sanity CMS
 * DO NOT import this in client components
 */

import { createClient } from '@sanity/client';
import { createSanityClient } from './SanityClient';
import { DEFAULT_COMMODITY_PRICES } from '@/lib/default-commodity-prices';

export interface CommodityPrice {
  product: string;
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  lastUpdated?: string;
  source?: string;
}

export class PriceServiceServer {
  /**
   * Fetch all commodity prices from Sanity
   * Server-side only
   */
  static async getPrices(): Promise<CommodityPrice[]> {
    try {
      const projectId = process.env.SANITY_PROJECT_ID;
      const dataset = process.env.SANITY_DATASET;

      if (!projectId || !dataset) {
        console.warn('[PriceServiceServer] Missing Sanity config, using fallback prices');
        return DEFAULT_COMMODITY_PRICES;
      }

      // Public read via CDN — avoids 401 when SANITY_API_TOKEN is missing or invalid
      const readClient = createClient({
        projectId,
        dataset,
        useCdn: true,
        apiVersion: '2024-01-01',
      });

      const query = `*[_type == "commodityPrice"] | order(product asc) {
        product,
        price,
        unit,
        trend,
        change,
        lastUpdated,
        source
      }`;

      const prices = await readClient.fetch<CommodityPrice[]>(query);

      if (!prices || prices.length === 0) {
        console.warn('[PriceServiceServer] No prices in Sanity, using fallback');
        return DEFAULT_COMMODITY_PRICES;
      }

      return prices;
    } catch (error) {
      console.error('Error fetching prices from Sanity:', error);
      return DEFAULT_COMMODITY_PRICES;
    }
  }

  /**
   * Update or create a commodity price in Sanity
   * Server-side only
   */
  static async updatePrice(priceData: CommodityPrice): Promise<void> {
    try {
      const sanityClient = createSanityClient();
      const client = sanityClient.getWriteClient();

      // Check if price document already exists
      const existingQuery = `*[_type == "commodityPrice" && product == $product][0]`;
      const existing = await client.fetch(existingQuery, {
        product: priceData.product,
      });

      if (existing) {
        // Update existing document
        await client
          .patch(existing._id)
          .set({
            price: priceData.price,
            unit: priceData.unit,
            trend: priceData.trend,
            change: priceData.change,
            lastUpdated: new Date().toISOString(),
            source: priceData.source,
          })
          .commit();
      } else {
        // Create new document
        await client.create({
          _type: 'commodityPrice',
          ...priceData,
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error updating price in Sanity:', error);
      throw error;
    }
  }

  /**
   * Update multiple prices at once
   * Server-side only
   */
  static async updatePrices(prices: CommodityPrice[]): Promise<void> {
    try {
      await Promise.all(prices.map((price) => this.updatePrice(price)));
    } catch (error) {
      console.error('Error updating prices in Sanity:', error);
      throw error;
    }
  }

  /**
   * Add a price entry to history (creates a new document each time)
   * Server-side only
   */
  static async addToHistory(priceData: CommodityPrice): Promise<void> {
    try {
      const sanityClient = createSanityClient();
      const client = sanityClient.getWriteClient();

      await client.create({
        _type: 'priceHistory',
        product: priceData.product,
        price: priceData.price,
        unit: priceData.unit,
        trend: priceData.trend,
        change: priceData.change,
        source: priceData.source,
        recordedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error adding price to history:', error);
      // Ne pas bloquer la mise à jour principale si l'historique échoue
    }
  }

  /**
   * Add multiple prices to history at once
   * Server-side only
   */
  static async addAllToHistory(prices: CommodityPrice[]): Promise<void> {
    await Promise.all(prices.map((price) => this.addToHistory(price)));
  }
}
