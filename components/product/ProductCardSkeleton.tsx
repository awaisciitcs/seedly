import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="relative aspect-square w-full rounded-sm skeleton-shimmer" />
      <div className="flex flex-1 flex-col pt-4 space-y-2.5">
        <div className="h-5 w-3/4 rounded skeleton-shimmer" />
        <div className="h-4 w-5/6 rounded skeleton-shimmer" />
        <div className="mt-auto pt-4 space-y-2">
          <div className="h-5 w-1/3 rounded skeleton-shimmer" />
          <div className="h-4 w-1/4 rounded skeleton-shimmer" />
          <div className="h-11 w-full rounded-sm skeleton-shimmer mt-3" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
