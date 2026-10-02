import React from 'react';
import { getKits } from '../../../lib/services/kits';
import { KitsCategoryClient } from '../../../components/product/KitsCategoryClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seed Cycling Kits | Seedly Pakistan',
  description:
    'Compare Seedly seed cycling kits. Choose a two-seed pairing or the complete four-seed set, and see the contents and current prices before you order.',
  openGraph: {
    title: 'Seed Cycling Kits | Seedly Pakistan',
    description:
      'Two-seed pairings and a complete four-seed set. Compare the contents and prices of our seed cycling kits.',
    url: 'https://seedly.pk/kits',
    siteName: 'Seedly',
    locale: 'en_PK',
    type: 'website',
    images: [
      {
        url: '/images/products/complete-kit.jpg',
        width: 800,
        height: 800,
        alt: 'Seedly complete seed cycling kit',
      },
    ],
  },
};

export default async function KitsPage() {
  const kits = await getKits();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-12 sm:px-6 sm:pt-6 sm:pb-16 lg:px-8 bg-white min-h-screen">
      <KitsCategoryClient initialKits={kits} />
    </div>
  );
}
