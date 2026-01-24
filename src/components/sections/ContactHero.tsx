'use client';

/**
 * Contact Hero Component with 3D constellation background
 */

import {
  Scene3DWrapper,
  Starfield,
  Constellation,
  PostProcessing,
  StaticHeroFallback,
} from '@/components/3d';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';
import { Link } from '@/i18n/routing';

interface ContactHeroProps {
  title: string;
  subtitle: string;
  quoteLink: string;
  quoteLinkText: string;
}

/**
 * 3D Scene for contact hero
 */
function ContactHeroScene() {
  const { config } = usePerformanceMode();

  const constellationConfig = {
    nodes: [
      { id: 'contact-1', position: [-3, 1.5, 0] as [number, number, number], size: 0.2, label: '' },
      { id: 'contact-2', position: [3, 1.5, 0] as [number, number, number], size: 0.2, label: '' },
      {
        id: 'contact-3',
        position: [0, -1.5, 0] as [number, number, number],
        size: 0.25,
        label: '',
      },
      {
        id: 'contact-4',
        position: [-1.5, 0, 0] as [number, number, number],
        size: 0.15,
        label: '',
      },
      { id: 'contact-5', position: [1.5, 0, 0] as [number, number, number], size: 0.15, label: '' },
    ],
    connections: [
      [0, 3],
      [3, 2],
      [2, 4],
      [4, 1],
      [0, 4],
      [1, 3],
    ] as [number, number][],
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
      <Constellation config={constellationConfig} isActive={true} />
      <PostProcessing config={config} />
      <ambientLight intensity={0.3} />
    </>
  );
}

export function ContactHero({ title, subtitle, quoteLink, quoteLinkText }: ContactHeroProps) {
  return (
    <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Scene3DWrapper
          className="h-full w-full"
          fallback={<StaticHeroFallback starCount={100} />}
          camera={{ position: [0, 0, 8], fov: 60 }}
        >
          <ContactHeroScene />
        </Scene3DWrapper>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-background/30 to-background" />

      {/* Title overlay */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl holographic">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-foreground-muted">{subtitle}</p>
        <Link
          href={quoteLink}
          className="inline-flex items-center gap-1 mt-4 text-primary hover:underline font-medium"
        >
          {quoteLinkText}
        </Link>
      </div>
    </div>
  );
}

export default ContactHero;
