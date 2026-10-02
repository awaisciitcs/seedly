'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '../../lib/types';
import { ProductCard } from './ProductCard';
import { ChevronRight, ChevronDown, ArrowRight, Truck, ShieldCheck, MessageCircle, RotateCcw } from 'lucide-react';

interface TeasCategoryClientProps {
  initialTeas: Product[];
}

export function TeasCategoryClient({ initialTeas }: TeasCategoryClientProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'herbal' | 'green'>('all');
  const [sortOption, setSortOption] = useState<string>('featured');

  const filteredTeas = useMemo(() => {
    let result = initialTeas.filter((item) => {
      const isGreen = item.slug.includes('green');
      if (activeFilter === 'green' && !isGreen) return false;
      if (activeFilter === 'herbal' && isGreen) return false;
      return true;
    });

    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price_minor - b.price_minor);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price_minor - a.price_minor);
    }

    return result;
  }, [initialTeas, activeFilter, sortOption]);

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
                name: 'Teas',
                item: 'https://seedly.pk/teas',
              },
            ],
          }),
        }}
      />

      {/* 1. BREADCRUMB: Home > Teas (matching top-nav label, dropping "The Pantry") */}
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
          <li className="font-semibold text-neutral-900">Teas</li>
        </ol>
      </nav>

      {/* 2. H1 + ONE-LINE INTRO (Reduced vertical padding) */}
      <div className="mb-5">
        <h1 className="font-heading font-medium text-2xl sm:text-3xl text-neutral-900 uppercase tracking-[0.02em]">
          Mountain Teas
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-stone-500 font-normal">
          Single-origin chamomile blossoms, wild mountain spearmint, and high-altitude green tea.
        </p>
      </div>

      {/* 3. TOOLBAR: Chips + Sort */}
      <div className="flex items-center justify-between border-t border-b border-gray-200 py-3 mb-6">
        {/* Tea Type Chips */}
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Teas' },
            { id: 'herbal', label: 'Caffeine-Free Herbal' },
            { id: 'green', label: 'Highland Green' },
          ].map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveFilter(chip.id as any)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-black'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
          <span className="text-xs text-stone-400 ml-2 hidden sm:inline">
            ({filteredTeas.length} {filteredTeas.length === 1 ? 'item' : 'items'})
          </span>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <label htmlFor="teas-sort" className="sr-only">Sort teas</label>
          <select
            id="teas-sort"
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

      {/* 4. PRODUCT GRID (Dynamically adjusts to complete width based on item count) */}
      {filteredTeas.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-gray-200 rounded-xl">
          <p className="font-heading font-medium text-base text-neutral-900 uppercase">
            No teas match this filter
          </p>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-black transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Show all teas
          </button>
        </div>
      ) : (
        <div
          className={
            filteredTeas.length === 1
              ? 'grid grid-cols-1 max-w-sm sm:max-w-md'
              : filteredTeas.length === 2
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full'
              : filteredTeas.length === 3
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 w-full'
              : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full'
          }
        >
          {filteredTeas.map((tea) => (
            <ProductCard key={tea.id} product={tea} />
          ))}
        </div>
      )}

      {/* 5. BREWING RITUAL BANNER */}
      <section className="mt-12 rounded-2xl border border-gray-200/90 bg-[#FBFBFA] p-6 sm:p-8 lg:p-10 shadow-xs">
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-8 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-stone-200/70 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-800">
              <span>✦ Whole Harvest Botanical</span>
            </div>
            <h2 className="font-heading font-medium text-xl sm:text-2xl text-neutral-900 leading-snug">
              Brew whole blossoms, never dust.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl font-normal">
              Commercial tea bags crush broken fannings and dust. Seedly sources whole, intact mountain chamomile flower heads and broad spearmint leaves from northern valleys. Steep in 90°C water for 4–5 minutes for sweet, natural golden infusions with zero bitterness.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-black transition-colors shadow-sm w-full sm:w-auto"
            >
              <span>Explore All Pantry Items</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TeasCategoryClient;
