import React from 'react';
import { getProducts } from '../../../lib/services/products';
import { ProductCard } from '../../../components/product/ProductCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Raw Pantry Seeds | Seedly Pakistan',
  description:
    'Shop pumpkin seeds, ground flaxseed, sunflower kernels and white sesame. Compare pack sizes and find an ingredient for breakfast, baking or salads.',
  openGraph: {
    title: 'Raw Pantry Seeds | Seedly Pakistan',
    description:
      'Pumpkin, flax, sunflower and sesame seeds for your kitchen. Choose your preferred pack size on each product page.',
    url: 'https://seedly.pk/seeds',
    siteName: 'Seedly',
    locale: 'en_PK',
    type: 'website',
    images: [
      {
        url: '/images/products/pumpkin-seeds.jpg',
        width: 800,
        height: 800,
        alt: 'Seedly raw pumpkin seeds',
      },
    ],
  },
};

export default async function SeedsPage() {
  const seeds = await getProducts({ productType: 'seed' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Category Header */}
      <div className="motion-enter mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-seedly-primary mb-4">The pantry</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium text-charcoal">
          Seeds for everyday cooking.
        </h1>
        <p className="text-base text-muted-gray mt-4 leading-relaxed">
          Pumpkin, flax, sunflower and sesame. Stir them into breakfast, bake with them or add a little crunch to a salad. Choose your pack size on the product page.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {seeds.map((seed) => (
          <ProductCard key={seed.id} product={seed} />
        ))}
      </div>
    </div>
  );
}
