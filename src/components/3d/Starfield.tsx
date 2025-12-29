'use client';

/**
 * Starfield Component - 3D Particle System Background
 * Validates: Requirements 1.1, 1.3
 *
 * Creates an immersive starfield with:
 * - Depth-based particle distribution
 * - Mouse parallax effect
 * - Performance mode adaptation
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { PerformanceConfig } from '@/hooks/usePerformanceMode';

export interface StarfieldProps {
  /** Performance configuration */
  config: PerformanceConfig;
  /** Base color for stars */
  color?: string;
  /** Secondary color for variation */
  secondaryColor?: string;
  /** Depth range for star distribution */
  depth?: number;
  /** Parallax intensity (0-1) */
  parallaxIntensity?: number;
  /** Enable mouse parallax */
  enableParallax?: boolean;
}

/**
 * Generates random star positions with depth distribution
 */
function generateStarPositions(
  count: number,
  depth: number
): Float32Array {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Spread stars in a sphere-like distribution
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = Math.random() * depth + 5;

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi) - depth / 2;
  }

  return positions;
}

/**
 * Generates star sizes with variation
 */
function generateStarSizes(count: number): Float32Array {
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Most stars are small, few are larger
    sizes[i] = Math.random() * 0.5 + 0.1;
    if (Math.random() > 0.95) {
      sizes[i] *= 2; // Occasional brighter stars
    }
  }

  return sizes;
}

/**
 * Generates star colors with variation
 */
function generateStarColors(
  count: number,
  primaryColor: THREE.Color,
  secondaryColor: THREE.Color
): Float32Array {
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const mix = Math.random();
    const color = primaryColor.clone().lerp(secondaryColor, mix);

    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  return colors;
}

export function Starfield({
  config,
  color = '#ffffff',
  secondaryColor = '#ffd700',
  depth = 50,
  parallaxIntensity = 0.1,
  enableParallax = true,
}: StarfieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const { size } = useThree();

  const particleCount = Math.floor(
    config.particleCount * config.particleMultiplier
  );

  // Generate star data
  const { positions, sizes, colors } = useMemo(() => {
    const primaryColor = new THREE.Color(color);
    const secondary = new THREE.Color(secondaryColor);

    return {
      positions: generateStarPositions(particleCount, depth),
      sizes: generateStarSizes(particleCount),
      colors: generateStarColors(particleCount, primaryColor, secondary),
    };
  }, [particleCount, depth, color, secondaryColor]);

  // Mouse tracking for parallax
  useEffect(() => {
    if (!enableParallax) return;

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position to -1 to 1
      mouseRef.current.x = (event.clientX / size.width) * 2 - 1;
      mouseRef.current.y = -(event.clientY / size.height) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableParallax, size.width, size.height]);

  // Animation loop
  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    // Slow rotation
    pointsRef.current.rotation.y += delta * 0.02;

    // Parallax effect
    if (enableParallax) {
      targetRotationRef.current.x = mouseRef.current.y * parallaxIntensity;
      targetRotationRef.current.y = mouseRef.current.x * parallaxIntensity;

      // Smooth interpolation
      pointsRef.current.rotation.x +=
        (targetRotationRef.current.x - pointsRef.current.rotation.x) * 0.05;
      pointsRef.current.rotation.y +=
        (targetRotationRef.current.y - pointsRef.current.rotation.y) * 0.05;
    }
  });

  // Create geometry with attributes
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, colors, sizes]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default Starfield;
