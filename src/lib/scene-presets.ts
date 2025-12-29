/**
 * Scene Presets for Product Constellations
 * Validates: Requirements 2.2, 2.5
 *
 * Defines constellation configurations for each product category,
 * including node positions, connections, colors, and animations.
 */

import type { ConstellationConfig } from '@/components/3d/Constellation';
import type { ProductCategory } from '@/domain/entities/Product';

/**
 * Color palette for product categories
 */
export const PRODUCT_COLORS: Record<ProductCategory, string> = {
  cacao: '#8B4513', // Saddle brown
  cafe: '#6F4E37', // Coffee brown
  bois: '#DEB887', // Burlywood
  mais: '#FFD700', // Gold
  hevea: '#228B22', // Forest green
  sesame: '#F5DEB3', // Wheat
  cajou: '#CD853F', // Peru
  amandes: '#D2691E', // Chocolate
  sorgho: '#DAA520', // Goldenrod
  soja: '#9ACD32', // Yellow green
};

/**
 * Creates a constellation configuration for a product
 */
function createConstellationConfig(
  category: ProductCategory,
  nodeCount: number,
  pattern: 'radial' | 'linear' | 'cluster' | 'tree'
): ConstellationConfig {
  const color = PRODUCT_COLORS[category];
  const nodes = generateNodes(nodeCount, pattern);
  const connections = generateConnections(nodes.length, pattern);

  return {
    nodes,
    connections,
    color,
    glowIntensity: 1.0,
    animationSpeed: 1.0,
  };
}

/**
 * Generates node positions based on pattern
 */
function generateNodes(
  count: number,
  pattern: 'radial' | 'linear' | 'cluster' | 'tree'
): ConstellationConfig['nodes'] {
  const nodes: ConstellationConfig['nodes'] = [];

  switch (pattern) {
    case 'radial': {
      // Central node
      nodes.push({
        id: 'center',
        position: [0, 0, 0],
        size: 0.4,
        label: 'center',
      });

      // Surrounding nodes in a circle
      for (let i = 1; i < count; i++) {
        const angle = ((i - 1) / (count - 1)) * Math.PI * 2;
        const radius = 2 + Math.random() * 0.5;
        nodes.push({
          id: `node-${i}`,
          position: [
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            (Math.random() - 0.5) * 0.5,
          ],
          size: 0.2 + Math.random() * 0.1,
        });
      }
      break;
    }

    case 'linear': {
      // Nodes in a line with slight variation
      for (let i = 0; i < count; i++) {
        const x = (i / (count - 1)) * 4 - 2;
        nodes.push({
          id: `node-${i}`,
          position: [
            x,
            Math.sin(i * 0.5) * 0.5,
            (Math.random() - 0.5) * 0.3,
          ],
          size: i === Math.floor(count / 2) ? 0.4 : 0.2,
        });
      }
      break;
    }

    case 'cluster': {
      // Clustered nodes with random positions
      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = Math.random() * 1.5 + 0.5;

        nodes.push({
          id: `node-${i}`,
          position: [
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi),
          ],
          size: 0.15 + Math.random() * 0.15,
        });
      }
      break;
    }

    case 'tree': {
      // Tree-like structure
      nodes.push({
        id: 'root',
        position: [0, -1.5, 0],
        size: 0.35,
        label: 'root',
      });

      // Trunk
      nodes.push({
        id: 'trunk',
        position: [0, 0, 0],
        size: 0.3,
      });

      // Branches
      const branchCount = Math.min(count - 2, 6);
      for (let i = 0; i < branchCount; i++) {
        const angle = (i / branchCount) * Math.PI * 2;
        const height = 1 + (i % 2) * 0.5;
        nodes.push({
          id: `branch-${i}`,
          position: [
            Math.cos(angle) * 1.5,
            height,
            Math.sin(angle) * 0.5,
          ],
          size: 0.2,
        });
      }
      break;
    }
  }

  return nodes;
}

/**
 * Generates connections between nodes based on pattern
 */
function generateConnections(
  nodeCount: number,
  pattern: 'radial' | 'linear' | 'cluster' | 'tree'
): [number, number][] {
  const connections: [number, number][] = [];

  switch (pattern) {
    case 'radial': {
      // Connect all outer nodes to center
      for (let i = 1; i < nodeCount; i++) {
        connections.push([0, i]);
      }
      // Connect adjacent outer nodes
      for (let i = 1; i < nodeCount - 1; i++) {
        connections.push([i, i + 1]);
      }
      if (nodeCount > 2) {
        connections.push([nodeCount - 1, 1]); // Close the circle
      }
      break;
    }

    case 'linear': {
      // Connect sequential nodes
      for (let i = 0; i < nodeCount - 1; i++) {
        connections.push([i, i + 1]);
      }
      break;
    }

    case 'cluster': {
      // Connect nearby nodes (simplified)
      for (let i = 0; i < nodeCount; i++) {
        const nextIdx = (i + 1) % nodeCount;
        connections.push([i, nextIdx]);
        if (i < nodeCount - 2) {
          connections.push([i, i + 2]);
        }
      }
      break;
    }

    case 'tree': {
      // Root to trunk
      connections.push([0, 1]);
      // Trunk to branches
      for (let i = 2; i < nodeCount; i++) {
        connections.push([1, i]);
      }
      break;
    }
  }

  return connections;
}

/**
 * Product constellation presets
 */
export const PRODUCT_CONSTELLATIONS: Record<ProductCategory, ConstellationConfig> = {
  cacao: createConstellationConfig('cacao', 8, 'radial'),
  cafe: createConstellationConfig('cafe', 7, 'cluster'),
  bois: createConstellationConfig('bois', 8, 'tree'),
  mais: createConstellationConfig('mais', 6, 'radial'),
  hevea: createConstellationConfig('hevea', 7, 'tree'),
  sesame: createConstellationConfig('sesame', 5, 'linear'),
  cajou: createConstellationConfig('cajou', 6, 'cluster'),
  amandes: createConstellationConfig('amandes', 5, 'cluster'),
  sorgho: createConstellationConfig('sorgho', 6, 'linear'),
  soja: createConstellationConfig('soja', 5, 'radial'),
};

/**
 * Default constellation for hero section
 * Reduced opacity and size for better text readability
 */
export const DEFAULT_HERO_CONSTELLATION: ConstellationConfig = {
  nodes: [
    { id: 'center', position: [0, 0, -1], size: 0.35, label: 'STE-SCPB' },
    { id: 'n1', position: [-2.5, 1.2, -0.5], size: 0.18 },
    { id: 'n2', position: [2.5, 1.2, -0.5], size: 0.18 },
    { id: 'n3', position: [-2, -1.8, -0.5], size: 0.15 },
    { id: 'n4', position: [2, -1.8, -0.5], size: 0.15 },
    { id: 'n5', position: [0, 2.5, -0.8], size: 0.22 },
    { id: 'n6', position: [-3, -0.5, -1], size: 0.12 },
    { id: 'n7', position: [3, -0.5, -1], size: 0.12 },
  ],
  connections: [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
    [1, 5],
    [2, 5],
    [1, 3],
    [2, 4],
    [1, 6],
    [2, 7],
  ],
  color: '#fbbf24', // Amber
  glowIntensity: 0.6, // Reduced from 1.2 for better readability
  animationSpeed: 0.6, // Slower, more subtle animation
};

/**
 * Gets constellation config for a product category
 */
export function getProductConstellation(
  category: ProductCategory
): ConstellationConfig {
  return PRODUCT_CONSTELLATIONS[category];
}

/**
 * Transition configuration for constellation changes
 */
export interface TransitionConfig {
  duration: number;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export const DEFAULT_TRANSITION: TransitionConfig = {
  duration: 1.5,
  easing: 'easeInOut',
};

/**
 * Creates interpolated constellation for transitions
 */
export function interpolateConstellations(
  from: ConstellationConfig,
  to: ConstellationConfig,
  progress: number
): ConstellationConfig {
  // Interpolate node positions
  const maxNodes = Math.max(from.nodes.length, to.nodes.length);
  const nodes: ConstellationConfig['nodes'] = [];

  for (let i = 0; i < maxNodes; i++) {
    const fromNode = from.nodes[i] || from.nodes[from.nodes.length - 1];
    const toNode = to.nodes[i] || to.nodes[to.nodes.length - 1];

    nodes.push({
      id: toNode.id,
      position: [
        fromNode.position[0] + (toNode.position[0] - fromNode.position[0]) * progress,
        fromNode.position[1] + (toNode.position[1] - fromNode.position[1]) * progress,
        fromNode.position[2] + (toNode.position[2] - fromNode.position[2]) * progress,
      ],
      size: fromNode.size + (toNode.size - fromNode.size) * progress,
      label: toNode.label,
    });
  }

  // Use target connections
  const connections = progress > 0.5 ? to.connections : from.connections;

  // Interpolate color (simplified - just use target after halfway)
  const color = progress > 0.5 ? to.color : from.color;

  return {
    nodes,
    connections,
    color,
    glowIntensity:
      from.glowIntensity + (to.glowIntensity - from.glowIntensity) * progress,
    animationSpeed:
      from.animationSpeed + (to.animationSpeed - from.animationSpeed) * progress,
  };
}
