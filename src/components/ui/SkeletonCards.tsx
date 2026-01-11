'use client';

import { Skeleton } from './Skeleton';

/**
 * ProductCardSkeleton - Matches ProductCard dimensions in ProductsSection
 * Validates: Requirements 4.4 (no layout shift)
 */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-background-secondary p-4 md:p-6 space-y-4 h-full">
      {/* Image - aspect-video like ProductCard */}
      <div className="-mx-4 -mt-4 md:-mx-6 md:-mt-6 mb-4">
        <Skeleton variant="rectangular" className="w-full aspect-video rounded-t-xl" />
      </div>
      {/* Title */}
      <Skeleton variant="text" width="70%" height={28} />
      {/* Tagline */}
      <Skeleton variant="text" width="85%" height={20} />
      {/* Origin */}
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width={16} height={16} />
        <Skeleton variant="text" width={100} height={16} />
      </div>
      {/* Certifications */}
      <div className="flex flex-wrap gap-1">
        <Skeleton variant="rectangular" width={60} height={22} className="rounded" />
        <Skeleton variant="rectangular" width={50} height={22} className="rounded" />
        <Skeleton variant="rectangular" width={70} height={22} className="rounded" />
      </div>
      {/* Footer */}
      <div className="pt-4 border-t border-border/50">
        <Skeleton variant="text" width={120} height={20} />
      </div>
    </div>
  );
}

/**
 * TeamMemberSkeleton - Matches TeamMemberCard dimensions in TeamSection
 * Validates: Requirements 4.4 (no layout shift)
 */
export function TeamMemberSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-background-secondary p-6 flex flex-col items-center text-center space-y-4">
      {/* Photo - w-24 h-24 md:w-28 md:h-28 like TeamMemberCard */}
      <Skeleton variant="circular" width={112} height={112} className="mb-4" />
      {/* Name */}
      <Skeleton variant="text" width="60%" height={24} className="mx-auto" />
      {/* Role */}
      <Skeleton variant="text" width="40%" height={18} className="mx-auto" />
      {/* Bio */}
      <div className="w-full space-y-2">
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="90%" height={16} />
        <Skeleton variant="text" width="75%" height={16} />
      </div>
      {/* Languages & Response time */}
      <div className="flex justify-center gap-3">
        <Skeleton variant="text" width={60} height={14} />
        <Skeleton variant="text" width={70} height={14} />
      </div>
      {/* Contact button */}
      <Skeleton variant="rectangular" width={140} height={36} className="rounded-lg mt-4" />
    </div>
  );
}

/**
 * ArticleCardSkeleton - Matches ArticleCard dimensions in BlogSection
 * Validates: Requirements 4.4 (no layout shift)
 */
export function ArticleCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-background-secondary overflow-hidden h-full">
      {/* Featured Image - aspect-video like ArticleCard */}
      <div className="-mx-4 -mt-4 md:-mx-6 md:-mt-6 mb-4 p-4 md:p-6">
        <Skeleton variant="rectangular" className="w-full aspect-video rounded-t-xl -m-4 md:-m-6" />
      </div>
      <div className="p-4 md:p-6 pt-0 space-y-3">
        {/* Title */}
        <Skeleton variant="text" width="90%" height={24} />
        {/* Excerpt */}
        <div className="space-y-2">
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="95%" height={16} />
          <Skeleton variant="text" width="70%" height={16} />
        </div>
        {/* Date */}
        <div className="flex items-center gap-2 pt-2">
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="text" width={120} height={16} />
        </div>
        {/* Read more */}
        <Skeleton variant="text" width={100} height={18} className="mt-4" />
      </div>
    </div>
  );
}

/**
 * ProductsGridSkeleton - Grid of product card skeletons
 * Matches ProductsSection grid layout
 */
export function ProductsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * TeamGridSkeleton - Grid of team member skeletons
 * Matches TeamSection grid layout
 */
export function TeamGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <TeamMemberSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * ArticlesGridSkeleton - Grid of article card skeletons
 * Matches BlogSection grid layout
 */
export function ArticlesGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}
