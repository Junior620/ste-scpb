'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

/**
 * Lazy-loaded SpeedInsights component from @vercel/speed-insights
 * Defers loading until 3 seconds after page load to prioritize critical content
 * Requirements: 6.6 - Defer analytics loading until after page interactive
 */
const SpeedInsightsComponent = dynamic(
  () => import('@vercel/speed-insights/next').then((mod) => mod.SpeedInsights),
  { ssr: false }
);

export function LazySpeedInsights() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Delay speed insights loading by 3 seconds to ensure it loads after interaction
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!shouldLoad) {
    return null;
  }

  return <SpeedInsightsComponent />;
}
