'use client';

/**
 * Hero Section Component
 * Clean, minimal B2B cacao export hero with video carousel
 * Optimized for LCP: loads first video immediately, lazy loads others
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
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
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Preload next video when current one is playing
  useEffect(() => {
    const nextIndex = (currentVideoIndex + 1) % VIDEOS.length;
    if (!loadedVideos.has(nextIndex)) {
      setLoadedVideos((prev) => new Set(prev).add(nextIndex));
    }
  }, [currentVideoIndex, loadedVideos]);

  // Control video playback - only play current video
  useEffect(() => {
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
  }, [currentVideoIndex, loadedVideos]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % VIDEOS.length);
    }, VIDEO_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className={`relative min-h-screen w-full overflow-hidden ${className}`}
      aria-label="Hero section"
    >
      <ClickSparkles />

      {/* Video Background Carousel - Lazy loaded */}
      <div className="absolute inset-0 z-0 bg-background">
        {VIDEOS.map((video, index) => {
          // Only render video if it should be loaded
          const shouldLoad = loadedVideos.has(index);
          const isCurrentVideo = index === currentVideoIndex;
          
          return (
            <video
              key={video}
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              src={shouldLoad ? video : undefined}
              poster={index === 0 ? '/og-image.png' : undefined} // Poster for first video only
              autoPlay={isCurrentVideo && shouldLoad} // Only autoplay the current video
              loop
              muted
              playsInline
              preload={index === 0 ? 'metadata' : 'none'} // Load metadata for first video
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                isCurrentVideo ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ display: shouldLoad ? 'block' : 'none' }}
            />
          );
        })}
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

export default Hero;
