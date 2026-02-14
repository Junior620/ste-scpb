'use client';

/**
 * Hero Section Component with 3D Scene
 * Validates: Requirements 3.1, 5.3
 * 
 * This is an alternative Hero component that uses the lazy-loaded 3D scene
 * instead of the video carousel. It demonstrates proper lazy loading with
 * Suspense boundaries and fallbacks.
 */

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui';
import { ClickSparkles } from '@/components/ui/ClickSparkles';
import { Scene3DWrapper, StaticHeroFallback, LazyHero3DScene } from '@/components/3d';

export interface Hero3DProps {
  className?: string;
}

export function Hero3D({ className = '' }: Hero3DProps) {
  const t = useTranslations('home');

  return (
    <section
      className={`relative min-h-screen w-full overflow-hidden ${className}`}
      aria-label="Hero section"
    >
      <ClickSparkles />

      {/* 3D Background with lazy loading and Suspense */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<StaticHeroFallback starCount={100} />}>
          <Scene3DWrapper
            className="h-full w-full"
            fallback={<StaticHeroFallback starCount={100} />}
            camera={{ position: [0, 0, 8], fov: 60 }}
          >
            <LazyHero3DScene />
          </Scene3DWrapper>
        </Suspense>
      </div>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/60 via-background/70 to-background/80 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        {/* Text container */}
        <div className="mx-auto max-w-3xl text-center px-8 py-12">
          {/* Main Title */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl drop-shadow-lg">
            {t('title')}
          </h1>

          {/* Subtitle highlight */}
          <p className="holographic mb-8 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t('titleHighlight')}
          </p>

          {/* Description - simple and clear */}
          <p className="mx-auto mb-10 max-w-xl text-lg text-foreground/90 leading-relaxed">
            {t('description')}
          </p>

          {/* CTA Buttons - just 2, clear */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/devis">
              <Button variant="primary" size="lg" className="min-w-[220px] glow-gold">
                {t('cta.quote')}
              </Button>
            </Link>
            <Link href="/produits/cacao">
              <Button variant="outline" size="lg" className="min-w-[220px]">
                {t('cta.products')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Simple contact line at bottom */}
        <div className="absolute bottom-8 left-0 right-0 z-10">
          <div className="text-center text-sm text-foreground-muted">
            <span className="inline-flex items-center gap-6 flex-wrap justify-center">
              <span>Douala, Cameroun</span>
              <span>•</span>
              <a href="tel:+237676905938" className="hover:text-primary transition-colors">
                +237 676 905 938
              </a>
              <span>•</span>
              <a href="mailto:scpb@ste-scpb.com" className="hover:text-primary transition-colors">
                scpb@ste-scpb.com
              </a>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero3D;
