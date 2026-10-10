'use client';
import { useSiteContent } from '@/components/storefront/SiteContentProvider';
import type { CmsPageContent, SiteContent, ProductContent } from '@/lib/cms/storefront-types';

import React, { useState } from 'react';
import { Coffee, Thermometer, Clock, Droplets, Info } from 'lucide-react';

interface TeaBrewCalculatorProps {
  teaName: string;
  slug: string;
  steepTime?: string;
  waterTemp?: string;
  caffeineLevel?: string;
}

export function TeaBrewCalculator({
  teaName,
  slug,
  steepTime,
  waterTemp,
  caffeineLevel,
}: TeaBrewCalculatorProps) {
  const cms = useSiteContent<ProductContent>('product'); const { copy, links, images } = cms;

  const [cups, setCups] = useState(1);

  const isGreenTea = slug.includes('green');
  const isChamomile = slug.includes('chamomile');
  const isSpearmint = slug.includes('spearmint');

  // Brewing parameters
  const guide=cms.brewGuides.find(guide=>slug.includes(guide.id)); if(!guide)return null;
 const gramsPerCup = guide?.gramsPerCup ?? 0;
  const leafGrams = (cups * gramsPerCup).toFixed(1).replace('.0', '');
  const teaspoons = cups === 1 ? '1 rounded tsp' : `${cups} rounded tsps`;
  const waterMl = cups * (guide?.waterMlPerCup ?? 0);

  const tempDisplay = waterTemp || guide?.temp || '';
  const steepDisplay = steepTime || guide?.steep || '';

  const tempTip = guide?.tip || '';

  return (
    <div className="p-5 sm:p-6 bg-[#FBFBFA] rounded-2xl border border-gray-200/90 shadow-xs space-y-5 my-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-gray-200/80 pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-800 bg-stone-200/80 px-2.5 py-0.5 rounded-full inline-block mb-1">
            {copy.text_interactive_brew_guide}</span>
          <h3 className="font-heading font-medium text-lg sm:text-xl text-neutral-900">
            {copy.text_how_many_cups_are_you_preparing}</h3>
        </div>
        <p className="text-xs text-stone-500 font-normal">
          {copy.text_adjust_cups_to_calculate_exact_leaf_weight_water_ratio}</p>
      </div>

      {/* Cup Count Selector */}
      <div className="flex items-center gap-2 sm:gap-3" role="group" aria-label="Cup count selector">
        {[1, 2, 3, 4].map((count) => {
          const isSelected = cups === count;
          return (
            <button
              key={count}
              type="button"
              onClick={() => setCups(count)}
              aria-pressed={isSelected}
              className={`flex-1 py-3 px-2 rounded-xl border text-center transition-all duration-200 cursor-pointer shadow-xs ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-900 text-white font-semibold'
                  : 'border-gray-200 bg-white text-neutral-800 hover:border-neutral-400 font-medium'
              }`}
            >
              <div className="text-sm font-semibold">
                {count} {count === 1 ? 'Cup' : 'Cups'}
              </div>
              <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-stone-400'}`}>
                {count * 250} {copy.text_ml}</div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {/* Leaf Amount */}
        <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-normal">
            <Coffee className="w-3.5 h-3.5 text-neutral-700" />
            <span>{copy.text_loose_leaf_flower}</span>
          </div>
          <div className="text-base sm:text-lg font-heading font-semibold text-neutral-900">
            {leafGrams} {copy.text_g}</div>
          <div className="text-[11px] text-stone-400">
            {copy.text_approx}{teaspoons}
          </div>
        </div>

        {/* Water Volume */}
        <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-normal">
            <Droplets className="w-3.5 h-3.5 text-neutral-700" />
            <span>{copy.text_water_volume}</span>
          </div>
          <div className="text-base sm:text-lg font-heading font-semibold text-neutral-900">
            {waterMl} {copy.text_ml}</div>
          <div className="text-[11px] text-stone-400">
            {cups === 4 ? '1 Litre Pot' : `${cups} standard teacup${cups > 1 ? 's' : ''}`}
          </div>
        </div>

        {/* Temperature */}
        <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-normal">
            <Thermometer className="w-3.5 h-3.5 text-neutral-700" />
            <span>{copy.text_water_temp}</span>
          </div>
          <div className="text-base sm:text-lg font-heading font-semibold text-neutral-900">
            {tempDisplay}
          </div>
          <div className="text-[11px] text-stone-400 truncate">
            {isGreenTea ? 'Off-boil cooling' : 'Freshly boiled'}
          </div>
        </div>

        {/* Steep Time */}
        <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-normal">
            <Clock className="w-3.5 h-3.5 text-neutral-700" />
            <span>{copy.text_steep_time}</span>
          </div>
          <div className="text-base sm:text-lg font-heading font-semibold text-neutral-900">
            {steepDisplay}
          </div>
          <div className="text-[11px] text-stone-400">
            {copy.text_cover_while_steeping}</div>
        </div>
      </div>

      {/* Sommelier / Kitchen Advice */}
      <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 text-xs text-stone-600 leading-relaxed flex items-start gap-2.5 shadow-xs">
        <Info className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-neutral-900 font-semibold">{copy.text_brewmaster_note}</strong>
          {tempTip}
        </div>
      </div>
    </div>
  );
}

export default TeaBrewCalculator;
