import React from 'react';
import type { Metadata } from 'next';
import { getProducts } from '../../../lib/services/products';
import { getKits } from '../../../lib/services/kits';
import { ProductCard } from '../../../components/product/ProductCard';
import { ShopSort } from '../../../components/product/ShopSort';
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
  { label: 'Cycle kits', slug: 'kits' },
  { label: 'Mountain teas', slug: 'teas' },
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
  const currentCategory = categories.some((category) => category.slug === categoryParam)
    ? categoryParam
    : 'all';
  const currentSort = sortOptions.some((option) => option.value === sortParam)
    ? sortParam
    : 'featured';
  const currentSearch = firstParam(searchParams.search);

  const products = getProducts({
    categorySlug: currentCategory,
    sort: currentSort,
    search: currentSearch,
  });
  const kits = currentCategory === 'all' || currentCategory === 'kits'
    ? getKits({ search: currentSearch })
    : [];
  const allItems = [...kits, ...products];

  if (currentSort === 'price-asc' || currentSort === 'price-desc') {
    allItems.sort((a, b) => currentSort === 'price-asc'
      ? a.price_minor - b.price_minor
      : b.price_minor - a.price_minor);
  } else if (currentSearch.trim()) {
    const term = currentSearch.trim().toLowerCase();
    allItems.sort((a, b) => Number(b.name.toLowerCase().includes(term)) - Number(a.name.toLowerCase().includes(term)));
  }

  const categoryHref = (category: string, includeSearch = true) => {
    const params = new URLSearchParams({ category, sort: currentSort });
    if (includeSearch && currentSearch) params.set('search', currentSearch);
    return `/shop?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <header className="motion-enter mb-9 max-w-2xl sm:mb-12">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-seedly-dark">The Seedly pantry</p>
        <h1 className="font-serif text-4xl leading-tight text-charcoal sm:text-5xl">Seeds, kits &amp; herbal teas.</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-gray">
          Raw seeds, ready-to-use cycle kits and loose-leaf herbal teas. Find your favourites for the kitchen shelf.
        </p>
      </header>

      <nav aria-label="Product categories" className="flex flex-wrap gap-x-6 border-b border-border-gray sm:gap-x-8">
        {categories.map((category) => {
          const active = currentCategory === category.slug;
          return (
            <Link
              key={category.slug}
              href={categoryHref(category.slug)}
              aria-current={active ? 'page' : undefined}
              className={`-mb-px flex min-h-12 items-center border-b-2 py-3 text-sm transition-colors sm:text-base ${
                active
                  ? 'border-seedly-dark font-semibold text-seedly-dark'
                  : 'border-transparent text-muted-gray hover:border-seedly-dark/40 hover:text-charcoal'
              }`}
            >
              {category.label}
            </Link>
          );
        })}
      </nav>

      <div className="mb-7 flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 break-words text-sm text-muted-gray">
          <span className="font-medium text-charcoal">{allItems.length}</span> {allItems.length === 1 ? 'product' : 'products'}
          {currentSearch && (
            <span>
              {' '}for <span className="text-charcoal">&ldquo;{currentSearch}&rdquo;</span>
              <Link href={categoryHref(currentCategory, false)} className="ml-3 inline-flex min-h-11 items-center underline underline-offset-4 hover:text-seedly-dark">
                Clear search
              </Link>
            </span>
          )}
        </div>
        <ShopSort value={currentSort} category={currentCategory} search={currentSearch} options={sortOptions} />
      </div>

      {allItems.length === 0 ? (
        <div className="border-y border-border-gray py-20 text-center">
          <p className="font-serif text-2xl text-charcoal">No products found</p>
          <p className="mt-3 text-sm text-muted-gray">Try another search or browse the full collection.</p>
          <Link href="/shop" className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-seedly-dark px-6 py-3 text-sm font-medium text-white">View all products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
          {allItems.map((item) => <ProductCard key={item.id} product={item} />)}
        </div>
      )}
    </div>
  );
}
