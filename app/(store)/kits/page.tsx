import React from 'react';
import { getKits } from '../../../lib/services/kits';
import { ProductCard } from '../../../components/product/ProductCard';
import { Sparkles, Calendar, CheckCircle } from 'lucide-react';

export default function KitsPage() {
  const kits = getKits();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Category Hero */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-seedly-light text-seedly-dark text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-seedly-primary" />
          <span>Curated Wellness Blends</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          Seed Cycling Ritual Kits
        </h1>
        <p className="text-sm text-muted-gray leading-relaxed">
          Pre-measured, nutritionally synchronized pairs of heirloom seeds formulated to support your body's natural 28-day hormonal rhythm with ease and consistency.
        </p>
      </div>

      {/* Guide Banner */}
      <div className="mb-12 bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-seedly-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="font-serif font-bold text-sm text-charcoal">Phase 1: Follicular (Days 1–14)</h4>
            <p className="text-xs text-muted-gray mt-1">Pumpkin + Flax seeds supply zinc & lignans for healthy follicular maturation.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-seedly-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="font-serif font-bold text-sm text-charcoal">Phase 2: Luteal (Days 15–28)</h4>
            <p className="text-xs text-muted-gray mt-1">Sunflower + Sesame seeds supply Vitamin E & selenium for progesterone vitality.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-serif font-bold text-sm text-charcoal">Bottleneck Quality Promise</h4>
            <p className="text-xs text-muted-gray mt-1">Every kit is freshly packed on order from our strictly monitored raw seed batches.</p>
          </div>
        </div>
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
