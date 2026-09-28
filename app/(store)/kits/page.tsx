import React from 'react';
import { getKits } from '../../../lib/services/kits';
import { ProductCard } from '../../../components/product/ProductCard';
import { Sparkles, Calendar, PackageCheck, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seed Cycling Ritual Kits | Seedly Pakistan',
  description:
    'Full 250g resealable seed pouches with handcrafted wooden measuring scoop and printed calendar. Wholesome monthly food routines for follicular and luteal phases.',
};

export default function KitsPage() {
  const kits = getKits();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Category Hero */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-seedly-light text-seedly-dark text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-seedly-primary" />
          <span>Curated Routine Boxes</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          Seed Cycling Ritual Kits
        </h1>
        <p className="text-sm text-muted-gray leading-relaxed">
          Full 250g resealable pouches with a handcrafted wooden measuring scoop and tracking calendar. Wholesome daily food nutrition designed to accompany your natural 28-day rhythm.
        </p>
      </div>

      {/* Guide Banner */}
      <div className="mb-12 bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-seedly-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="font-serif font-bold text-sm text-charcoal">Phase 1: Follicular (Days 1–14)</h4>
            <p className="text-xs text-muted-gray mt-1 leading-relaxed">
              Raw Pumpkin + Cold-Milled Flax seeds supply dietary zinc, omega-3 ALA, and gentle plant lignans.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-seedly-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="font-serif font-bold text-sm text-charcoal">Phase 2: Luteal (Days 15–28)</h4>
            <p className="text-xs text-muted-gray mt-1 leading-relaxed">
              Raw Sunflower + Unhulled Sesame seeds supply natural Vitamin E, dietary selenium, and plant calcium.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <PackageCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-serif font-bold text-sm text-charcoal">Full 250g Pouches &amp; Wooden Scoop</h4>
            <p className="text-xs text-muted-gray mt-1 leading-relaxed">
              Not single-use sachets. Every kit includes full barrier pouches, an engraved wooden scoop, and a printed guide.
            </p>
          </div>
        </div>
      </div>

      {/* Value Comparison Strip */}
      <div className="mb-8 p-4 bg-cream/70 rounded-2xl border border-border-gray/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-charcoal">
          <ShieldCheck className="w-4 h-4 text-seedly-primary shrink-0" />
          <span>
            <strong>Honest Bundle Value:</strong> Follicular (Rs. 1,550) + Luteal (Rs. 1,450) = Rs. 3,000. Complete Kit is <strong>Rs. 2,850</strong> (Save Rs. 150 + Free Nationwide Delivery).
          </span>
        </div>
        <span className="text-[11px] text-muted-gray">
          Delivery: Rs. 200 (Free over Rs. 2,500)
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {kits.map((kit) => (
          <ProductCard key={kit.id} product={kit as any} />
        ))}
      </div>
    </div>
  );
}
