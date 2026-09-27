import React from 'react';
import { getProducts } from '../../../lib/services/products';
import { ProductCard } from '../../../components/product/ProductCard';
import { Leaf } from 'lucide-react';

export default function SeedsPage() {
  const seeds = getProducts({ productType: 'seed' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Category Hero */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-seedly-light text-seedly-dark text-xs font-semibold uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5 text-seedly-primary" />
          <span>Single-Origin Botanicals</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          Raw Heirloom Seeds
        </h1>
        <p className="text-sm text-muted-gray leading-relaxed">
          Cold-milled and raw seeds rich in plant-based Omega-3s, bioavailable zinc, selenium, and essential minerals. Sourced directly from trusted smallholder farms in Pakistan.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {seeds.map((seed) => (
          <ProductCard key={seed.id} product={seed} />
        ))}
      </div>
    </div>
  );
}
