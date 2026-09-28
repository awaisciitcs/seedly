import React from 'react';
import { getProducts } from '../../../lib/services/products';
import { ProductCard } from '../../../components/product/ProductCard';
import { Coffee, ShieldCheck, Thermometer } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Loose-Leaf & Herbal Teas | Seedly Pakistan',
  description:
    'Whole chamomile blossoms, highland green tea, and wild Gilgit spearmint leaves. Free of paper teabag microplastics, with clearly labeled caffeine levels.',
};

export default function TeasPage() {
  const teas = getProducts({ productType: 'tea' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Category Hero */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-seedly-light text-seedly-dark text-xs font-semibold uppercase tracking-wider">
          <Coffee className="w-3.5 h-3.5 text-seedly-primary" />
          <span>Alpine Harvested Teas</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          Loose-Leaf &amp; Herbal Teas
        </h1>
        <p className="text-sm text-muted-gray leading-relaxed">
          Intact whole blossoms and single-estate loose leaves gathered from Gilgit-Baltistan and Khyber Pakhtunkhwa foothills. Free of bleached paper teabags and synthetic microplastics, with clearly verified caffeine levels.
        </p>
      </div>

      {/* Decision Support Strip */}
      <div className="mb-10 max-w-5xl mx-auto bg-white rounded-2xl p-4 sm:p-5 border border-border-gray shadow-subtle grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-charcoal">
        <div className="flex items-center gap-2.5">
          <Coffee className="w-4 h-4 text-seedly-primary shrink-0" />
          <div>
            <p className="font-bold">Yield: ~25 Cups / 50g</p>
            <p className="text-[11px] text-muted-gray">Whole leaves can be steeped 2–3 times</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 sm:border-l sm:border-border-gray/60 sm:pl-4">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <div>
            <p className="font-bold">Honest Caffeine Transparency</p>
            <p className="text-[11px] text-muted-gray">Herbal: Caffeine-Free · Green: Low (~20mg)</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 sm:border-l sm:border-border-gray/60 sm:pl-4">
          <Thermometer className="w-4 h-4 text-seedly-primary shrink-0" />
          <div>
            <p className="font-bold">Optimal Water Temp</p>
            <p className="text-[11px] text-muted-gray">80°C–90°C preserves delicate volatile oils</p>
          </div>
        </div>
      </div>

      {/* 3-Column Balanced Desktop Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
        {teas.map((tea) => (
          <ProductCard key={tea.id} product={tea} />
        ))}
      </div>
    </div>
  );
}
