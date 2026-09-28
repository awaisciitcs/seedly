import React from 'react';
import Link from 'next/link';
import { Leaf, ShieldCheck, ArrowRight, CheckCircle2, MapPin, Scale, HeartHandshake, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Why We Started Seedly — Sourcing & Freshness Truths',
  description:
    'Sourcing edible heirloom seeds and alpine teas directly from smallholder farms in Punjab and Gilgit-Baltistan. Honest weights, cold-storage, and zero chemical treatments.',
};

const SOURCING_DATA = [
  {
    ingredient: 'Raw Pumpkin Pepitas',
    origin: 'Sahiwal, Punjab',
    partner: 'Local grower cooperative',
    process: 'Triple-cleaned, sun-dried, raw & unsalted',
    packaging: '250g barrier kraft pouch',
  },
  {
    ingredient: 'Golden Flax Seeds',
    origin: 'Bahawalpur, Punjab',
    partner: 'Smallholder collective',
    process: 'Slow cold-milled weekly in small batches',
    packaging: '250g barrier kraft pouch',
  },
  {
    ingredient: 'Raw Sunflower Kernels',
    origin: 'Multan, Punjab',
    partner: 'Sun-drenched plains harvest',
    process: 'Mechanical clean-shelled, unroasted',
    packaging: '250g barrier kraft pouch',
  },
  {
    ingredient: 'Natural White Sesame',
    origin: 'Sargodha, Punjab',
    partner: 'Riverine agricultural smallholders',
    process: 'Unhulled, unbleached, triple-washed',
    packaging: '250g barrier kraft pouch',
  },
  {
    ingredient: 'Whole Flower Chamomile',
    origin: 'Gilgit-Baltistan',
    partner: 'Alpine high-valley foragers',
    process: 'Hand-picked intact blossoms, shade-dried',
    packaging: '50g dark amber glass jar',
  },
  {
    ingredient: 'Mountain Spearmint Leaf',
    origin: 'Hunza & Gilgit Valleys',
    partner: 'Terrace garden cooperatives',
    process: 'Cut whole leaf, alpine solar-dried',
    packaging: '50g resealable barrier pouch',
  },
  {
    ingredient: 'Highland Green Tea',
    origin: 'Mansehra Foothills, KP',
    partner: 'Single-estate small tea growers',
    process: 'Hand-plucked whole leaves, pan-fired',
    packaging: '75g resealable barrier pouch',
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* 1. Header & Founder Story */}
      <div className="space-y-6 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-seedly-light text-seedly-dark text-xs font-semibold uppercase tracking-wider">
          <HeartHandshake className="w-3.5 h-3.5 text-seedly-primary" />
          <span>Our Origin &amp; Purpose</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal leading-tight">
          Why we started Seedly
        </h1>
        <p className="text-base sm:text-lg text-muted-gray leading-relaxed">
          I started buying seeds from the Akbari Mandi in Lahore because standard grocery store packets were stale, over-processed, or sitting in unsealed bins where ambient heat destroyed their natural oils. Seedly was founded to bring that same unadulterated harvest directly to homes across Pakistan.
        </p>
      </div>

      {/* 2. Founder Note Card */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-border-gray shadow-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-seedly-light flex items-center justify-center text-seedly-dark font-serif font-bold text-lg">
            S
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-charcoal">From the Founders</h3>
            <p className="text-xs text-muted-gray">Lahore, Pakistan · Established 2026</p>
          </div>
        </div>
        <p className="text-sm text-charcoal leading-relaxed">
          "We aren't a venture-backed tech corporation or a dropshipper. We are a small, dedicated team in Lahore working with smallholder farmers in Punjab and foragers in Gilgit-Baltistan. Our pledge is simple: provide honest, edible seeds and mountain teas that are raw, clearly labeled, and stored in proper oxygen-barrier containers so they stay as fresh as the day they were packed."
        </p>
      </div>

      {/* 3. Sourcing Truths Table */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-seedly-primary">
            <MapPin className="w-4 h-4" />
            <span>Transparent Supply Chain</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            Where each ingredient comes from
          </h2>
          <p className="text-sm text-muted-gray leading-relaxed">
            We don't buy anonymous bulk imports. We source deliberately from specific harvest regions across Pakistan known for optimal soil and drying conditions.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-border-gray shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-cream/70 border-b border-border-gray text-charcoal font-serif font-bold">
                <tr>
                  <th className="p-4 sm:p-5">Ingredient</th>
                  <th className="p-4 sm:p-5">Harvest Region</th>
                  <th className="p-4 sm:p-5">Preparation</th>
                  <th className="p-4 sm:p-5">Packaging</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-gray/50 text-charcoal">
                {SOURCING_DATA.map((row) => (
                  <tr key={row.ingredient} className="hover:bg-cream/30 transition-colors">
                    <td className="p-4 sm:p-5 font-semibold text-charcoal whitespace-nowrap">
                      {row.ingredient}
                    </td>
                    <td className="p-4 sm:p-5 text-muted-gray">
                      <span className="font-medium text-charcoal block">{row.origin}</span>
                      <span className="text-[11px] text-muted-gray">{row.partner}</span>
                    </td>
                    <td className="p-4 sm:p-5 text-muted-gray">{row.process}</td>
                    <td className="p-4 sm:p-5 text-muted-gray whitespace-nowrap">{row.packaging}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Freshness Testing Standards */}
      <div className="bg-cream/60 rounded-3xl p-6 sm:p-8 border border-border-gray space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Our Testing Standards</span>
        </div>
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
          How we inspect every harvest batch
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-charcoal pt-2">
          <div className="bg-white p-4 rounded-2xl border border-border-gray/70 space-y-1.5 shadow-subtle">
            <p className="font-bold text-sm">Moisture Testing</p>
            <p className="text-muted-gray leading-relaxed">
              Every batch of seeds is tested to ensure moisture is below 8%, preventing mould growth and premature oil rancidity.
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-border-gray/70 space-y-1.5 shadow-subtle">
            <p className="font-bold text-sm">Triple-Cleaned Guarantee</p>
            <p className="text-muted-gray leading-relaxed">
              Mechanically screened and sorted to remove chaff, grit, and broken seed fragments before packaging.
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-border-gray/70 space-y-1.5 shadow-subtle">
            <p className="font-bold text-sm">Zero Chemical Bleaching</p>
            <p className="text-muted-gray leading-relaxed">
              No artificial color glazes, sulfur treatments, chemical whitening, or added sodium and preservatives.
            </p>
          </div>
        </div>
      </div>

      {/* 5. What We Promise vs What We Don't Claim */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="p-6 rounded-3xl bg-white border border-border-gray space-y-3 shadow-subtle">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>What We Promise</span>
          </div>
          <ul className="text-xs sm:text-sm text-muted-gray space-y-2.5">
            <li>• 100% single ingredients with zero added fillers</li>
            <li>• No artificial glazes, no chemical bleaching, no added oils or salt</li>
            <li>• Accurate, honest net weights and transparent harvest regions</li>
            <li>• Handcrafted wooden measuring scoops in our routine kits</li>
            <li>• Direct customer support on WhatsApp from Lahore (+92 304 1117333)</li>
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-border-gray space-y-3 shadow-subtle">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal">
            <ShieldCheck className="w-4 h-4 text-seedly-primary" />
            <span>What We Don't Claim</span>
          </div>
          <ul className="text-xs sm:text-sm text-muted-gray space-y-2.5">
            <li>• We do not promise overnight medical cures or clinical therapies</li>
            <li>• We don't invent pseudo-scientific buzzwords or inflated claims</li>
            <li>• We don't hide where our seeds and teas are grown</li>
            <li>• We don't use fake countdown timers or fabricated reviews</li>
            <li>• We don't sell pulverized tea dust in bleached plastic tea bags</li>
          </ul>
        </div>
      </div>

      {/* 6. CTA Section */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-border-gray text-center space-y-4 shadow-subtle">
        <h3 className="font-serif text-2xl font-bold text-charcoal">
          Good ingredients. Simple rituals.
        </h3>
        <p className="text-xs sm:text-sm text-muted-gray max-w-md mx-auto">
          Explore our raw heirloom seeds, cycle kits, and whole blossom teas. Dispatched directly from Lahore across Pakistan via TCS &amp; Leopards.
        </p>
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-seedly-dark hover:bg-seedly-forest text-white rounded-full font-semibold text-xs transition-all shadow-card"
          >
            <span>Explore the Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
