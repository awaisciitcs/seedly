'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, Kit } from '../../lib/types';
import { ProductCard } from '../product/ProductCard';
import {
  X,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  Check,
  RotateCcw,
  Truck,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';

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
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(currentCategory || 'all');
  const [selectedPhase, setSelectedPhase] = useState<'all' | 'follicular' | 'luteal'>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedPriceBracket, setSelectedPriceBracket] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>(currentSort || 'featured');

  // Sync category if URL prop changes
  useEffect(() => {
    setSelectedCategory(currentCategory || 'all');
  }, [currentCategory]);

  // Lock body scroll when left-side filter drawer is open
  useEffect(() => {
    if (isFilterDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFilterDrawerOpen]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFilterDrawerOpen) {
        setIsFilterDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFilterDrawerOpen]);

  // Client-side filtering and sorting for immediate response
  const filteredItems = useMemo(() => {
    let result = initialItems.filter((item) => {
      const isKit = item.product_type === 'kit' || 'items' in item;
      const isTea = !isKit && (item as Product).product_type === 'tea';
      const isSeed = !isKit && !isTea;

      // Category filter
      if (selectedCategory === 'seeds' && !isSeed) return false;
      if (selectedCategory === 'teas' && !isTea) return false;
      if (selectedCategory === 'kits' && !isKit) return false;

      // Cycle phase filter
      const phase = (item as any).phase || (
        item.slug === 'pumpkin-seeds' || item.slug === 'flax-seeds' || item.slug === 'golden-flaxseed' || item.slug === 'follicular-blend'
          ? 'follicular'
          : item.slug === 'sunflower-seeds' || item.slug === 'sesame-seeds' || item.slug === 'white-sesame' || item.slug === 'luteal-blend'
          ? 'luteal'
          : null
      );
      if (selectedPhase === 'follicular' && phase !== 'follicular') return false;
      if (selectedPhase === 'luteal' && phase !== 'luteal') return false;

      // Stock filter
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

    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price_minor - b.price_minor);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price_minor - a.price_minor);
    }

    return result;
  }, [initialItems, selectedCategory, selectedPhase, inStockOnly, selectedPriceBracket, sortOption]);

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedPhase !== 'all' ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (selectedPriceBracket !== 'all' ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedPhase('all');
    setInStockOnly(false);
    setSelectedPriceBracket('all');
  };

  return (
    <div className="w-full">
      {/* BreadcrumbList JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://seedly.pk',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Shop',
                item: 'https://seedly.pk/shop',
              },
            ],
          }),
        }}
      />

      {/* 1. BREADCRUMBS: Home > Shop */}
      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-neutral-400">
          <li>
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3 w-3 text-neutral-300" />
          </li>
          <li className="font-semibold text-neutral-900">Shop</li>
        </ol>
      </nav>

      {/* 2. H1 + ONE-LINE INTRO (Reduced vertical padding) */}
      <div className="mb-5">
        <h1 className="font-heading font-medium text-2xl sm:text-3xl text-neutral-900 uppercase tracking-[0.02em]">
          The Pantry
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-stone-500 font-normal">
          Clean raw pantry seeds, monthly routine kits, and high-altitude teas, packed fresh in Lahore.
        </p>
      </div>

      {/* 3. TOOLBAR: Left FILTER button (opens left-side panel) + Category Quick Chips + Right Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-b border-gray-200 py-3 mb-6">
        
        {/* Left Side: Filter Trigger & Quick Category Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Professional Filter Button */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/90 bg-white px-3.5 py-1 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 hover:border-gray-400 transition-all cursor-pointer shadow-xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-700" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Quick Category Chips */}
          {[
            { id: 'all', label: 'All' },
            { id: 'seeds', label: 'Seeds' },
            { id: 'teas', label: 'Teas' },
            { id: 'kits', label: 'Kits' },
          ].map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-black'
                }`}
              >
                {cat.label}
              </button>
            );
          })}

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-medium text-stone-400 hover:text-stone-800 underline uppercase tracking-wider flex items-center gap-1 ml-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}

          <span className="text-xs text-stone-400 ml-2 hidden lg:inline">
            ({filteredItems.length} {filteredItems.length === 1 ? 'product' : 'products'})
          </span>
        </div>

        {/* Right Side: Sort Dropdown */}
        <div className="relative">
          <label htmlFor="shop-sort" className="sr-only">Sort products</label>
          <select
            id="shop-sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="appearance-none bg-transparent py-1 pl-2 pr-6 text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:text-black focus:outline-none cursor-pointer"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Sort: Price: Low to High</option>
            <option value="price-desc">Sort: Price: High to Low</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-600" />
        </div>

      </div>

      {/* 4. PRODUCT GRID (4-column on desktop, 2-column on mobile) */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-gray-200 rounded-xl">
          <p className="font-heading font-medium text-base text-neutral-900 uppercase tracking-wide">
            No products match your selected filters
          </p>
          <p className="mt-2 text-xs text-stone-500 max-w-sm mx-auto">
            Try resetting your price or phase filters to view available pantry essentials.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-black transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear all filters
          </button>
        </div>
      ) : (
        <div
          className={
            filteredItems.length === 1
              ? 'grid grid-cols-1 max-w-sm sm:max-w-md'
              : filteredItems.length === 2
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full'
              : filteredItems.length === 3
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 w-full'
              : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full'
          }
        >
          {filteredItems.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      )}

      {/* 5. COMPLETE CYCLE KIT UPSELL BANNER */}
      <section className="mt-14 rounded-2xl border border-gray-200/90 bg-[#FBFBFA] p-6 sm:p-8 lg:p-10 shadow-xs">
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-8 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-stone-200/70 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-800">
              <span>✦ All-In-One Routine</span>
            </div>
            <h2 className="font-heading font-medium text-xl sm:text-2xl text-neutral-900 leading-snug">
              Looking for the complete seed routine?
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl font-normal">
              Traditionally paired with daily natural cycles: pumpkin and cold-milled flaxseed for the follicular phase (days 1–14), followed by sunflower kernels and white sesame seeds for the luteal phase (days 15–28). Our Complete Cycle Kit brings all four seeds together in partitioned pouches with a handcrafted wooden measuring scoop and a printed monthly routine guide.
            </p>
            <p className="text-[11px] text-stone-400 italic leading-relaxed pt-1">
              Dietary note: Raw seeds are agricultural pantry foods and gentle dietary additions, not medical treatments. While seed cycling is a popular holistic habit, clinical evidence is preliminary.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Four 250g Pouches · 1kg Total (~50–60 Servings)</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-heading font-bold text-2xl text-neutral-900 tabular-nums">Rs. 2,850</span>
              <span className="text-xs text-stone-400 line-through tabular-nums">Rs. 3,320</span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">Save Rs. 470</span>
            </div>
            <Link
              href="/kits/complete-cycle-kit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-black transition-colors shadow-sm w-full sm:w-auto"
            >
              <span>Explore Complete Kit</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. REFINED PROFESSIONAL LEFT-SIDE FILTER DRAWER */}
      {/* ======================================================== */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/35 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsFilterDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Left-Side Drawer Panel */}
          <aside
            aria-label="Product filters"
            className="fixed inset-y-0 left-0 flex max-w-full z-50"
          >
            <div className="w-screen max-w-sm sm:max-w-md bg-white shadow-2xl flex flex-col h-full border-r border-gray-200/80">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading font-medium text-base text-neutral-900 uppercase tracking-wide">
                      Filters
                    </h2>
                    {activeFilterCount > 0 && (
                      <span className="inline-flex h-5 px-1.5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Refine selection ({filteredItems.length} items available)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-50 transition-colors cursor-pointer"
                  aria-label="Close filter panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Active Filter Badges Bar */}
              {activeFilterCount > 0 && (
                <div className="px-6 py-2.5 bg-[#FAF9F7] border-b border-gray-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mr-1">
                    Active:
                  </span>
                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[11px] text-neutral-800 shadow-xs">
                      {selectedCategory}
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('all')}
                        className="hover:text-black text-neutral-400 cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedPhase !== 'all' && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[11px] text-neutral-800 capitalize shadow-xs">
                      {selectedPhase}
                      <button
                        type="button"
                        onClick={() => setSelectedPhase('all')}
                        className="hover:text-black text-neutral-400 cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedPriceBracket !== 'all' && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[11px] text-neutral-800 shadow-xs">
                      {selectedPriceBracket === 'under1000'
                        ? '< PKR 1,000'
                        : selectedPriceBracket === '1000to2000'
                        ? 'PKR 1k–2k'
                        : '> PKR 2,000'}
                      <button
                        type="button"
                        onClick={() => setSelectedPriceBracket('all')}
                        className="hover:text-black text-neutral-400 cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {inStockOnly && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[11px] text-neutral-800 shadow-xs">
                      In Stock
                      <button
                        type="button"
                        onClick={() => setInStockOnly(false)}
                        className="hover:text-black text-neutral-400 cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[10px] font-semibold text-neutral-500 hover:text-black underline uppercase tracking-wider ml-auto cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Drawer Content Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-xs">
                
                {/* Section 1: Category */}
                <div className="pb-5 border-b border-gray-100">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                    Category
                  </h3>
                  <div className="space-y-1">
                    {[
                      { id: 'all', label: 'All Products', count: initialItems.length },
                      { id: 'seeds', label: 'Raw Seeds', count: initialItems.filter((i) => !('items' in i) && (i as Product).product_type === 'seed').length },
                      { id: 'teas', label: 'Mountain Teas', count: initialItems.filter((i) => !('items' in i) && (i as Product).product_type === 'tea').length },
                      { id: 'kits', label: 'Seed Routine Kits', count: initialItems.filter((i) => 'items' in i || i.product_type === 'kit').length },
                    ].map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className="w-full flex items-center justify-between py-2 px-2.5 rounded-lg text-left transition-colors hover:bg-neutral-50 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'border-neutral-900 bg-neutral-900'
                                  : 'border-neutral-300 bg-white group-hover:border-neutral-400'
                              }`}
                            >
                              {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </div>
                            <span
                              className={`text-[13px] transition-colors ${
                                isSelected ? 'font-medium text-neutral-900' : 'text-neutral-600 group-hover:text-neutral-900'
                              }`}
                            >
                              {cat.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-400 tabular-nums">
                            {cat.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Cycle Phase */}
                <div className="pb-5 border-b border-gray-100">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                    Cycle Phase
                  </h3>
                  <div className="space-y-1">
                    {[
                      { id: 'all', label: 'All Phases', subtitle: 'Show all pantry foods' },
                      { id: 'follicular', label: 'Follicular Phase', subtitle: 'Days 1–14 · Pumpkin & Flax' },
                      { id: 'luteal', label: 'Luteal Phase', subtitle: 'Days 15–28 · Sunflower & Sesame' },
                    ].map((ph) => {
                      const isSelected = selectedPhase === ph.id;
                      return (
                        <button
                          key={ph.id}
                          type="button"
                          onClick={() => setSelectedPhase(ph.id as any)}
                          className="w-full flex items-center justify-between py-2 px-2.5 rounded-lg text-left transition-colors hover:bg-neutral-50 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'border-neutral-900 bg-neutral-900'
                                  : 'border-neutral-300 bg-white group-hover:border-neutral-400'
                              }`}
                            >
                              {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </div>
                            <div>
                              <p
                                className={`text-[13px] leading-snug transition-colors ${
                                  isSelected ? 'font-medium text-neutral-900' : 'text-neutral-600 group-hover:text-neutral-900'
                                }`}
                              >
                                {ph.label}
                              </p>
                              <p className="text-[11px] text-neutral-400 font-normal">
                                {ph.subtitle}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Price Range */}
                <div className="pb-5 border-b border-gray-100">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                    Price Range
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'all', label: 'All Prices' },
                      { id: 'under1000', label: 'Under PKR 1,000' },
                      { id: '1000to2000', label: 'PKR 1,000 – 2,000' },
                      { id: 'above2000', label: 'PKR 2,000+' },
                    ].map((bracket) => {
                      const isSelected = selectedPriceBracket === bracket.id;
                      return (
                        <button
                          key={bracket.id}
                          type="button"
                          onClick={() => setSelectedPriceBracket(bracket.id)}
                          className={`py-2 px-3 rounded-lg text-left border transition-all text-xs font-medium cursor-pointer ${
                            isSelected
                              ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                              : 'border-gray-200 bg-white text-neutral-700 hover:border-gray-300 hover:bg-neutral-50'
                          }`}
                        >
                          <span>{bracket.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 4: Availability */}
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                    Availability
                  </h3>
                  <div
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <span className="text-[13px] font-medium text-neutral-800">
                      In Stock Only
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={inStockOnly}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        inStockOnly ? 'bg-neutral-900' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          inStockOnly ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors underline underline-offset-4 px-2 py-2 cursor-pointer"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 py-3 px-5 rounded-full bg-neutral-900 text-xs font-semibold uppercase tracking-wider text-white hover:bg-black transition-all shadow-sm text-center cursor-pointer"
                >
                  Show {filteredItems.length} {filteredItems.length === 1 ? 'Product' : 'Products'}
                </button>
              </div>

            </div>
          </aside>
        </div>
      )}

    </div>
  );
}

export default ShopCatalogClient;
