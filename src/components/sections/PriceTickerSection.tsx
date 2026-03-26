'use client';

/**
 * Price Ticker Section
 * Displays live FOB prices for commodities in a scrolling marquee
 */

import { PriceMarquee, type PriceItem } from '@/components/ui';

export function PriceTickerSection() {
  // 🎯 MODIFIE LES PRIX ICI
  // Pour mettre à jour les prix, change les valeurs dans ce tableau
  const prices: PriceItem[] = [
    {
      product: 'Cacao',
      price: 2500,
      unit: 'FCFA/KG',
      trend: 'up',
      change: 2.5,
    },
    {
      product: 'Café Arabica',
      price: 3200,
      unit: 'FCFA/KG',
      trend: 'up',
      change: 1.8,
    },
    {
      product: 'Café Robusta',
      price: 2800,
      unit: 'FCFA/KG',
      trend: 'down',
      change: -0.5,
    },
  ];

  return (
    <section className="w-full">
      <PriceMarquee prices={prices} speed={50} />
    </section>
  );
}

export default PriceTickerSection;
