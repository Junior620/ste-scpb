'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ArticleVideo } from '@/domain/entities/Article';

interface VideoPlayerProps {
  video: ArticleVideo;
  title: string;
}

/**
 * VideoPlayer component for articles
 * Supports YouTube, Vimeo, and direct video links
 */
export function VideoPlayer({ video, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract video ID from URL
  const getVideoId = (url: string, platform: string): string | null => {
    if (platform === 'youtube') {
      const match = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      );
      return match ? match[1] : null;
    }
    if (platform === 'vimeo') {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? match[1] : null;
    }
    return null;
  };

  const videoId = getVideoId(video.url, video.platform);

  // Get embed URL
  const getEmbedUrl = (): string => {
    if (video.platform === 'youtube' && videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (video.platform === 'vimeo' && videoId) {
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return video.url;
  };

  // Render thumbnail with play button
  if (!isPlaying && video.thumbnail) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-background-elevated">
        <Image
          src={video.thumbnail.url}
          alt={video.thumbnail.alt.fr || title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        />
        <button
          onClick={() => setIsPlaying(true)}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
          aria-label="Lire la vidéo"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 transition-transform hover:scale-110">
            <svg className="ml-1 h-8 w-8 text-background" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      </div>
    );
  }

  // Render video player
  if (video.platform === 'direct') {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-background-elevated">
        <video
          src={video.url}
          controls
          autoPlay={isPlaying}
          className="h-full w-full"
          poster={video.thumbnail?.url}
        >
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      </div>
    );
  }

  // Render iframe for YouTube/Vimeo
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-background-elevated">
      <iframe
        src={getEmbedUrl()}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />
    </div>
  );
}
