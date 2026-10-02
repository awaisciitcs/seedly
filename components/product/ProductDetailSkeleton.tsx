import React from 'react';

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-48 rounded skeleton-shimmer mb-8" />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Left Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square w-full rounded-2xl skeleton-shimmer" />
          <div className="h-16 w-full rounded-2xl skeleton-shimmer" />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-4">
            <div className="h-4 w-32 rounded skeleton-shimmer" />
            <div className="h-10 w-3/4 rounded skeleton-shimmer" />
            <div className="h-4 w-full rounded skeleton-shimmer" />
            <div className="h-4 w-2/3 rounded skeleton-shimmer" />
            <div className="h-8 w-40 rounded skeleton-shimmer pt-2" />
            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="h-20 rounded-xl skeleton-shimmer" />
              <div className="h-20 rounded-xl skeleton-shimmer" />
              <div className="h-20 rounded-xl skeleton-shimmer" />
            </div>
            <div className="h-14 w-full rounded-full skeleton-shimmer pt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
