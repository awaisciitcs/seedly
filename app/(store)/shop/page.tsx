import React from 'react';
import type { Metadata } from 'next';
import { getProducts } from '../../../lib/services/products';
import { getKits } from '../../../lib/services/kits';
import { ShopCatalogClient } from '../../../components/storefront/ShopCatalogClient';
import { ArrowUpRight, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Raw Seeds, Cycle Kits & Mountain Teas | Seedly Pakistan',
  description:
    'Browse our full collection of raw pantry seeds, 14-day & 28-day routine kits, and high-altitude teas. Dispatched nationwide across Pakistan from Lahore.',
  openGraph: {
    title: 'Raw Seeds, Cycle Kits & Mountain Teas | Seedly Pakistan',
    description:
      'Pure whole raw pantry seeds, monthly routine kits, and whole blossom teas dispatched nationwide.',
    url: 'https://seedly.pk/shop',
    siteName: 'Seedly',
    locale: 'en_PK',
    type: 'website',
    images: [
      {
        url: '/images/hero/seedly-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Seedly shop catalog',
      },
    ],
  },
};

const categories = [
  { label: 'All products', slug: 'all' },
  { label: 'Raw seeds', slug: 'seeds' },
  { label: 'Mountain teas', slug: 'teas' },
  { label: 'Seed kits', slug: 'kits' },
];

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: low to high', value: 'price-asc' },
  { label: 'Price: high to low', value: 'price-desc' },
];

export default async function ShopPage(props: {
  searchParams: Promise<{ category?: string | string[]; sort?: string | string[]; search?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const firstParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] || '' : value || '';
  const categoryParam = firstParam(searchParams.category);
  const sortParam = firstParam(searchParams.sort);
  const currentCategory = categories.some((cat) => cat.slug === categoryParam)
    ? categoryParam
    : 'all';
  const currentSort = sortOptions.some((option) => option.value === sortParam)
    ? sortParam
    : 'featured';
  const currentSearch = firstParam(searchParams.search);

  const [products, kits] = await Promise.all([
    getProducts({
      categorySlug: currentCategory,
      sort: currentSort,
      search: currentSearch,
    }),
    currentCategory === 'all' || currentCategory === 'kits'
      ? getKits({ search: currentSearch })
      : Promise.resolve([]),
  ]);
  const allItems = [...kits, ...products];

  if (currentSort === 'price-asc' || currentSort === 'price-desc') {
    allItems.sort((a, b) => currentSort === 'price-asc'
      ? a.price_minor - b.price_minor
      : b.price_minor - a.price_minor);
  } else if (currentSearch.trim()) {
    const term = currentSearch.trim().toLowerCase();
    allItems.sort((a, b) => Number(b.name.toLowerCase().includes(term)) - Number(a.name.toLowerCase().includes(term)));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-12 sm:px-6 sm:pt-6 sm:pb-16 lg:px-8 bg-white min-h-screen">
      <ShopCatalogClient
        initialItems={allItems}
        currentCategory={currentCategory}
        currentSort={currentSort}
        currentSearch={currentSearch}
        sortOptions={sortOptions}
        categories={categories}
      />
    </div>
  );
}
