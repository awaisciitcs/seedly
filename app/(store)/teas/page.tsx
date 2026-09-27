import React from 'react';
import { getProducts } from '../../../lib/services/products';
import { ProductCard } from '../../../components/product/ProductCard';
import { Sparkles } from 'lucide-react';

export default function TeasPage() {
  const teas = getProducts({ productType: 'tea' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Category Hero */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-seedly-light text-seedly-dark text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-seedly-primary" />
          <span>Mountain-Harvested Infusions</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          Pure Herbal Teas
        </h1>
        <p className="text-sm text-muted-gray leading-relaxed">
          Whole blossoms and hand-selected loose leaves gathered from pristine valleys of Gilgit-Baltistan and Khyber Pakhtunkhwa. Naturally caffeine-free and free of paper teabag microplastics.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {teas.map((tea) => (
          <ProductCard key={tea.id} product={tea} />
        ))}
      </div>
    </div>
  );
}
