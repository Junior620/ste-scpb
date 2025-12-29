'use client';

/**
 * About Hero Component with 3D constellation background
 */

import { Scene3DWrapper, Starfield, Constellation, PostProcessing, StaticHeroFallback } from '@/components/3d';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';

interface AboutHeroProps {
  title: string;
  subtitle: string;
}

/**
 * 3D Scene for about hero
 */
function AboutHeroScene() {
  const { config } = usePerformanceMode();

  const constellationConfig = {
    nodes: [
      { id: 'about-1', position: [-3, 1.5, 0] as [number, number, number], size: 0.2, label: '' },
      { id: 'about-2', position: [3, 1.5, 0] as [number, number, number], size: 0.2, label: '' },
      { id: 'about-3', position: [0, -1, 0] as [number, number, number], size: 0.25, label: '' },
      { id: 'about-4', position: [-1.5, 0.5, 0] as [number, number, number], size: 0.15, label: '' },
      { id: 'about-5', position: [1.5, 0.5, 0] as [number, number, number], size: 0.15, label: '' },
      { id: 'about-6', position: [0, 1.5, 0] as [number, number, number], size: 0.2, label: '' },
    ],
    connections: [[0, 3], [3, 2], [2, 4], [4, 1], [5, 0], [5, 1], [5, 2]] as [number, number][],
    color: '#fbbf24',
    glowIntensity: 0.8,
    animationSpeed: 0.5,
  };

  return (
    <>
      <Starfield
        config={config}
        color="#ffffff"
        secondaryColor="#fbbf24"
        depth={30}
        parallaxIntensity={0.05}
        enableParallax={true}
      />
      <Constellation
        config={constellationConfig}
        isActive={true}
      />
      <PostProcessing config={config} />
      <ambientLight intensity={0.3} />
    </>
  );
}

export function AboutHero({ title, subtitle }: AboutHeroProps) {
  return (
    <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Scene3DWrapper
          className="h-full w-full"
          fallback={<StaticHeroFallback starCount={100} />}
          camera={{ position: [0, 0, 8], fov: 60 }}
        >
          <AboutHeroScene />
        </Scene3DWrapper>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-background/30 to-background" />

      {/* Title overlay */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl holographic">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-foreground-muted">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default AboutHero;
