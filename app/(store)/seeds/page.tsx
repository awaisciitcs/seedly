import React from 'react';
import { getProducts } from '../../../lib/services/products';
import { ProductCard } from '../../../components/product/ProductCard';
import { Leaf, ShieldCheck, Scale } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Raw Pantry Seeds | Seedly Pakistan',
  description:
    'Single-origin edible seeds from Punjab family farms. Sun-dried pumpkin seeds, cold-milled golden flax, raw sunflower kernels, and unhulled white sesame.',
  openGraph: {
    title: 'Raw Pantry Seeds | Seedly Pakistan',
    description:
      'Single-origin raw seeds from Punjab family farms. Unsalted, unglazed, and packed in standard 250g resealable barrier pouches.',
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

export default function SeedsPage() {
  const seeds = getProducts({ productType: 'seed' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Category Header */}
      <div className="mb-8 max-w-2xl">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
          Raw Pantry Seeds
        </h1>
        <p className="text-sm text-muted-gray mt-2 leading-relaxed">
          Single-origin harvests from smallholder family farms in Punjab. Triple-cleaned, sun-dried, and left raw without added salt, glazes, or vegetable oils. Packaged in standard 250g resealable barrier pouches.
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
