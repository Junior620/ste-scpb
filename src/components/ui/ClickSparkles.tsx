'use client';

import { useState, useCallback, useEffect } from 'react';
import { Coffee, TreeDeciduous, Leaf, Droplets, Sprout } from 'lucide-react';

// Custom SVG icon for Cocoa bean
const CocoaIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Cocoa pod shape */}
    <ellipse cx="12" cy="12" rx="5" ry="8" />
    {/* Ridges on the pod */}
    <path d="M9 5c0 0 0 14 0 14" />
    <path d="M12 4v16" />
    <path d="M15 5c0 0 0 14 0 14" />
    {/* Stem */}
    <path d="M12 4c0-1 1-2 2-2" />
  </svg>
);

// Custom SVG icon for Cashew nut
const CashewIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Cashew curved shape */}
    <path d="M6 8c2-4 8-4 10 0c2 4 0 10-4 12c-4-2-8-8-6-12z" />
    {/* Inner detail */}
    <path d="M9 10c1-2 4-2 5 0c1 2 0 5-2 6" />
  </svg>
);

// Custom SVG icon for Corn/Maize
const CornIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Corn cob */}
    <ellipse cx="12" cy="13" rx="4" ry="7" />
    {/* Kernels pattern */}
    <circle cx="10" cy="10" r="1" />
    <circle cx="14" cy="10" r="1" />
    <circle cx="10" cy="14" r="1" />
    <circle cx="14" cy="14" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="16" r="1" />
    {/* Husk leaves */}
    <path d="M8 6c-2-2-1-4 1-4" />
    <path d="M16 6c2-2 1-4-1-4" />
    <path d="M12 6V3" />
  </svg>
);

// Product icons with custom SVGs for commodities
const PRODUCT_ICONS = [
  { Icon: Coffee, name: 'café' },
  { Icon: CocoaIcon, name: 'cacao' },
  { Icon: TreeDeciduous, name: 'bois' },
  { Icon: CornIcon, name: 'maïs' },
  { Icon: CashewIcon, name: 'cajou' },
  { Icon: Sprout, name: 'sésame' },
  { Icon: Leaf, name: 'soja' },
  { Icon: Droplets, name: 'hévéa' },
];

interface Sparkle {
  id: number;
  x: number;
  y: number;
  IconComponent: React.ComponentType<{ className?: string }>;
  rotation: number;
}

export function ClickSparkles() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const handleClick = useCallback((e: MouseEvent) => {
    // Don't trigger on buttons, links, or interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('[role="button"]')
    ) {
      return;
    }

    const randomProduct = PRODUCT_ICONS[Math.floor(Math.random() * PRODUCT_ICONS.length)];
    const newSparkle: Sparkle = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      IconComponent: randomProduct.Icon,
      rotation: Math.random() * 30 - 15,
    };

    setSparkles((prev) => [...prev, newSparkle]);

    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id));
    }, 1000);
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleClick]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" aria-hidden="true">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-float-up"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            transform: `translate(-50%, -50%) rotate(${sparkle.rotation}deg)`,
          }}
        >
          <sparkle.IconComponent className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(212,168,83,0.8)]" />
        </div>
      ))}
    </div>
  );
}

export default ClickSparkles;
