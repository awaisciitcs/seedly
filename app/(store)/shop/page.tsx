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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 bg-paper">
      
      {/* CANVA SHOP ALL HERO: SPLIT TWO-TONE BANNER (LIME + BUTTER) */}
      <section className="rounded-[32px] border-2 border-ink shadow-brutal-lg overflow-hidden grid md:grid-cols-12 mb-10">
        
        {/* Left Section (~60%): Lime #C8EB5A */}
        <div className="md:col-span-7 bg-seed-lime border-b-2 md:border-b-0 md:border-r-2 border-ink p-6 sm:p-10 relative flex flex-col justify-between overflow-hidden">
          
          {/* Top Butter Circle Accent at boundary seam */}
          <div className="absolute top-4 -right-8 h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-ink bg-tea-butter shadow-brutal-sm pointer-events-none z-0" />

          <div className="relative z-10">
            <span className="rounded-full border-2 border-ink bg-white px-3.5 py-1 text-xs font-black uppercase tracking-wider text-ink shadow-brutal-sm inline-block mb-4">
              ✦ 100% Pure Agricultural Harvest
            </span>

            <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-[3.25rem] text-ink leading-[1.08] tracking-[-0.03em]">
              The Seedly Pantry.
            </h1>

            {/* Orange flourish accent */}
            <div className="mt-2 w-32 sm:w-44 h-2.5 rounded-full bg-kit-coral" />

            <p className="mt-4 text-xs sm:text-sm text-ink/90 font-bold max-w-md leading-relaxed">
              Clean raw seeds, mountain herbal teas, and simple routine kits. Freshly packaged in Lahore with zero additives.
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-xs font-extrabold text-ink">
              <span className="h-2.5 w-2.5 rounded-full bg-ink" />
              <span>Lahore Pantry Collection</span>
            </div>

            {/* Circular diagonal arrow badge */}
            <div className="h-11 w-11 rounded-full border-2 border-ink bg-white flex items-center justify-center shadow-brutal-sm">
              <ArrowUpRight className="h-5 w-5 text-ink stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Right Section (~40%): Butter #FFE27A */}
        <div className="md:col-span-5 bg-tea-butter p-6 sm:p-8 relative flex items-center justify-center overflow-hidden">
          
          {/* Overlapping Coral Accent Orb at bottom-left */}
          <div className="absolute -bottom-3 -left-3 h-16 w-16 rounded-full border-2 border-ink bg-kit-coral shadow-brutal-sm z-20 pointer-events-none" />

          {/* Inset Tilted Framing Card */}
          <div className="relative w-full rounded-[28px] border-2 border-ink bg-white/70 backdrop-blur-xs p-6 shadow-brutal flex flex-col justify-between min-h-[220px] transform md:rotate-[1.5deg]">
            <div>
              <div className="rounded-full border-2 border-ink bg-seed-lime px-3 py-1 text-[10px] font-black uppercase tracking-wider text-ink shadow-brutal-sm inline-block mb-3">
                ✦ Dispatched in 24 Hours
              </div>

              <h2 className="font-heading font-black text-xl sm:text-2xl text-ink leading-tight">
                Pantry Essentials for Daily Nourishment
              </h2>

              <p className="mt-2 text-xs text-muted-gray leading-relaxed font-medium">
                Shipped in resealable moisture-barrier pouches with lot dates and preparation guides.
              </p>
            </div>

            <div className="pt-4 border-t-2 border-ink/10 flex items-center justify-between text-xs font-bold text-ink">
              <span>Free Delivery Rs. 2,500+</span>
              <span className="text-[11px] font-black uppercase tracking-wider">COD Pakistan ✦</span>
            </div>
          </div>

        </div>

      </section>

      {/* INTERACTIVE CATALOG CLIENT (TABS, SIDEBAR FILTERS, SORT, GRID) */}
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
