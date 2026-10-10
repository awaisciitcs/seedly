'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '../../lib/types';
import { ProductCard } from './ProductCard';
import { ChevronRight, ChevronDown, ArrowRight, Truck, ShieldCheck, MessageCircle, RotateCcw } from 'lucide-react';

interface SeedsCategoryClientProps {
  initialSeeds: Product[];
}

export function SeedsCategoryClient({ initialSeeds }: SeedsCategoryClientProps) {
  const [activePhase, setActivePhase] = useState<'all' | 'follicular' | 'luteal'>('all');
  const [sortOption, setSortOption] = useState<string>('featured');

  // Filter and sort items client-side
  const filteredSeeds = useMemo(() => {
    let result = initialSeeds.filter((item) => {
      const phase = item.phase || (
        item.slug === 'pumpkin-seeds' || item.slug === 'flax-seeds' || item.slug === 'golden-flaxseed'
          ? 'follicular'
          : item.slug === 'sunflower-seeds' || item.slug === 'sesame-seeds' || item.slug === 'white-sesame'
          ? 'luteal'
          : null
      );

      if (activePhase === 'follicular' && phase !== 'follicular') return false;
      if (activePhase === 'luteal' && phase !== 'luteal') return false;
      return true;
    });

    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price_minor - b.price_minor);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price_minor - a.price_minor);
    }

    return result;
  }, [initialSeeds, activePhase, sortOption]);

  const totalProducts = initialSeeds.length;

  return (
    <div className="w-full">
      {/* BreadcrumbList JSON-LD for Search Engines */}
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
                name: 'Seeds',
                item: 'https://seedly.pk/seeds',
              },
            ],
          }),
        }}
      />

      {/* 1. BREADCRUMB: Home > Seeds (matching top-nav label, dropping "The Pantry") */}
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
          <li className="font-semibold text-neutral-900">Seeds</li>
        </ol>
      </nav>

      {/* 2. H1 + ONE-LINE INTRO (Reduced vertical padding so grid starts higher) */}
      <div className="mb-5">
        <h1 className="font-heading font-medium text-2xl sm:text-3xl text-neutral-900 uppercase tracking-[0.02em]">
          Raw Seeds
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-stone-500 font-normal">
          Whole raw pantry seeds, hand-cleaned and freshly sealed in Lahore for your daily nourishing routine.
        </p>
      </div>

      {/* 3. TOOLBAR: Chips (All · Follicular · Luteal) + Sort */}
      <div className="flex items-center justify-between border-t border-b border-gray-200 py-3 mb-6">
        
        {/* Phase Chips: All · Follicular · Luteal */}
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'follicular', label: 'Follicular' },
            { id: 'luteal', label: 'Luteal' },
          ].map((chip) => {
            const isActive = activePhase === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActivePhase(chip.id as any)}
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
            ({filteredSeeds.length} {filteredSeeds.length === 1 ? 'item' : 'items'})
          </span>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <label htmlFor="seeds-sort" className="sr-only">Sort seeds</label>
          <select
            id="seeds-sort"
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
      {filteredSeeds.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-gray-200 rounded-xl">
          <p className="font-heading font-medium text-base text-neutral-900 uppercase">
            No seeds match this phase
          </p>
          <button
            type="button"
            onClick={() => setActivePhase('all')}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-black transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Show all seeds
          </button>
        </div>
      ) : (
        <div
          className={
            filteredSeeds.length === 1
              ? 'grid grid-cols-1 max-w-sm sm:max-w-md'
              : filteredSeeds.length === 2
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full'
              : filteredSeeds.length === 3
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 w-full'
              : 'grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full'
          }
        >
          {filteredSeeds.map((seed) => (
            <ProductCard key={seed.id} product={seed} />
          ))}
        </div>
      )}

      {/* 5. COMPLETE CYCLE KIT UPSELL BANNER UNDER THE GRID */}
      <section className="mt-12 rounded-2xl border border-gray-200/90 bg-[#FBFBFA] p-6 sm:p-8 lg:p-10 shadow-xs">
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-8 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-stone-200/70 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-800">
              <span>✦ All-In-One Routine</span>
            </div>
            <h2 className="font-heading font-medium text-xl sm:text-2xl text-neutral-900 leading-snug">
              Looking for the complete seed routine?
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl font-normal">
              Traditionally paired with daily natural cycles: pumpkin and cold-milled flaxseed for the follicular phase (days 1–14), followed by sunflower kernels and white sesame seeds for the luteal phase (days 15–28). Our Complete Cycle Kit brings all four seeds together in partitioned pouches with a handcrafted wooden measuring scoop and an easy printed guide.
            </p>
            <p className="text-[11px] text-stone-400 italic leading-relaxed pt-1">
              Dietary note: Raw pantry seeds are agricultural food staples and gentle daily additions, not medical treatments. While seed cycling is a popular holistic wellness habit, clinical evidence remains preliminary.
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

    </div>
  );
}

export default SeedsCategoryClient;
