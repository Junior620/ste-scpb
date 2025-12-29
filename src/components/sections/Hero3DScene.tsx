'use client';

/**
 * Hero 3D Scene Component - Lazy loaded
 * Separated for better code splitting and performance
 */

import { Starfield, Constellation, PostProcessing } from '@/components/3d';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';
import { DEFAULT_HERO_CONSTELLATION } from '@/lib/scene-presets';

export default function Hero3DScene() {
  const { config } = usePerformanceMode();

  return (
    <>
      {/* Starfield background */}
      <Starfield
        config={config}
        color="#ffffff"
        secondaryColor="#fbbf24"
        depth={30}
        parallaxIntensity={0.05}
        enableParallax={false}
      />

      {/* Central constellation */}
      <Constellation config={DEFAULT_HERO_CONSTELLATION} isActive={true} />

      {/* Post-processing effects - only if enabled */}
      {config.enablePostProcessing && <PostProcessing config={config} />}

      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
    </>
  );
}
