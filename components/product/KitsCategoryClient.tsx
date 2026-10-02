'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Kit } from '../../lib/types';
import { ProductCard } from './ProductCard';
import { formatPKR } from '../../lib/utils';
import { ChevronRight, ChevronDown, ArrowRight, Truck, ShieldCheck, MessageCircle, RotateCcw } from 'lucide-react';

interface KitsCategoryClientProps {
  initialKits: Kit[];
}

export function KitsCategoryClient({ initialKits }: KitsCategoryClientProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pairings' | 'complete'>('all');
  const [sortOption, setSortOption] = useState<string>('featured');

  const filteredKits = useMemo(() => {
    let result = initialKits.filter((kit) => {
      const isComplete = kit.slug === 'complete-routine-kit' || kit.slug === 'complete-seed-kit' || kit.items.length >= 4;
      if (activeFilter === 'complete' && !isComplete) return false;
      if (activeFilter === 'pairings' && isComplete) return false;
      return true;
    });

    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price_minor - b.price_minor);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price_minor - a.price_minor);
    }

    return result;
  }, [initialKits, activeFilter, sortOption]);

  return (
    <div className="w-full space-y-12 sm:space-y-16">
      <div>
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
                  name: 'Kits',
                  item: 'https://seedly.pk/kits',
                },
              ],
            }),
          }}
        />

        {/* 1. BREADCRUMB: Home > Kits */}
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
            <li className="font-semibold text-neutral-900">Kits</li>
          </ol>
        </nav>

        {/* 2. H1 + ONE-LINE INTRO */}
        <div className="mb-5">
          <h1 className="font-heading font-medium text-2xl sm:text-3xl text-neutral-900 uppercase tracking-[0.02em]">
            Seed Kits
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-500 font-normal">
            Curated monthly pairings and complete four-seed boxes with measuring scoop and calendar guide.
          </p>
        </div>

        {/* 3. TOOLBAR: Chips + Sort */}
        <div className="flex items-center justify-between border-t border-b border-gray-200 py-3 mb-6">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'All Kits' },
              { id: 'pairings', label: '14-Day Phase Pairings' },
              { id: 'complete', label: 'Complete 28-Day Box' },
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
              ({filteredKits.length} {filteredKits.length === 1 ? 'kit' : 'kits'})
            </span>
          </div>

          <div className="relative">
            <label htmlFor="kits-sort" className="sr-only">Sort kits</label>
            <select
              id="kits-sort"
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

        {/* 4. PRODUCT GRID (3-column on desktop for kits) */}
        {filteredKits.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-gray-200 rounded-xl">
            <p className="font-heading font-medium text-base text-neutral-900 uppercase">
              No kits match this filter
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-black transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Show all kits
            </button>
          </div>
        ) : (
          <div
            className={
              filteredKits.length === 1
                ? 'grid grid-cols-1 max-w-sm sm:max-w-md'
                : filteredKits.length === 2
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full'
                : filteredKits.length === 3
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 w-full'
                : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full'
            }
          >
            {filteredKits.map((kit) => (
              <ProductCard key={kit.id} product={kit} />
            ))}
          </div>
        )}
      </div>

      {/* 5. SIDE-BY-SIDE KIT COMPARISON TABLE */}
      {initialKits.length > 0 && (
        <section className="border-t border-gray-200 pt-8 sm:pt-12">
          <div className="mb-6">
            <h2 className="font-heading font-medium text-xl sm:text-2xl text-neutral-900">What is in each kit?</h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">The ingredients, package sizes, and prices side by side.</p>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white">
            <table className="w-full min-w-[640px] text-left text-xs border-collapse">
              <caption className="sr-only">Compare seed kit ingredients, package contents and prices</caption>
              <thead>
                <tr className="border-b border-gray-200 bg-stone-50">
                  <th scope="col" className="py-3.5 px-5 w-40 font-semibold text-neutral-900">Routine Kit</th>
                  {initialKits.map((kit) => (
                    <th key={kit.id} scope="col" className="px-5 py-3.5 font-semibold text-neutral-900 align-top">{kit.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-stone-600">
                <tr>
                  <th scope="row" className="py-4 px-5 font-medium text-neutral-900 align-top">Seeds Included</th>
                  {initialKits.map((kit) => (
                    <td key={kit.id} className="px-5 py-4 leading-relaxed align-top">
                      <ul className="space-y-1">
                        {kit.items.map((item) => (
                          <li key={item.id} className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
                            <span>{item.product_name}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="py-4 px-5 font-medium text-neutral-900 align-top">In the Box</th>
                  {initialKits.map((kit) => (
                    <td key={kit.id} className="px-5 py-4 leading-relaxed align-top">{kit.package_size}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="py-4 px-5 font-medium text-neutral-900">Price</th>
                  {initialKits.map((kit) => (
                    <td key={kit.id} className="px-5 py-4 font-semibold text-neutral-900 tabular-nums">{formatPKR(kit.price_minor)}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="py-4 px-5 font-medium text-neutral-900"><span className="sr-only">Product link</span></th>
                  {initialKits.map((kit) => (
                    <td key={kit.id} className="px-5 py-4">
                      <Link href={`/kits/${kit.slug}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:underline underline-offset-4">
                        View details <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 6. SLIM TRUST STRIP */}
      <div className="border-t border-gray-200/90 pt-6 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-neutral-800 shrink-0" />
            <span className="font-medium text-neutral-900">Cash on Delivery</span>
            <span className="text-stone-400">· Nationwide across Pakistan</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-neutral-800 shrink-0" />
            <span className="font-medium text-neutral-900">JazzCash · EasyPaisa · Bank Transfer</span>
            <span className="text-stone-400">· Instant verified payment</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-neutral-800 shrink-0" />
            <span className="font-medium text-neutral-900">WhatsApp Help</span>
            <a
              href="https://wa.me/923719055758"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-neutral-900 underline hover:text-black"
            >
              0371 9055758
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KitsCategoryClient;
