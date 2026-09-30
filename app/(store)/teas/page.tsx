import React from 'react';
import { getProducts } from '../../../lib/services/products';
import { ProductCard } from '../../../components/product/ProductCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Loose-Leaf Tea & Herbal Tea | Seedly Pakistan',
  description:
    'Shop loose chamomile flowers, spearmint and green tea. Find flavour notes, caffeine information and brewing instructions on each product page.',
  openGraph: {
    title: 'Loose-Leaf Tea & Herbal Tea | Seedly Pakistan',
    description:
      'Loose chamomile flowers, spearmint and green tea, with flavour notes and brewing instructions to help you choose.',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Category Header */}
      <div className="motion-enter max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-seedly-primary mb-4">The tea shelf</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium text-charcoal">
          Find your next cup.
        </h1>
        <p className="text-base text-muted-gray mt-4 leading-relaxed">
          Chamomile flowers, spearmint leaves and green tea, ready to brew loose. Explore the flavour notes and find the brewing instructions on each product page.
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
