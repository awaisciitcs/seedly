import React from 'react';
import { getProducts } from '../../../lib/services/products';
import { SeedsCategoryClient } from '../../../components/product/SeedsCategoryClient';
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
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-12 sm:px-6 sm:pt-6 sm:pb-16 lg:px-8 bg-white min-h-screen">
      <SeedsCategoryClient initialSeeds={seeds} />
    </div>
  );
}
