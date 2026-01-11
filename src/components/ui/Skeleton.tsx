'use client';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  lines?: number;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  lines = 1,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-border/50';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  };

  const style: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height: height ?? (variant === 'circular' ? width : undefined),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses.text}`}
            style={{ ...style, width: i === lines - 1 ? '75%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}
