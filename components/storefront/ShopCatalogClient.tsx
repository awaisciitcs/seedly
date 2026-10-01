'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, Kit } from '../../lib/types';
import { ProductCard } from '../product/ProductCard';
import { ShopSort } from '../product/ShopSort';
import { SlidersHorizontal, LayoutGrid, List, Check, RotateCcw } from 'lucide-react';
import { formatPKR } from '../../lib/utils';

interface ShopCatalogClientProps {
  initialItems: (Product | (Kit & { product_type?: 'kit' }))[];
  currentCategory: string;
  currentSort: string;
  currentSearch: string;
  sortOptions: { label: string; value: string }[];
  categories: { label: string; slug: string }[];
}

export function ShopCatalogClient({
  initialItems,
  currentCategory,
  currentSort,
  currentSearch,
  sortOptions,
  categories,
}: ShopCatalogClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedPriceBracket, setSelectedPriceBracket] = useState<string>('all');

  // Filter items client-side for immediate responsive filtering
  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      // Stock filter
      const isKit = item.product_type === 'kit' || 'items' in item;
      const stock = isKit
        ? (item as Kit).computed_stock ?? 0
        : (item as Product).variants?.find((v) => v.status === 'ACTIVE')?.inventory_quantity ?? 0;
      
      if (inStockOnly && stock <= 0) return false;

      // Price filter
      const price = item.price_minor;
      if (selectedPriceBracket === 'under1000' && price >= 100000) return false;
      if (selectedPriceBracket === '1000to2000' && (price < 100000 || price > 200000)) return false;
      if (selectedPriceBracket === 'above2000' && price <= 200000) return false;

      return true;
    });
  }, [initialItems, inStockOnly, selectedPriceBracket]);

  const categoryHref = (category: string) => {
    const params = new URLSearchParams({ category, sort: currentSort });
    if (currentSearch) params.set('search', currentSearch);
    return `/shop?${params.toString()}`;
  };

  return (
    <div className="space-y-8">
      
      {/* CATEGORY PILL TABS */}
      <nav aria-label="Catalog category tabs" className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {categories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          return (
            <Link
              key={cat.slug}
              href={categoryHref(cat.slug)}
              className={`btn-brutal px-4 sm:px-5 py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider ${
                isActive
                  ? 'bg-seed-lime text-ink'
                  : 'bg-white text-ink hover:bg-seed-lime/30'
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </nav>

      {/* TWO-COLUMN LAYOUT: SIDEBAR + PRODUCT GRID */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT SIDEBAR: FILTERS */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="card-brutal bg-white p-5 sm:p-6 shadow-brutal space-y-6">
            
            {/* Filter Header */}
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <div className="flex items-center gap-2 font-heading font-black text-sm uppercase tracking-wider text-ink">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filter Pantry</span>
              </div>
              {(inStockOnly || selectedPriceBracket !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setInStockOnly(false);
                    setSelectedPriceBracket('all');
                  }}
                  className="text-[10px] font-bold uppercase tracking-wider text-muted-gray hover:text-ink underline flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              )}
            </div>

            {/* Category Filter with Color-Coded Dots */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-ink mb-3">
                Category
              </h3>
              <div className="space-y-2.5">
                {[
                  { slug: 'all', label: 'All Pantry Items', color: 'bg-paper' },
                  { slug: 'seeds', label: 'Raw Seeds', color: 'bg-seed-lime' },
                  { slug: 'teas', label: 'Mountain Teas', color: 'bg-tea-butter' },
                  { slug: 'kits', label: 'Seed Routine Kits', color: 'bg-kit-coral' },
                ].map((item) => {
                  const isChecked = currentCategory === item.slug;
                  return (
                    <Link
                      key={item.slug}
                      href={categoryHref(item.slug)}
                      className={`flex items-center justify-between p-2 rounded-[14px] border-2 border-ink text-xs font-bold transition-all ${
                        isChecked ? 'bg-paper shadow-brutal-sm text-ink' : 'bg-white hover:bg-paper/50 text-ink/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-3 w-3 rounded-full border border-ink ${item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      <div className={`h-4 w-4 rounded-sm border-2 border-ink flex items-center justify-center ${isChecked ? 'bg-seed-lime' : 'bg-white'}`}>
                        {isChecked && <Check className="h-3 w-3 text-ink stroke-[3]" />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-ink mb-3">
                Price Range
              </h3>
              <div className="space-y-2 text-xs font-bold">
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under1000', label: 'Under Rs. 1,000' },
                  { id: '1000to2000', label: 'Rs. 1,000 – Rs. 2,000' },
                  { id: 'above2000', label: 'Rs. 2,000 & Above' },
                ].map((bracket) => (
                  <button
                    key={bracket.id}
                    type="button"
                    onClick={() => setSelectedPriceBracket(bracket.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-[14px] border-2 border-ink transition-all ${
                      selectedPriceBracket === bracket.id
                        ? 'bg-paper shadow-brutal-sm text-ink'
                        : 'bg-white text-ink/75 hover:bg-paper/50'
                    }`}
                  >
                    <span>{bracket.label}</span>
                    <div className={`h-4 w-4 rounded-sm border-2 border-ink flex items-center justify-center ${selectedPriceBracket === bracket.id ? 'bg-seed-lime' : 'bg-white'}`}>
                      {selectedPriceBracket === bracket.id && <Check className="h-3 w-3 text-ink stroke-[3]" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-ink mb-3">
                Availability
              </h3>
              <button
                type="button"
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`w-full flex items-center justify-between p-2 rounded-[14px] border-2 border-ink text-xs font-bold transition-all ${
                  inStockOnly ? 'bg-paper shadow-brutal-sm text-ink' : 'bg-white text-ink/75 hover:bg-paper/50'
                }`}
              >
                <span>In Stock Only</span>
                <div className={`h-4 w-4 rounded-sm border-2 border-ink flex items-center justify-center ${inStockOnly ? 'bg-seed-lime' : 'bg-white'}`}>
                  {inStockOnly && <Check className="h-3 w-3 text-ink stroke-[3]" />}
                </div>
              </button>
            </div>

            {/* Lahore Quality Stamp */}
            <div className="rounded-[18px] border-2 border-ink bg-pistachio-sage/40 p-3.5 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-ink">
                ✦ Freshly Packed in Lahore
              </span>
              <p className="text-[11px] text-muted-gray mt-1 leading-snug">
                Dispatched daily via Express nationwide COD
              </p>
            </div>

          </div>
        </aside>

        {/* RIGHT COLUMN: TOOLBAR & PRODUCT GRID */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Top Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border-2 border-ink bg-white p-3.5 sm:px-5 shadow-brutal-sm">
            
            {/* Active Items Count Pill & Canva Lime Dot Accent */}
            <div className="flex items-center gap-2.5">
              <div
                aria-hidden="true"
                className="h-6 w-6 rounded-full border-2 border-ink bg-seed-lime shadow-brutal-sm hidden sm:block shrink-0"
              />
              <div className="rounded-full border-2 border-ink bg-seed-lime px-3 py-1 text-xs font-black uppercase tracking-wider text-ink shadow-brutal-sm inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-ink" />
                <span>{filteredItems.length} {filteredItems.length === 1 ? 'Product' : 'Products'}</span>
              </div>
              {currentSearch && (
                <span className="text-xs text-muted-gray">
                  for &ldquo;<strong className="text-ink">{currentSearch}</strong>&rdquo;
                </span>
              )}
            </div>

            {/* Sort & View Mode Segmented Pill */}
            <div className="flex items-center gap-3">
              <ShopSort
                value={currentSort}
                category={currentCategory}
                search={currentSearch}
                options={sortOptions}
              />

              {/* Segmented View Mode Toggle */}
              <div className="hidden sm:inline-flex rounded-full border-2 border-ink bg-white p-0.5 shadow-brutal-sm">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                    viewMode === 'grid' ? 'bg-seed-lime text-ink' : 'text-muted-gray hover:text-ink'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="List view"
                  aria-pressed={viewMode === 'list'}
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                    viewMode === 'list' ? 'bg-seed-lime text-ink' : 'text-muted-gray hover:text-ink'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Product Items */}
          {filteredItems.length === 0 ? (
            <div className="card-brutal bg-white p-12 text-center shadow-brutal">
              <div className="h-12 w-12 rounded-full border-2 border-ink bg-tea-butter mx-auto flex items-center justify-center mb-3 shadow-brutal-sm">
                ✦
              </div>
              <h3 className="font-heading font-black text-xl text-ink">No products found</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-gray max-w-sm mx-auto">
                No pantry products match your selected filters. Try resetting the filters or searching for another item.
              </p>
              <button
                type="button"
                onClick={() => {
                  setInStockOnly(false);
                  setSelectedPriceBracket('all');
                  router.push('/shop');
                }}
                className="btn-brutal bg-seed-lime text-ink px-5 py-2.5 text-xs font-bold uppercase tracking-wider mt-5 shadow-brutal-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default ShopCatalogClient;
