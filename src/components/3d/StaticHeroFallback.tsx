'use client';

/**
 * Static Hero Fallback Component
 * Validates: Requirements 1.7
 *
 * Provides a visually consistent fallback for devices
 * that don't support WebGL, maintaining the space theme
 * with CSS-only effects.
 */

import { useState, useEffect } from 'react';

export interface StaticHeroFallbackProps {
  /** Number of static stars to render */
  starCount?: number;
  /** Custom class name */
  className?: string;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDelay: number;
  animationDuration: number;
}

/**
 * Generates random star data for CSS rendering
 */
function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.5 + 0.3,
    animationDelay: Math.random() * 3,
    animationDuration: Math.random() * 2 + 2,
  }));
}

export function StaticHeroFallback({
  starCount = 100,
  className = '',
}: StaticHeroFallbackProps) {
  // Generate stars only on client to avoid hydration mismatch
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    setStars(generateStars(starCount));
  }, [starCount]);

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 ${className}`}
    >
      {/* Static stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.animationDelay}s`,
            animationDuration: `${star.animationDuration}s`,
          }}
        />
      ))}

      {/* Gradient overlay for depth effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-slate-950/80" />

      {/* Central glow effect */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-64 w-64 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
      </div>

      {/* Constellation hint - static dots */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="opacity-40"
        >
          {/* Constellation nodes */}
          <circle cx="100" cy="60" r="4" fill="#fbbf24" />
          <circle cx="60" cy="100" r="3" fill="#fbbf24" />
          <circle cx="140" cy="100" r="3" fill="#fbbf24" />
          <circle cx="80" cy="140" r="3" fill="#fbbf24" />
          <circle cx="120" cy="140" r="3" fill="#fbbf24" />
          <circle cx="100" cy="100" r="5" fill="#fbbf24" />

          {/* Constellation lines */}
          <line
            x1="100"
            y1="60"
            x2="100"
            y2="100"
            stroke="#fbbf24"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="60"
            y1="100"
            x2="100"
            y2="100"
            stroke="#fbbf24"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="140"
            y1="100"
            x2="100"
            y2="100"
            stroke="#fbbf24"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="80"
            y1="140"
            x2="100"
            y2="100"
            stroke="#fbbf24"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="120"
            y1="140"
            x2="100"
            y2="100"
            stroke="#fbbf24"
            strokeWidth="1"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* Nebula effect */}
      <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/4 translate-x-1/4 rounded-full bg-purple-900/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/4 translate-y-1/4 rounded-full bg-blue-900/20 blur-3xl" />
    </div>
  );
}

export default StaticHeroFallback;
