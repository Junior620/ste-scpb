'use client';

/**
 * Price Ticker Section
 * Displays live FOB prices for commodities in a scrolling marquee
 * Prices are automatically fetched from Sanity CMS
 */

import { useEffect, useState } from 'react';
import { PriceMarquee, type PriceItem } from '@/components/ui';
import { PriceService } from '@/infrastructure/cms/PriceService';

export function PriceTickerSection() {
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrices() {
      try {
        const sanityPrices = await PriceService.getPrices();
        if (sanityPrices.length > 0) {
          const convertedPrices: PriceItem[] = sanityPrices.map((price) => ({
            product: price.product,
            price: price.price,
            unit: price.unit,
            trend: price.trend === 'stable' ? undefined : price.trend,
            change: price.change,
          }));
          setPrices(convertedPrices);
        }
      } catch (error) {
        console.error('Failed to load prices from Sanity:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPrices();

    const interval = setInterval(loadPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section
        className="w-full h-10 bg-muted/30 animate-pulse"
        aria-label="Chargement des prix..."
      />
    );
  }

  if (prices.length === 0) return null;

  return (
    <section className="w-full">
      <PriceMarquee prices={prices} speed={50} />
    </section>
  );
}

export default PriceTickerSection;
