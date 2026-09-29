import React from 'react';
import { getProducts } from '../../../lib/services/products';
import { ProductCard } from '../../../components/product/ProductCard';
import { Coffee, ShieldCheck, Thermometer } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mountain Teas & Loose Botanicals | Seedly Pakistan',
  description:
    'Whole chamomile blossoms, highland green tea, and wild Gilgit spearmint leaves. Free of paper teabag microplastics, with clearly labelled caffeine levels.',
  openGraph: {
    title: 'Mountain Teas & Loose Botanicals | Seedly Pakistan',
    description:
      'Whole chamomile blossoms, highland green tea, and alpine spearmint leaves from northern valleys. Honest caffeine labelling for every cup.',
    url: 'https://seedly.pk/teas',
    siteName: 'Seedly',
    locale: 'en_PK',
    type: 'website',
    images: [
      {
        url: '/images/products/chamomile-tea.jpg',
        width: 800,
        height: 800,
        alt: 'Seedly whole flower chamomile tea',
      },
    ],
  },
};

export default function TeasPage() {
  const teas = getProducts({ productType: 'tea' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10">
      {/* Category Header */}
      <div className="max-w-2xl">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
          Mountain Teas &amp; Tisanes
        </h1>
        <p className="text-sm text-muted-gray mt-2 leading-relaxed">
          Our herbal teas (chamomile and spearmint) are naturally caffeine-free tisanes. Highland green tea contains gentle caffeine (approx. 20 mg per cup). All loose whole leaves and blossoms, free of paper teabag microplastics and machine dust, with honest caffeine labelling for every cup.
        </p>
      </div>

      {/* 3-Column Balanced Desktop Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {teas.map((tea) => (
          <ProductCard key={tea.id} product={tea} />
        ))}
      </div>
    </div>
  );
}
