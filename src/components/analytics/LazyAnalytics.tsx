'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

/**
 * Lazy-loaded Analytics component from @vercel/analytics
 * Defers loading until 3 seconds after page load to prioritize critical content
 * Requirements: 6.6 - Defer analytics loading until after page interactive
 */
const AnalyticsComponent = dynamic(
  () => import('@vercel/analytics/react').then((mod) => mod.Analytics),
  { ssr: false }
);

export function LazyAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Delay analytics loading by 3 seconds to ensure it loads after interaction
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!shouldLoad) {
    return null;
  }

  return <AnalyticsComponent />;
}
