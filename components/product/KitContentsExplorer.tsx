'use client';
import { useSiteContent } from '@/components/storefront/SiteContentProvider';
import { ManagedSection } from '@/components/storefront/ManagedSections';
import type { CmsPageContent, SiteContent, ProductContent } from '@/lib/cms/storefront-types';

import React, { useId, useState } from 'react';
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





export function KitContentsExplorer({ items }: KitContentsExplorerProps) {
  const cms = useSiteContent<ProductContent>('product'); const { copy, links, images } = cms;
const getMetadata=(name:string)=>cms.pouchGuides.find(guide=>name.toLowerCase().includes(guide.id.split('-')[0]));

  const instanceId = useId();
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const currentItem = items[selectedIndex] || items[0];
  const meta = getMetadata(currentItem.product_name); if (!meta) return null;

  return (
    <ManagedSection document="product" sectionId="kitcontentsexplorer_section_01"><section aria-labelledby="kit-contents-heading" className="border-y border-gray-100 py-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <h2 id="kit-contents-heading" className="font-heading font-medium text-xl sm:text-2xl text-neutral-900">
          {copy.text_what_s_inside_this_kit}</h2>
        <span className="text-xs text-stone-500 font-normal">
          {copy.text_click_any_pouch_to_explore_routine_phase_ingredients}</span>
      </div>

      {/* Pouch Selector Tabs */}
      <div
        role="tablist"
        aria-label="Kit pouches"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3"
      >
        {items.map((item, idx) => {
          const isSelected = selectedIndex === idx;
          const itemMeta = getMetadata(item.product_name); if(!itemMeta) return null;

          return (
            <button
              key={item.id}
              role="tab"
              id={`pouch-tab-${instanceId}-${idx}`}
              aria-selected={isSelected}
              aria-controls={`pouch-panel-${instanceId}-${idx}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelectedIndex(idx)}
              onKeyDown={event => { const next = event.key === "ArrowRight" ? (idx+1)%items.length : event.key === "ArrowLeft" ? (idx-1+items.length)%items.length : event.key === "Home" ? 0 : event.key === "End" ? items.length-1 : -1; if(next>=0){event.preventDefault();setSelectedIndex(next);const buttons=event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button");buttons?.[next]?.focus();} }}
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
                    {item.quantity}{copy.text_times}{item.variant_name || '250g'}
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
        id={`pouch-panel-${instanceId}-${selectedIndex}`}
        aria-labelledby={`pouch-tab-${instanceId}-${selectedIndex}`}
        tabIndex={0}
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
              {copy.text_pack_size_2}<strong className="font-semibold text-neutral-900">{currentItem.variant_name || '250g hermetic sealed pouch'}</strong> {copy.text_quantity}{currentItem.quantity})
            </p>
          </div>

          <Link
            href={`/seeds/${meta.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 hover:underline underline-offset-4 shrink-0"
          >
            <span>{copy.text_view_single_pouch}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Daily intake advice */}
          <div className="space-y-1.5 bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              <HeartPulse className="w-3.5 h-3.5 text-neutral-700" />
              <span>{copy.text_kitchen_serving_suggestion}</span>
            </div>
            <p className="text-xs leading-relaxed text-stone-600 font-normal">
              {meta.intakeGuide}
            </p>
          </div>

          {/* Key Micronutrients */}
          <div className="space-y-1.5 bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
              <span>{copy.text_nutrients}</span>
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
    </section></ManagedSection>
  );
}

export default KitContentsExplorer;
