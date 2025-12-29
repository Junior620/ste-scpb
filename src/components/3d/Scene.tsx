'use client';

/**
 * Main 3D Scene Component
 * Validates: Requirements 1.1, 9.6
 *
 * This component wraps React Three Fiber Canvas and provides:
 * - WebGL support detection
 * - Performance mode integration
 * - Fallback for unsupported devices
 */

import { Canvas, type CanvasProps } from '@react-three/fiber';
import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { isWebGLSupported } from '@/lib/webgl';

export interface SceneProps extends Omit<CanvasProps, 'children'> {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  className?: string;
}

/**
 * Scene component that wraps R3F Canvas with WebGL detection
 */
export function Scene({
  children,
  fallback,
  loadingFallback,
  className = '',
  ...canvasProps
}: SceneProps) {
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebGLSupported(isWebGLSupported());
  }, []);

  // Still checking WebGL support
  if (webGLSupported === null) {
    return (
      <div className={`relative ${className}`}>
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
    return <div className={`relative ${className}`}>{fallback}</div>;
  }

  // WebGL supported - render 3D scene
  return (
    <div className={`relative ${className}`}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 2]}
        {...canvasProps}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}

export default Scene;
