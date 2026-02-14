'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import type { MapSectionProps } from './MapSection';

/**
 * Lazy-loaded MapSection component with viewport intersection strategy
 * Validates: Requirements 3.1, 3.3
 * 
 * This wrapper uses Intersection Observer to detect when the map container
 * enters the viewport, then dynamically loads the MapSection component.
 * This prevents the ~500KB Mapbox GL library from blocking initial page load.
 */

// Dynamic import with SSR disabled and skeleton loader
const MapSection = dynamic(() => import('./MapSection').then((mod) => mod.MapSection), {
  ssr: false,
  loading: () => <MapSectionSkeleton />,
});

/**
 * Skeleton loader for MapSection
 * Shows a placeholder while the map component is loading
 */
function MapSectionSkeleton() {
  const t = useTranslations('map');

  return (
    <section className="py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('title')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </header>

        {/* Skeleton map container */}
        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden border border-gray-700 bg-gray-800/50">
          {/* Animated pulse effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/20 to-transparent animate-pulse" />
          
          {/* Loading indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground text-sm">Loading map...</p>
            </div>
          </div>

          {/* Skeleton legend */}
          <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-700 animate-pulse" />
                  <div className="w-24 h-3 bg-gray-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * LazyMapSection component with viewport intersection detection
 * Only loads the MapSection component when it enters the viewport
 */
export function LazyMapSection(props: MapSectionProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create intersection observer with 10% threshold
    // This means the map will start loading when 10% of it is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            // Once we start loading, we don't need to observe anymore
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef}>
      {shouldLoad ? <MapSection {...props} /> : <MapSectionSkeleton />}
    </div>
  );
}
