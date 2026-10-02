'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { KitItem } from '../../lib/types';
import { Check, Sparkles, ArrowRight, HeartPulse } from 'lucide-react';

interface KitContentsExplorerProps {
  items: KitItem[];
  kitSlug: string;
}

interface ItemDetails {
  phase: string;
  timing: string;
  nutrients: string[];
  intakeGuide: string;
  slug: string;
  image: string;
}

const POUCH_METADATA: Record<string, ItemDetails> = {
  'pumpkin-seeds': {
    phase: 'Phase 1: Follicular Phase',
    timing: 'Days 1 to 14 of cycle',
    nutrients: ['High Bioavailable Zinc', 'Magnesium', 'Plant Phytosterols'],
    intakeGuide: '1 tablespoon daily, gently chewed or blended into warm porridge or fresh salads.',
    slug: 'pumpkin-seeds',
    image: '/images/products/pumpkin-seeds.jpg',
  },
  'flax-seeds': {
    phase: 'Phase 1: Follicular Phase',
    timing: 'Days 1 to 14 of cycle',
    nutrients: ['High Omega-3 (ALA)', 'Dietary Lignans', 'Prebiotic Fiber'],
    intakeGuide: '1 tablespoon daily, freshly milled or cracked for optimal nutrient absorption.',
    slug: 'flax-seeds',
    image: '/images/products/flax-seeds.jpg',
  },
  'sunflower-seeds': {
    phase: 'Phase 2: Luteal Phase',
    timing: 'Days 15 to 28 of cycle',
    nutrients: ['Vitamin E (Alpha-Tocopherol)', 'Selenium', 'B-Complex Vitamins'],
    intakeGuide: '1 tablespoon daily, sprinkled raw over yogurt, fruit bowls, or wholesome smoothies.',
    slug: 'sunflower-seeds',
    image: '/images/products/sunflower-seeds.jpg',
  },
  'sesame-seeds': {
    phase: 'Phase 2: Luteal Phase',
    timing: 'Days 15 to 28 of cycle',
    nutrients: ['High Dietary Calcium', 'Sesamin Lignans', 'Copper & Zinc'],
    intakeGuide: '1 tablespoon daily, unhulled or lightly crushed into breakfast bowls.',
    slug: 'sesame-seeds',
    image: '/images/products/sesame-seeds.jpg',
  },
};

function getMetadata(productName: string): ItemDetails {
  const lower = productName.toLowerCase();
  if (lower.includes('pumpkin')) return POUCH_METADATA['pumpkin-seeds'];
  if (lower.includes('flax')) return POUCH_METADATA['flax-seeds'];
  if (lower.includes('sunflower')) return POUCH_METADATA['sunflower-seeds'];
  if (lower.includes('sesame')) return POUCH_METADATA['sesame-seeds'];

  return {
    phase: 'Daily Wellness Routine',
    timing: 'Take consistently throughout cycle',
    nutrients: ['Whole Food Essential Fatty Acids', 'Natural Micronutrients'],
    intakeGuide: '1 to 2 tablespoons daily with wholesome meals.',
    slug: 'pumpkin-seeds',
    image: '/images/products/pumpkin-seeds.jpg',
  };
}

export function KitContentsExplorer({ items }: KitContentsExplorerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const currentItem = items[selectedIndex] || items[0];
  const meta = getMetadata(currentItem.product_name);

  return (
    <section aria-labelledby="kit-contents-heading" className="border-y border-gray-100 py-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <h2 id="kit-contents-heading" className="font-heading font-medium text-xl sm:text-2xl text-neutral-900">
          What&apos;s inside this kit?
        </h2>
        <span className="text-xs text-stone-500 font-normal">
          Click any pouch to explore routine phase &amp; ingredients
        </span>
      </div>

      {/* Pouch Selector Tabs */}
      <div
        role="tablist"
        aria-label="Kit pouches"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3"
      >
        {items.map((item, idx) => {
          const isSelected = selectedIndex === idx;
          const itemMeta = getMetadata(item.product_name);

          return (
            <button
              key={item.id}
              role="tab"
              id={`pouch-tab-${idx}`}
              aria-selected={isSelected}
              aria-controls={`pouch-panel-${idx}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelectedIndex(idx)}
              className={`group relative flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-gray-200/90 bg-white text-neutral-800 hover:border-neutral-400'
              }`}
            >
              <div className="flex items-center gap-2.5 w-full">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#FBFBFA] border border-gray-200/80">
                  <Image
                    src={itemMeta.image}
                    alt=""
                    aria-hidden="true"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold leading-tight">
                    {item.product_name}
                  </p>
                  <p className={`text-[11px] mt-0.5 font-normal ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                    {item.quantity}&times; {item.variant_name || '250g'}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-2.5 right-2.5 flex items-center justify-center text-emerald-400">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Pouch Detail Dossier */}
      <div
        role="tabpanel"
        id={`pouch-panel-${selectedIndex}`}
        aria-labelledby={`pouch-tab-${selectedIndex}`}
        className="rounded-2xl border border-gray-200/90 p-5 sm:p-6 bg-[#FBFBFA] shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-gray-200/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-800 bg-stone-200/80 px-2.5 py-0.5 rounded-full">
                {meta.phase}
              </span>
              <span className="text-xs text-stone-500 font-normal">
                {meta.timing}
              </span>
            </div>
            <h3 className="font-heading font-medium text-lg sm:text-xl text-neutral-900">
              {currentItem.product_name}
            </h3>
            <p className="text-xs text-stone-600 font-normal">
              Pack Size: <strong className="font-semibold text-neutral-900">{currentItem.variant_name || '250g hermetic sealed pouch'}</strong> (Quantity: {currentItem.quantity})
            </p>
          </div>

          <Link
            href={`/seeds/${meta.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 hover:underline underline-offset-4 shrink-0"
          >
            <span>View single pouch</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Daily intake advice */}
          <div className="space-y-1.5 bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              <HeartPulse className="w-3.5 h-3.5 text-neutral-700" />
              <span>Recommended Daily Intake</span>
            </div>
            <p className="text-xs leading-relaxed text-stone-600 font-normal">
              {meta.intakeGuide}
            </p>
          </div>

          {/* Key Micronutrients */}
          <div className="space-y-1.5 bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
              <span>Key Nutrients &amp; Action</span>
            </div>
            <ul className="space-y-1 text-xs text-stone-600 font-normal">
              {meta.nutrients.map((n, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-neutral-900 shrink-0" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default KitContentsExplorer;
