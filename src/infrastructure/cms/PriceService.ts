/**
 * Price Service
 * Handles fetching commodity prices via API routes (client-safe)
 */

export interface CommodityPrice {
  product: string;
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  lastUpdated?: string;
  source?: string;
}

export class PriceService {
  /**
   * Fetch all commodity prices from API route
   * This method is safe to use in client components
   */
  static async getPrices(): Promise<CommodityPrice[]> {
    try {
      const response = await fetch('/api/prices', {
        next: { revalidate: 300 }, // Cache for 5 minutes
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }

      const data = await response.json();
      return data.prices || [];
    } catch (error) {
      console.error('Error fetching prices:', error);
      return [];
    }
  }
}
