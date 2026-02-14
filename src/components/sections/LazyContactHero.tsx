'use client';

/**
 * Lazy-loaded Contact Hero Wrapper
 * Validates: Requirements 3.4, 5.1, 5.3
 *
 * This component implements lazy loading for the ContactHero with:
 * - Dynamic import using next/dynamic
 * - SSR disabled for client-only rendering
 * - 1000ms delay strategy before loading
 * - StaticHeroFallback as loading component
 */

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { StaticHeroFallback } from '@/components/3d/StaticHeroFallback';

// Dynamic import with SSR disabled and loading fallback
const ContactHero = dynamic(() => import('./ContactHero').then(mod => mod.ContactHero), {
  ssr: false,
  loading: () => (
    <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
      <StaticHeroFallback starCount={100} />
    </div>
  ),
});

interface LazyContactHeroProps {
  title: string;
  subtitle: string;
  quoteLink: string;
  quoteLinkText: string;
}

/**
 * Lazy-loaded wrapper for ContactHero with delay strategy
 * Delays loading by 1000ms to prioritize critical content
 */
export function LazyContactHero(props: LazyContactHeroProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Delay 3D loading by 1000ms to allow critical content to load first
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show fallback until delay expires
  if (!shouldLoad) {
    return (
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <StaticHeroFallback starCount={100} />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-background/30 to-background" />
        {/* Title overlay */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl holographic">
            {props.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-foreground-muted">{props.subtitle}</p>
        </div>
      </div>
    );
  }

  // Load ContactHero after delay
  return <ContactHero {...props} />;
}

export default LazyContactHero;
