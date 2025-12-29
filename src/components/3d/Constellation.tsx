'use client';

/**
 * Constellation Component - Product Constellation Visualization
 * Validates: Requirements 1.2, 2.1, 2.2
 *
 * Renders a constellation of nodes with:
 * - Node rendering with connections
 * - Glow effects
 * - Animation system
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ConstellationNode, type ConstellationNodeData } from './ConstellationNode';

export interface ConstellationConfig {
  nodes: ConstellationNodeData[];
  connections: [number, number][];
  color: string;
  glowIntensity: number;
  animationSpeed: number;
}

export interface ConstellationProps {
  config: ConstellationConfig;
  isActive?: boolean;
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
}

/**
 * Creates line geometry for constellation connections
 */
function createConnectionGeometry(
  nodes: ConstellationNodeData[],
  connections: [number, number][]
): THREE.BufferGeometry {
  const positions: number[] = [];

  connections.forEach(([startIdx, endIdx]) => {
    const start = nodes[startIdx];
    const end = nodes[endIdx];

    if (start && end) {
      positions.push(...start.position, ...end.position);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );

  return geometry;
}

export function Constellation({
  config,
  isActive = false,
  onNodeClick,
  onNodeHover,
}: ConstellationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Create connection geometry
  const connectionGeometry = useMemo(
    () => createConnectionGeometry(config.nodes, config.connections),
    [config.nodes, config.connections]
  );

  // Animation
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Gentle rotation
    groupRef.current.rotation.y =
      Math.sin(time * config.animationSpeed * 0.1) * 0.1;
    groupRef.current.rotation.x =
      Math.cos(time * config.animationSpeed * 0.1) * 0.05;

    // Line opacity animation
    if (linesRef.current) {
      const material = linesRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.3 + Math.sin(time * 2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Connection lines */}
      <lineSegments ref={linesRef} geometry={connectionGeometry}>
        <lineBasicMaterial
          color={config.color}
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Nodes */}
      {config.nodes.map((node) => (
        <ConstellationNode
          key={node.id}
          node={node}
          color={config.color}
          glowIntensity={config.glowIntensity}
          isActive={isActive}
          onClick={onNodeClick}
          onHover={onNodeHover}
        />
      ))}

      {/* Ambient light for the constellation */}
      <pointLight
        color={config.color}
        intensity={isActive ? 2 : 1}
        distance={20}
        decay={2}
      />
    </group>
  );
}

export default Constellation;
