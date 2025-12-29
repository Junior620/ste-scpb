'use client';

/**
 * Constellation Node Component - Individual Star/Node
 * Validates: Requirements 1.2, 2.1, 2.2
 *
 * Renders a single node in a constellation with:
 * - Glow effect
 * - Hover interaction
 * - Pulsing animation
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface ConstellationNodeData {
  id: string;
  position: [number, number, number];
  size: number;
  label?: string;
}

export interface ConstellationNodeProps {
  node: ConstellationNodeData;
  color: string;
  glowIntensity: number;
  isActive?: boolean;
  onClick?: (nodeId: string) => void;
  onHover?: (nodeId: string | null) => void;
}

export function ConstellationNode({
  node,
  color,
  glowIntensity,
  isActive = false,
  onClick,
  onHover,
}: ConstellationNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animation
  useFrame((state) => {
    if (!meshRef.current || !glowRef.current) return;

    const time = state.clock.elapsedTime;

    // Pulsing effect
    const pulse = Math.sin(time * 2 + node.position[0]) * 0.1 + 1;
    const scale = node.size * pulse * (hovered || isActive ? 1.3 : 1);

    meshRef.current.scale.setScalar(scale);
    glowRef.current.scale.setScalar(scale * 2.5);

    // Glow opacity animation
    const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial;
    glowMaterial.opacity =
      (0.3 + Math.sin(time * 3) * 0.1) *
      glowIntensity *
      (hovered || isActive ? 1.5 : 1);
  });

  const handlePointerOver = () => {
    setHovered(true);
    onHover?.(node.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover?.(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = () => {
    onClick?.(node.id);
  };

  return (
    <group position={node.position}>
      {/* Glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3 * glowIntensity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Core sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || isActive ? 0.8 : 0.5}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

export default ConstellationNode;
