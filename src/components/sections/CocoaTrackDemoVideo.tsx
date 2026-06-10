'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Play } from 'lucide-react';

const DEFAULT_VIDEO_SRC = '/cocoatrack/cocoatrack-demo.mp4';
const DEFAULT_POSTER_SRC = '/cocoatrack/cocoatrack-demo-poster.jpg';

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function getVimeoEmbedUrl(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
}

export function CocoaTrackDemoVideo() {
  const t = useTranslations('solutions.cocoatrack.video');
  const videoSrc = process.env.NEXT_PUBLIC_COCOATRACK_DEMO_VIDEO_URL?.trim() || DEFAULT_VIDEO_SRC;
  const posterSrc =
    process.env.NEXT_PUBLIC_COCOATRACK_DEMO_POSTER_URL?.trim() || DEFAULT_POSTER_SRC;

  const youtubeEmbed = getYouTubeEmbedUrl(videoSrc);
  const vimeoEmbed = getVimeoEmbedUrl(videoSrc);
  const isEmbed = Boolean(youtubeEmbed || vimeoEmbed);

  const [isPlaying, setIsPlaying] = useState(isEmbed);
  const [hasError, setHasError] = useState(false);

  const handlePlay = useCallback(() => setIsPlaying(true), []);

  return (
    <section className="py-12 md:py-16 bg-background-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t('title')}</h2>
          <p className="text-foreground-muted">{t('subtitle')}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
            {hasError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
                <Play className="w-12 h-12 text-foreground-muted/40" />
                <p className="text-foreground-muted text-sm max-w-md">{t('unavailable')}</p>
              </div>
            ) : isEmbed && isPlaying ? (
              <iframe
                src={youtubeEmbed ?? vimeoEmbed ?? videoSrc}
                title={t('title')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            ) : isPlaying ? (
              <video
                src={videoSrc}
                controls
                autoPlay
                playsInline
                poster={posterSrc}
                className="h-full w-full object-contain bg-black"
                onError={() => setHasError(true)}
              >
                {t('unsupported')}
              </video>
            ) : (
              <button
                type="button"
                onClick={handlePlay}
                className="group absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
                aria-label={t('play')}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterSrc}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 shadow-lg transition-transform group-hover:scale-110">
                  <Play className="ml-1 h-9 w-9 text-primary-foreground fill-current" />
                </div>
              </button>
            )}
          </div>
          <p className="mt-4 text-center text-xs text-foreground-muted">{t('hint')}</p>
        </div>
      </div>
    </section>
  );
}

export default CocoaTrackDemoVideo;
