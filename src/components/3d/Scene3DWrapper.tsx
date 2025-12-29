'use client';

/**
 * Dynamic Scene Wrapper for SSR Compatibility
 * Validates: Requirements 1.1, 9.6
 *
 * This component dynamically imports the 3D scene to prevent
 * SSR issues with Three.js and WebGL.
 */

import dynamic from 'next/dynamic';
import { type ReactNode, type ComponentProps } from 'react';

// Dynamic import with SSR disabled for 3D components
const Scene = dynamic(() => import('./Scene').then((mod) => mod.Scene), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-900">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
    </div>
  ),
});

export interface Scene3DWrapperProps
  extends Omit<ComponentProps<typeof Scene>, 'children'> {
  children: ReactNode;
}

/**
 * Wrapper component that handles dynamic import of 3D scene
 * Use this in pages/layouts to ensure proper SSR handling
 */
export function Scene3DWrapper({ children, ...props }: Scene3DWrapperProps) {
  return <Scene {...props}>{children}</Scene>;
}

export default Scene3DWrapper;
