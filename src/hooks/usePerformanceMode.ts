'use client';

/**
 * Performance Mode Hook for 3D Scene Optimization
 * Validates: Requirements 1.6, 1.7
 *
 * Monitors device capabilities and adjusts 3D rendering quality:
 * - FPS monitoring with automatic downgrade
 * - Viewport detection (mobile/tablet/desktop)
 * - prefers-reduced-motion support
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export type PerformanceMode = 'HIGH' | 'MEDIUM' | 'LOW';

export interface PerformanceConfig {
  particleCount: number;
  particleMultiplier: number;
  enableBloom: boolean;
  bloomIntensity: number;
  enableDOF: boolean;
  enablePostProcessing: boolean;
  maxFPS: number;
}

/**
 * Performance configurations for each quality tier
 */
export const PERFORMANCE_CONFIGS: Record<PerformanceMode, PerformanceConfig> = {
  HIGH: {
    particleCount: 3500,
    particleMultiplier: 1.0,
    enableBloom: true,
    bloomIntensity: 0.8,
    enableDOF: false,
    enablePostProcessing: true,
    maxFPS: 60,
  },
  MEDIUM: {
    particleCount: 2000,
    particleMultiplier: 0.6,
    enableBloom: false,
    bloomIntensity: 0,
    enableDOF: false,
    enablePostProcessing: false,
    maxFPS: 60,
  },
  LOW: {
    particleCount: 1000,
    particleMultiplier: 0.4,
    enableBloom: false,
    bloomIntensity: 0,
    enableDOF: false,
    enablePostProcessing: false,
    maxFPS: 30,
  },
};

/**
 * Viewport breakpoints for device detection
 */
const VIEWPORT_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

export interface UsePerformanceModeOptions {
  /** Minimum FPS before downgrading quality */
  fpsThreshold?: number;
  /** Number of FPS samples to average */
  sampleSize?: number;
  /** Initial performance mode override */
  initialMode?: PerformanceMode;
  /** Disable automatic FPS-based adjustments */
  disableAutoAdjust?: boolean;
}

export interface UsePerformanceModeReturn {
  mode: PerformanceMode;
  config: PerformanceConfig;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  prefersReducedMotion: boolean;
  currentFPS: number;
  setMode: (mode: PerformanceMode) => void;
}

/**
 * Determines initial performance mode based on device characteristics
 */
export function getInitialPerformanceMode(
  viewportWidth: number,
  prefersReducedMotion: boolean
): PerformanceMode {
  // Reduced motion preference takes priority
  if (prefersReducedMotion) {
    return 'LOW';
  }

  // Mobile devices get MEDIUM by default
  if (viewportWidth < VIEWPORT_BREAKPOINTS.mobile) {
    return 'MEDIUM';
  }

  // Tablets get MEDIUM
  if (viewportWidth < VIEWPORT_BREAKPOINTS.tablet) {
    return 'MEDIUM';
  }

  // Desktop gets HIGH
  return 'HIGH';
}

/**
 * Hook for managing 3D scene performance based on device capabilities
 */
export function usePerformanceMode(
  options: UsePerformanceModeOptions = {}
): UsePerformanceModeReturn {
  const {
    fpsThreshold = 30,
    sampleSize = 5,
    initialMode,
    disableAutoAdjust = false,
  } = options;

  const [mode, setModeState] = useState<PerformanceMode>('HIGH');
  const [currentFPS, setCurrentFPS] = useState(60);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const fpsHistoryRef = useRef<number[]>([]);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  // Manual mode setter
  const setMode = useCallback((newMode: PerformanceMode) => {
    setModeState(newMode);
  }, []);

  // Initialize based on device characteristics
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const viewportWidth = window.innerWidth;
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    setIsMobile(viewportWidth < VIEWPORT_BREAKPOINTS.mobile);
    setIsTablet(
      viewportWidth >= VIEWPORT_BREAKPOINTS.mobile &&
        viewportWidth < VIEWPORT_BREAKPOINTS.tablet
    );
    setPrefersReducedMotion(reducedMotion);

    // Set initial mode
    const detectedMode =
      initialMode || getInitialPerformanceMode(viewportWidth, reducedMotion);
    setModeState(detectedMode);

    // Listen for reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        setModeState('LOW');
      }
    };

    mediaQuery.addEventListener('change', handleMotionChange);

    // Listen for viewport changes
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < VIEWPORT_BREAKPOINTS.mobile);
      setIsTablet(
        width >= VIEWPORT_BREAKPOINTS.mobile &&
          width < VIEWPORT_BREAKPOINTS.tablet
      );
    };

    window.addEventListener('resize', handleResize);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [initialMode]);

  // FPS monitoring and auto-adjustment
  useEffect(() => {
    if (typeof window === 'undefined' || disableAutoAdjust) return;

    lastTimeRef.current = performance.now();

    const measureFPS = (currentTime: number) => {
      frameCountRef.current++;

      const elapsed = currentTime - lastTimeRef.current;

      // Calculate FPS every second
      if (elapsed >= 1000) {
        const fps = Math.round(
          (frameCountRef.current * 1000) / elapsed
        );
        setCurrentFPS(fps);

        // Add to history
        fpsHistoryRef.current.push(fps);
        if (fpsHistoryRef.current.length > sampleSize) {
          fpsHistoryRef.current.shift();
        }

        // Calculate average FPS
        const avgFPS =
          fpsHistoryRef.current.reduce((a, b) => a + b, 0) /
          fpsHistoryRef.current.length;

        // Downgrade if FPS is consistently low
        if (avgFPS < fpsThreshold && fpsHistoryRef.current.length >= sampleSize) {
          setModeState((prev) => {
            if (prev === 'HIGH') return 'MEDIUM';
            if (prev === 'MEDIUM') return 'LOW';
            return prev;
          });
          // Reset history after downgrade
          fpsHistoryRef.current = [];
        }

        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      rafIdRef.current = requestAnimationFrame(measureFPS);
    };

    rafIdRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [disableAutoAdjust, fpsThreshold, sampleSize]);

  return {
    mode,
    config: PERFORMANCE_CONFIGS[mode],
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    prefersReducedMotion,
    currentFPS,
    setMode,
  };
}

export default usePerformanceMode;
