'use client';

import { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  active: boolean;
}

/**
 * Professional Confetti celebration effect
 * Uses canvas-confetti library (same as GitHub, Vercel)
 */
export function Confetti({ active }: ConfettiProps) {
  const fireConfetti = useCallback(() => {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const duration = 3000;
    const end = Date.now() + duration;

    // Gold and accent colors matching STE-SCPB theme
    const colors = ['#d4a853', '#e8c77a', '#7a9aff', '#4ade80', '#fbbf24'];

    const frame = () => {
      // Left side burst
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
        zIndex: 9999,
      });

      // Right side burst
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
        zIndex: 9999,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Initial big burst from center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
      colors,
      zIndex: 9999,
    });

    // Start continuous side bursts
    frame();

    // Final celebration burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        colors,
        zIndex: 9999,
      });
    }, 1500);
  }, []);

  useEffect(() => {
    if (active) {
      // Small delay to ensure the success card is rendered
      const timer = setTimeout(fireConfetti, 100);
      return () => clearTimeout(timer);
    }
  }, [active, fireConfetti]);

  // This component doesn't render anything - confetti uses its own canvas
  return null;
}

export default Confetti;
