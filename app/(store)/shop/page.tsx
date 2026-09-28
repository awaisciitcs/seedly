import React from 'react';
import type { Metadata } from 'next';
import { getProducts } from '../../../lib/services/products';
import { getKits } from '../../../lib/services/kits';
import { ProductCard } from '../../../components/product/ProductCard';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Complete Catalog — Heirloom Seeds, Routine Kits & Teas | Seedly',
  description:
    'Browse our full collection of raw Pakistani heirloom seeds, 28-day seed cycling kits, and whole-blossom mountain herbal teas. Dispatched nationwide.',
};

export default async function ShopPage(props: {
  searchParams: Promise<{ category?: string; sort?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentCategory = searchParams.category || 'all';
  const currentSort = searchParams.sort || 'featured';
  const currentSearch = searchParams.search || '';

  const products = getProducts({
    categorySlug: currentCategory,
    sort: currentSort,
    search: currentSearch,
  });

  const kits = (currentCategory === 'all' || currentCategory === 'kits')
    ? getKits({ search: currentSearch })
    : [];

  // Combine products and kits for 'all' or 'kits'
  let allItems = [...(currentCategory === 'seeds' || currentCategory === 'teas' ? [] : kits), ...products];

  if (currentSearch.trim()) {
    const term = currentSearch.trim().toLowerCase();
    allItems.sort((a, b) => {
      const aExact = a.name.toLowerCase().includes(term) ? 1 : 0;
      const bExact = b.name.toLowerCase().includes(term) ? 1 : 0;
      if (aExact !== bExact) {
        return bExact - aExact; // Prioritize exact product name matches first
      }
      return 0;
    });
  }

  const categories = [
    { label: 'All Catalog', slug: 'all' },
    { label: 'Heirloom Seeds', slug: 'seeds' },
    { label: 'Curated Kits', slug: 'kits' },
    { label: 'Herbal Teas', slug: 'teas' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
          Apothecary Collection
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          Pure Botanical Goods
        </h1>
        <p className="text-sm text-muted-gray">
          Cold-milled heirloom seeds, daily seed-cycling rituals, and high-altitude whole blossom teas.
        </p>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-8 mb-8 border-b border-border-gray/70">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const active = currentCategory === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}${currentSort ? `&sort=${currentSort}` : ''}${currentSearch ? `&search=${currentSearch}` : ''}`}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? 'bg-seedly-dark text-white shadow-subtle'
                    : 'bg-white text-charcoal border border-border-gray/80 hover:bg-cream'
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Search & Sort controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {currentSearch && (
            <div className="text-xs text-muted-gray">
              Search results for: <strong className="text-charcoal">"{currentSearch}"</strong>
              <Link href="/shop" className="ml-2 text-seedly-dark underline">
                Clear
              </Link>
            </div>
          )}

          <div className="text-xs text-muted-gray">
            Showing <strong className="text-charcoal">{allItems.length}</strong> items
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {allItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-border-gray">
          <p className="font-serif text-xl font-medium text-charcoal">No botanical products found</p>
          <p className="text-sm text-muted-gray mt-2">Try adjusting your search terms or category filter.</p>
          <Link
            href="/shop"
            className="inline-block mt-5 px-6 py-2.5 bg-seedly-dark text-white rounded-full text-xs font-semibold"
          >
            Reset Filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {allItems.map((item) => (
            <ProductCard key={item.id} product={item as any} />
          ))}
        </div>
      )}
    </div>
  );
}
