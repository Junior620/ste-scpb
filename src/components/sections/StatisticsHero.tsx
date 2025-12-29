'use client';

/**
 * Statistics Hero Component with 3D constellation background
 */

import { Scene3DWrapper, Starfield, Constellation, PostProcessing, StaticHeroFallback } from '@/components/3d';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';
import { Shield, Globe, FileCheck } from 'lucide-react';

interface StatisticsHeroProps {
  title: string;
  subtitle: string;
  badges: {
    traceability: string;
    export: string;
    docs: string;
  };
}

/**
 * 3D Scene for statistics hero - data/analytics themed constellation
 */
function StatisticsHeroScene() {
  const { config } = usePerformanceMode();

  // Constellation representing data points / analytics network
  const constellationConfig = {
    nodes: [
      { id: 'stat-1', position: [-4, 2, 0] as [number, number, number], size: 0.15, label: '' },
      { id: 'stat-2', position: [-2, 1, 0] as [number, number, number], size: 0.2, label: '' },
      { id: 'stat-3', position: [0, 2.5, 0] as [number, number, number], size: 0.25, label: '' },
      { id: 'stat-4', position: [2, 1, 0] as [number, number, number], size: 0.2, label: '' },
      { id: 'stat-5', position: [4, 2, 0] as [number, number, number], size: 0.15, label: '' },
      { id: 'stat-6', position: [-3, -0.5, 0] as [number, number, number], size: 0.18, label: '' },
      { id: 'stat-7', position: [0, 0, 0] as [number, number, number], size: 0.3, label: '' }, // Central node
      { id: 'stat-8', position: [3, -0.5, 0] as [number, number, number], size: 0.18, label: '' },
      { id: 'stat-9', position: [-1.5, -1.5, 0] as [number, number, number], size: 0.15, label: '' },
      { id: 'stat-10', position: [1.5, -1.5, 0] as [number, number, number], size: 0.15, label: '' },
    ],
    connections: [
      [0, 1], [1, 2], [2, 3], [3, 4], // Top arc
      [1, 6], [3, 6], // Connect to center
      [5, 6], [6, 7], // Side connections
      [6, 8], [6, 9], // Bottom connections
      [5, 1], [7, 3], // Cross connections
      [8, 9], // Bottom arc
    ] as [number, number][],
    color: '#d4a853', // Gold primary
    glowIntensity: 0.9,
    animationSpeed: 0.4,
  };

  return (
    <>
      <Starfield
        config={config}
        color="#ffffff"
        secondaryColor="#d4a853"
        depth={35}
        parallaxIntensity={0.03}
        enableParallax={true}
      />
      <Constellation
        config={constellationConfig}
        isActive={true}
      />
      {config.enablePostProcessing && <PostProcessing config={config} />}
      <ambientLight intensity={0.25} />
    </>
  );
}

export function StatisticsHero({ title, subtitle, badges }: StatisticsHeroProps) {
  return (
    <div className="relative h-[45vh] min-h-[350px] overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Scene3DWrapper
          className="h-full w-full"
          fallback={<StaticHeroFallback starCount={120} />}
          camera={{ position: [0, 0, 10], fov: 55 }}
        >
          <StatisticsHeroScene />
        </Scene3DWrapper>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-background/20 to-background" />

      {/* Content overlay */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl holographic">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base sm:text-lg text-foreground-muted">
          {subtitle}
        </p>
        
        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm backdrop-blur-sm border border-primary/20">
            <Shield className="w-4 h-4" /> {badges.traceability}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm backdrop-blur-sm border border-primary/20">
            <Globe className="w-4 h-4" /> {badges.export}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm backdrop-blur-sm border border-primary/20">
            <FileCheck className="w-4 h-4" /> {badges.docs}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StatisticsHero;
