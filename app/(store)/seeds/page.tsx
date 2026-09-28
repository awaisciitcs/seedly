import React from 'react';
import { getProducts } from '../../../lib/services/products';
import { ProductCard } from '../../../components/product/ProductCard';
import { Leaf, ShieldCheck, Scale } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Raw Heirloom Seeds | Seedly Pakistan',
  description:
    'Single-origin edible seeds from Punjab family farms. Sun-dried pumpkin seeds, cold-milled golden flax, raw sunflower kernels, and unhulled white sesame.',
};

export default function SeedsPage() {
  const seeds = getProducts({ productType: 'seed' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Category Hero */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-seedly-light text-seedly-dark text-xs font-semibold uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5 text-seedly-primary" />
          <span>Single-Origin Harvests</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          Raw Heirloom Seeds
        </h1>
        <p className="text-sm text-muted-gray leading-relaxed">
          Triple-cleaned, unbleached, and raw edible seeds from Punjab cooperatives. Naturally dense in plant-based Omega-3s, zinc, magnesium, and dietary selenium.
        </p>
      </div>

      {/* Attributes Strip */}
      <div className="mb-10 max-w-4xl mx-auto bg-white rounded-2xl p-4 sm:p-5 border border-border-gray shadow-subtle grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-charcoal">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <div>
            <p className="font-bold">100% Raw &amp; Unsalted</p>
            <p className="text-[11px] text-muted-gray">Zero added oils, salt, or artificial glazes</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 sm:border-l sm:border-border-gray/60 sm:pl-4">
          <Leaf className="w-4 h-4 text-seedly-primary shrink-0" />
          <div>
            <p className="font-bold">Punjab Cooperative Sourcing</p>
            <p className="text-[11px] text-muted-gray">Sahiwal, Multan, Bahawalpur &amp; Sargodha</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 sm:border-l sm:border-border-gray/60 sm:pl-4">
          <Scale className="w-4 h-4 text-seedly-primary shrink-0" />
          <div>
            <p className="font-bold">Standard 250g Pouches</p>
            <p className="text-[11px] text-muted-gray">Resealable oxygen-barrier kraft bags</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {seeds.map((seed) => (
          <ProductCard key={seed.id} product={seed} />
        ))}
      </div>
    </div>
  );
}
