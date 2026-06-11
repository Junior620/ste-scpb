'use client';

/**
 * Hero Section Component
 * Clean, minimal B2B cacao export hero with video carousel
 * Optimized for LCP: loads first video immediately, lazy loads others
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link, productHref } from '@/i18n/routing';
import { Button } from '@/components/ui';
import { ClickSparkles } from '@/components/ui/ClickSparkles';

export interface HeroProps {
  className?: string;
}

const VIDEOS = [
  '/hero/1.mp4',
  '/hero/2.mp4',
  '/hero/3.mp4',
  '/hero/4.mp4',
  '/hero/5.mp4',
  '/hero/6.mp4',
];
const VIDEO_DURATION = 9000; // 9 seconds

export function Hero({ className = '' }: HeroProps) {
  const t = useTranslations('home');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set([0])); // Load first video immediately
  const [isClient, setIsClient] = useState(false); // Track client-side hydration
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Defer video carousel until after initial render (improve LCP)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Preload next video when current one is playing
  useEffect(() => {
    const nextIndex = (currentVideoIndex + 1) % VIDEOS.length;
    if (!loadedVideos.has(nextIndex)) {
      setLoadedVideos((prev) => new Set(prev).add(nextIndex));
    }
  }, [currentVideoIndex, loadedVideos]);

  // Control video playback - only play current video
  useEffect(() => {
    if (!isClient) return; // Skip on server

    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index === currentVideoIndex && loadedVideos.has(index)) {
        video.play().catch(() => {
          // Ignore autoplay errors
        });
      } else {
        video.pause();
      }
    });
  }, [currentVideoIndex, loadedVideos, isClient]);

  useEffect(() => {
    if (!isClient) return; // Skip carousel on server

    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % VIDEOS.length);
    }, VIDEO_DURATION);

    return () => clearInterval(interval);
  }, [isClient]);

  return (
    <section
      className={`relative min-h-screen w-full overflow-hidden ${className}`}
      aria-label="Hero section"
    >
      <ClickSparkles />

      {/* Background: solid black — never use /api/og here (OG card text overlaps hero copy) */}
      <div className="absolute inset-0 z-0 bg-black" aria-hidden="true">
        {/* Videos load after client hydration (requires files in public/hero/) */}
        {isClient &&
          VIDEOS.map((video, index) => {
            const shouldLoad = loadedVideos.has(index);
            const isCurrentVideo = index === currentVideoIndex;

            return (
              <video
                key={video}
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={shouldLoad ? video : undefined}
                autoPlay={isCurrentVideo && shouldLoad}
                loop
                muted
                playsInline
                preload={index === 0 ? 'metadata' : 'none'}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                  isCurrentVideo ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ display: shouldLoad ? 'block' : 'none' }}
              />
            );
          })}
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        {/* Text container */}
        <div className="mx-auto max-w-3xl text-center px-8 py-12">
          {/* Main Title */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl drop-shadow-lg animate-fade-in-up">
            {t('title')}
          </h1>

          {/* Subtitle highlight */}
          <p className="holographic mb-8 text-2xl font-semibold tracking-tight sm:text-3xl animate-fade-in-up animation-delay-200">
            {t('titleHighlight')}
          </p>

          {/* Description - simple and clear */}
          <p className="mx-auto mb-10 max-w-xl text-lg text-foreground/90 leading-relaxed animate-fade-in-up animation-delay-400">
            {t('description')}
          </p>

          {/* CTA Buttons - just 2, clear */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up animation-delay-600">
            <Link href="/devis">
              <Button variant="primary" size="lg" className="min-w-[220px] glow-gold">
                {t('cta.quote')}
              </Button>
            </Link>
            <Link href="/conformite-eudr">
              <Button variant="outline" size="lg" className="min-w-[220px]">
                {t('cta.eudr')}
              </Button>
            </Link>
          </div>
          <div className="mt-4 flex justify-center animate-fade-in-up animation-delay-600">
            <Link href={productHref('cacao')} className="text-sm text-primary hover:underline">
              {t('cta.products')} →
            </Link>
          </div>

          {/* Contact info - moved closer to CTAs */}
          <div className="mt-4 text-center text-sm text-foreground-muted animate-fade-in-up animation-delay-600">
            <span className="inline-flex items-center gap-4 flex-wrap justify-center">
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

export default Hero;
