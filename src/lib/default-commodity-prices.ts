import type { CommodityPrice } from '@/infrastructure/cms/PriceServiceServer';

/**
 * Fallback FOB prices shown when Sanity is unavailable or empty.
 * Keeps the price ticker visible for visitors.
 */
export const DEFAULT_COMMODITY_PRICES: CommodityPrice[] = [
  {
    product: 'Cacao',
    price: 2356,
    unit: '£ / T ICE London',
    trend: 'stable',
    change: 0,
    source: 'ICE (Fallback)',
  },
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
