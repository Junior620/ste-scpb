'use client';

/**
 * Post-Processing Effects Component
 * Validates: Requirements 1.1, Design Principles
 *
 * Applies visual effects based on performance mode:
 * - Bloom effect for glow
 * - Depth of Field (DOF) for focus
 * - Performance-aware effect toggling
 */

import {
  EffectComposer,
  Bloom,
  DepthOfField,
} from '@react-three/postprocessing';
import type { PerformanceConfig } from '@/hooks/usePerformanceMode';

export interface PostProcessingProps {
  /** Performance configuration */
  config: PerformanceConfig;
  /** Focus distance for DOF */
  focusDistance?: number;
  /** Focal length for DOF */
  focalLength?: number;
  /** Bokeh scale for DOF */
  bokehScale?: number;
}

/**
 * Full effects with Bloom and DOF
 */
function FullEffects({
  config,
  focusDistance,
  focalLength,
  bokehScale,
}: PostProcessingProps) {
  return (
    <EffectComposer>
      <Bloom
        intensity={config.bloomIntensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <DepthOfField
        focusDistance={focusDistance}
        focalLength={focalLength}
        bokehScale={bokehScale}
      />
    </EffectComposer>
  );
}

/**
 * Bloom only effects
 */
function BloomOnlyEffects({ config }: { config: PerformanceConfig }) {
  return (
    <EffectComposer>
      <Bloom
        intensity={config.bloomIntensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  );
}

export function PostProcessing({
  config,
  focusDistance = 0.02,
  focalLength = 0.5,
  bokehScale = 3,
}: PostProcessingProps) {
  // Skip if post-processing is disabled
  if (!config.enablePostProcessing) {
    return null;
  }

  // Full effects with Bloom and DOF
  if (config.enableBloom && config.enableDOF) {
    return (
      <FullEffects
        config={config}
        focusDistance={focusDistance}
        focalLength={focalLength}
        bokehScale={bokehScale}
      />
    );
  }

  // Bloom only
  if (config.enableBloom) {
    return <BloomOnlyEffects config={config} />;
  }

  // No effects
  return null;
}

export default PostProcessing;
