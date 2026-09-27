import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Leaf, ShieldCheck, HeartHandshake, Sparkles, MapPin, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
          Our Philosophy
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal">
          Rooted in Nature. Made for Modern Life.
        </h1>
        <p className="text-base text-muted-gray leading-relaxed">
          Seedly is Pakistan's first premium botanical apothecary dedicated to single-origin heirloom seeds and high-elevation loose-leaf teas.
        </p>
      </div>

      {/* Main Image Banner */}
      <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-border-gray">
        <Image
          src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=1200"
          alt="High mountain botanical valleys of Pakistan"
          fill
          className="object-cover"
        />
      </div>

      {/* Story Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14 text-sm leading-relaxed text-charcoal">
        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-bold text-charcoal">
            The Problem with Modern Seeds
          </h2>
          <p>
            When we examined the seeds available in Pakistan's grocery stores and spice markets, we found a disappointing pattern: seeds stripped of their bran, bleached with chemicals to appear brighter, sitting on warm open-air shelves for months until their delicate essential oils went rancid.
          </p>
          <p>
            Teas were equally compromised—chopped into fine industrial dust, placed in bleached paper bags that leach billions of microplastic particles into boiling water.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-bold text-charcoal">
            The Seedly Standard
          </h2>
          <p>
            We set out to create an uncompromising alternative. We travel directly to the organic valleys of Gilgit-Baltistan, Hunza, and the fertile plains of Punjab to work alongside family farmers who respect the soil.
          </p>
          <p>
            Our seeds are 100% heirloom, raw, non-GMO, and unbleached. We mill our flax cold to protect delicate omega-3 fats, and we leave our chamomile and spearmint as whole blossoms and hand-cut leaves.
          </p>
        </div>
      </div>

      {/* Sourcing Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        <div className="bg-white p-6 rounded-2xl border border-border-gray shadow-card space-y-3">
          <div className="w-10 h-10 rounded-full bg-seedly-light flex items-center justify-center text-seedly-dark">
            <Leaf className="w-5 h-5 text-seedly-primary" />
          </div>
          <h3 className="font-serif font-bold text-lg text-charcoal">Zero Additives</h3>
          <p className="text-xs text-muted-gray leading-relaxed">
            No preservatives, no artificial aroma compounds, no artificial glazing. Exactly as harvested.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-gray shadow-card space-y-3">
          <div className="w-10 h-10 rounded-full bg-seedly-light flex items-center justify-center text-seedly-dark">
            <ShieldCheck className="w-5 h-5 text-seedly-primary" />
          </div>
          <h3 className="font-serif font-bold text-lg text-charcoal">UV Amber Glass</h3>
          <p className="text-xs text-muted-gray leading-relaxed">
            We package in dark amber glass jars and sealed oxygen-barrier pouches to protect active phytochemicals.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-gray shadow-card space-y-3">
          <div className="w-10 h-10 rounded-full bg-seedly-light flex items-center justify-center text-seedly-dark">
            <HeartHandshake className="w-5 h-5 text-seedly-primary" />
          </div>
          <h3 className="font-serif font-bold text-lg text-charcoal">Ethical Trade</h3>
          <p className="text-xs text-muted-gray leading-relaxed">
            Direct, above-market payments to Pakistani smallholders who practice regenerative mountain farming.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="p-8 rounded-3xl bg-cream border border-border-gray text-center space-y-4">
        <h3 className="font-serif text-2xl font-bold text-charcoal">Experience the Living Difference</h3>
        <p className="text-sm text-muted-gray max-w-md mx-auto">
          Explore our initial harvest of raw heirloom seeds, cycle kits, and loose-leaf herbal teas.
        </p>
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-seedly-dark hover:bg-seedly-forest text-white rounded-full font-semibold text-xs transition-all shadow-card"
          >
            <span>Explore Botanical Goods</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
