'use client';

/**
 * Lazy-loaded Hero 3D Scene Wrapper
 * Validates: Requirements 3.4, 5.1, 5.3
 *
 * This component implements lazy loading for the Hero3DScene with:
 * - Dynamic import using next/dynamic
 * - SSR disabled for client-only rendering
 * - 1000ms delay strategy before loading
 * - StaticHeroFallback as loading component
 */

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { StaticHeroFallback } from './StaticHeroFallback';

// Dynamic import with SSR disabled and loading fallback
const Hero3DScene = dynamic(() => import('../sections/Hero3DScene'), {
  ssr: false,
  loading: () => <StaticHeroFallback starCount={100} />,
});

/**
 * Lazy-loaded wrapper for Hero3DScene with delay strategy
 * Delays loading by 1000ms to prioritize critical content
 */
export function LazyHero3DScene() {
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
    return <StaticHeroFallback starCount={100} />;
  }

  // Load 3D scene after delay
  return <Hero3DScene />;
}

export default LazyHero3DScene;
