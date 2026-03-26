/**
 * Price Service Server
 * Server-side only service for updating prices in Sanity CMS
 * DO NOT import this in client components
 */

import { createSanityClient } from './SanityClient';

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
      const client = createSanityClient();
      const query = `*[_type == "commodityPrice"] | order(product asc) {
        product,
        price,
        unit,
        trend,
        change,
        lastUpdated,
        source
      }`;

      const prices = await client['client'].fetch<CommodityPrice[]>(query);
      return prices;
    } catch (error) {
      console.error('Error fetching prices from Sanity:', error);
      return [];
    }
  }

  /**
   * Update or create a commodity price in Sanity
   * Server-side only
   */
  static async updatePrice(priceData: CommodityPrice): Promise<void> {
    try {
      const sanityClient = createSanityClient();
      const client = sanityClient['client']; // Access private client

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
}
