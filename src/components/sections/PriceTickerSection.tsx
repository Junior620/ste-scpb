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
  const [prices, setPrices] = useState<PriceItem[]>([
    // Fallback prices si Sanity n'est pas disponible
    {
      product: 'Cacao',
      price: 2500,
      unit: 'FCFA/KG FOB',
      trend: 'up',
      change: 2.5,
    },
    {
      product: 'Café Arabica',
      price: 3200,
      unit: 'FCFA/KG FOB',
      trend: 'up',
      change: 1.8,
    },
    {
      product: 'Café Robusta',
      price: 2800,
      unit: 'FCFA/KG FOB',
      trend: 'down',
      change: -0.5,
    },
  ]);

  useEffect(() => {
    // Fetch prices from Sanity on component mount
    async function loadPrices() {
      try {
        const sanityPrices = await PriceService.getPrices();
        if (sanityPrices.length > 0) {
          // Convert CommodityPrice to PriceItem (filter out 'stable' trend)
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
        // Keep fallback prices
      }
    }

    loadPrices();

    // Optionally refresh prices every 5 minutes
    const interval = setInterval(loadPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full">
      <PriceMarquee prices={prices} speed={50} />
    </section>
  );
}

export default PriceTickerSection;
