'use client';

/**
 * Price Marquee Component
 * Displays scrolling FOB prices for commodities
 */

import { TrendingUp, TrendingDown, Circle } from 'lucide-react';

export interface PriceItem {
  product: string;
  price: number;
  unit: string;
  trend?: 'up' | 'down';
  change?: number;
}

interface PriceMarqueeProps {
  prices: PriceItem[];
  speed?: number; // Duration in seconds for one complete scroll
  className?: string;
}

export function PriceMarquee({ prices, speed = 30, className = '' }: PriceMarqueeProps) {
  // Duplicate prices for seamless loop
  const duplicatedPrices = [...prices, ...prices, ...prices];

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] overflow-hidden bg-gradient-to-r from-background-secondary via-background-tertiary to-background-secondary border-b border-primary/20 shadow-lg ${className}`}
    >
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />

      <div className="relative flex items-center h-full">
        {/* Label fixe sur la gauche */}
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-3 bg-gradient-to-r from-background-secondary via-background-secondary to-transparent">
          <div className="flex items-center gap-2 pr-4">
            <div className="flex gap-0.5">
              <div
                className="w-0.5 h-3 bg-primary rounded-full animate-pulse"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-0.5 h-3 bg-primary/70 rounded-full animate-pulse"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-0.5 h-3 bg-primary/40 rounded-full animate-pulse"
                style={{ animationDelay: '300ms' }}
              />
            </div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider whitespace-nowrap">
              Prix FOB
            </span>
          </div>
        </div>

        {/* Scrolling prices */}
        <div
          className="flex animate-marquee py-1.5 pl-28"
          style={{ animationDuration: `${speed}s` }}
        >
          {duplicatedPrices.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-5 whitespace-nowrap relative group"
            >
              {/* Separator */}
              {index > 0 && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-4 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
              )}

              {/* Product indicator dot */}
              <Circle className="w-1.5 h-1.5 fill-primary text-primary" />

              {/* Product Name */}
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                {item.product}
              </span>

              {/* Price with enhanced glow */}
              <div className="relative">
                <span className="text-sm font-bold text-primary drop-shadow-[0_0_8px_rgba(212,168,83,0.5)]">
                  {item.price.toLocaleString('fr-FR')}
                </span>
              </div>

              {/* Unit */}
              <span className="text-[10px] font-medium text-foreground-muted/70 uppercase tracking-wide">
                {item.unit}
              </span>

              {/* Trend Indicator */}
              {item.trend && (
                <div
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full backdrop-blur-sm border ${
                    item.trend === 'up'
                      ? 'bg-green-500/15 text-green-400 border-green-500/30'
                      : 'bg-red-500/15 text-red-400 border-red-500/30'
                  }`}
                >
                  {item.trend === 'up' ? (
                    <TrendingUp className="w-2.5 h-2.5" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5" />
                  )}
                  {item.change && (
                    <span className="text-[10px] font-bold">
                      {item.change > 0 ? '+' : ''}
                      {item.change}%
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced gradient overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background-secondary via-background-secondary/90 to-transparent pointer-events-none z-20" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background-secondary via-background-secondary/80 to-transparent pointer-events-none" />

      {/* Top and bottom glow lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
}

export default PriceMarquee;
