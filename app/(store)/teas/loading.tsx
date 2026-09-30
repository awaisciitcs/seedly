import React from 'react';
import { ProductGridSkeleton } from '../../../components/product/ProductCardSkeleton';

export default function TeasLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="space-y-3 max-w-xl">
        <div className="h-9 w-52 rounded skeleton-shimmer" />
        <div className="h-5 w-full rounded skeleton-shimmer" />
      </div>
      <ProductGridSkeleton count={3} />
    </div>
  );
}
