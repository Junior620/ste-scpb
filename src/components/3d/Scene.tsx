'use client';

/**
 * Main 3D Scene Component
 * Validates: Requirements 1.1, 9.6, 5.6
 *
 * This component wraps React Three Fiber Canvas and provides:
 * - WebGL support detection
 * - Performance mode integration
 * - Fallback for unsupported devices
 * - Viewport-based rendering optimization (pauses when out of view)
 */

import { Canvas, type CanvasProps } from '@react-three/fiber';
import { Suspense, useEffect, useState, useRef, type ReactNode } from 'react';
import { isWebGLSupported } from '@/lib/webgl';

export interface SceneProps extends Omit<CanvasProps, 'children'> {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  className?: string;
  /**
   * Enable viewport-based rendering optimization
   * When true, pauses rendering when scene is out of viewport
   * @default true
   */
  enableViewportOptimization?: boolean;
}

/**
 * Scene component that wraps R3F Canvas with WebGL detection and viewport optimization
 */
export function Scene({
  children,
  fallback,
  loadingFallback,
  className = '',
  enableViewportOptimization = true,
  ...canvasProps
}: SceneProps) {
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);
  const [isInViewport, setIsInViewport] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWebGLSupported(isWebGLSupported());
  }, []);

  // Intersection Observer for viewport detection
  useEffect(() => {
    if (!enableViewportOptimization || !containerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInViewport(entry.isIntersecting);
        });
      },
      {
        // Trigger when at least 10% of the scene is visible
        threshold: 0.1,
        // Add some margin to start rendering slightly before entering viewport
        rootMargin: '50px',
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [enableViewportOptimization]);

  // Still checking WebGL support
  if (webGLSupported === null) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        {loadingFallback || (
          <div className="flex h-full w-full items-center justify-center bg-slate-900">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          </div>
        )}
      </div>
    );
  }

  // WebGL not supported - show fallback
  if (!webGLSupported) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        {fallback}
      </div>
    );
  }

  // WebGL supported - render 3D scene
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 2]}
        frameloop={isInViewport ? 'always' : 'never'}
        {...canvasProps}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}

export default Scene;
