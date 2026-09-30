'use client';

import React, { useState } from 'react';
import { Coffee, Thermometer, Clock, Sparkles, Droplets, Info } from 'lucide-react';

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
  const [cups, setCups] = useState(1);

  const isGreenTea = slug.includes('green');
  const isChamomile = slug.includes('chamomile');
  const isSpearmint = slug.includes('spearmint');

  // Brewing parameters
  const gramsPerCup = 2.5;
  const leafGrams = (cups * gramsPerCup).toFixed(1).replace('.0', '');
  const teaspoons = cups === 1 ? '1 rounded tsp' : `${cups} rounded tsps`;
  const waterMl = cups * 250;

  const tempDisplay = waterTemp || (isGreenTea ? '80°C' : '90°C–95°C');
  const steepDisplay = steepTime || (isGreenTea ? '2–3 mins' : isChamomile ? '5–7 mins' : '4–5 mins');

  const tempTip = isGreenTea
    ? 'Boil fresh water, let it rest in the kettle for 2 minutes to cool to 80°C. Never pour boiling water over green tea to prevent bitterness.'
    : 'Pour rolling, freshly boiled water directly over the dried blossoms or leaves to extract full aromatic essential oils.';

  return (
    <div className="p-5 sm:p-6 bg-white rounded-2xl border border-border-gray shadow-subtle space-y-5 my-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-border-gray/60 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-seedly-dark bg-seedly-light px-2.5 py-0.5 rounded-full inline-block mb-1">
            Interactive Brew Guide
          </span>
          <h3 className="font-serif text-xl font-medium text-charcoal">
            How many cups are you preparing?
          </h3>
        </div>
        <p className="text-xs text-muted-gray">
          Adjust cups to calculate exact leaf weight &amp; water ratio
        </p>
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
              className={`flex-1 py-3 px-2 rounded-xl border text-center transition-all duration-200 ${
                isSelected
                  ? 'border-seedly-dark bg-seedly-dark text-white shadow-card font-semibold'
                  : 'border-border-gray bg-cream/40 text-charcoal hover:bg-cream hover:border-seedly-primary/50'
              }`}
            >
              <div className="text-sm font-bold">
                {count} {count === 1 ? 'Cup' : 'Cups'}
              </div>
              <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-muted-gray'}`}>
                {count * 250} ml
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {/* Leaf Amount */}
        <div className="p-3.5 bg-cream/50 rounded-xl border border-border-gray/70 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-gray font-medium">
            <Coffee className="w-3.5 h-3.5 text-seedly-primary" />
            <span>Loose Leaf / Flower</span>
          </div>
          <div className="text-base sm:text-lg font-serif font-bold text-charcoal">
            {leafGrams} g
          </div>
          <div className="text-[11px] text-muted-gray">
            approx. {teaspoons}
          </div>
        </div>

        {/* Water Volume */}
        <div className="p-3.5 bg-cream/50 rounded-xl border border-border-gray/70 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-gray font-medium">
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>Water Volume</span>
          </div>
          <div className="text-base sm:text-lg font-serif font-bold text-charcoal">
            {waterMl} ml
          </div>
          <div className="text-[11px] text-muted-gray">
            {cups === 4 ? '1 Litre Pot' : `${cups} standard teacup${cups > 1 ? 's' : ''}`}
          </div>
        </div>

        {/* Temperature */}
        <div className="p-3.5 bg-cream/50 rounded-xl border border-border-gray/70 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-gray font-medium">
            <Thermometer className="w-3.5 h-3.5 text-amber-700" />
            <span>Water Temp</span>
          </div>
          <div className="text-base sm:text-lg font-serif font-bold text-charcoal">
            {tempDisplay}
          </div>
          <div className="text-[11px] text-muted-gray truncate">
            {isGreenTea ? 'Off-boil cooling' : 'Freshly boiled'}
          </div>
        </div>

        {/* Steep Time */}
        <div className="p-3.5 bg-cream/50 rounded-xl border border-border-gray/70 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-gray font-medium">
            <Clock className="w-3.5 h-3.5 text-seedly-dark" />
            <span>Steep Time</span>
          </div>
          <div className="text-base sm:text-lg font-serif font-bold text-charcoal">
            {steepDisplay}
          </div>
          <div className="text-[11px] text-muted-gray">
            Cover while steeping
          </div>
        </div>
      </div>

      {/* Sommelier / Kitchen Advice */}
      <div className="p-3.5 bg-warm-white rounded-xl border border-border-gray/70 text-xs text-muted-gray leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-seedly-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-charcoal font-semibold">Brewmaster Note: </strong>
          {tempTip}
        </div>
      </div>
    </div>
  );
}
