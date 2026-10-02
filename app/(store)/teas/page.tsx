import React from 'react';
import { getProducts } from '../../../lib/services/products';
import { TeasCategoryClient } from '../../../components/product/TeasCategoryClient';
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

export default async function TeasPage() {
  const teas = await getProducts({ productType: 'tea' });

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-12 sm:px-6 sm:pt-6 sm:pb-16 lg:px-8 bg-white min-h-screen">
      <TeasCategoryClient initialTeas={teas} />
    </div>
  );
}
