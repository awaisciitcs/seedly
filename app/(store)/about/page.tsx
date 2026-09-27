import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Leaf, ShieldCheck, HeartHandshake, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* 1. Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
          Our Story
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal leading-tight">
          Why we started Seedly
        </h1>
        <p className="text-base sm:text-lg text-muted-gray leading-relaxed">
          We wanted to create a place where people in Pakistan could buy simple seeds and herbal teas without having to decode confusing labels or exaggerated health claims.
        </p>
      </div>

      {/* 2. Visual Sourcing Banner */}
      <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-card border border-border-gray bg-white">
        <Image
          src="/images/hero/seedly-sourcing.svg"
          alt="Northern valleys sourcing partnerships in Pakistan"
          fill
          priority
          className="object-contain p-4"
        />
      </div>

      {/* 3. The Story: Plain & Specific */}
      <div className="space-y-10 text-charcoal leading-relaxed text-sm sm:text-base">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-charcoal">
            The problem with supermarket seeds and teas
          </h2>
          <p className="text-muted-gray">
            When we looked for basic raw seeds in Pakistan's grocery stores, we kept seeing the same issues: seeds stripped of their outer hulls, bleached to look uniformly bright, or sitting in unsealed bins where heat and light turned their delicate oils rancid.
          </p>
          <p className="text-muted-gray">
            Teas were equally compromised. Most commercial herbal tea bags contain pulverized tea dust and fannings, sealed in bleached paper pouches that offer little aroma and even less flavor.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-charcoal">
            What we sell
          </h2>
          <p className="text-muted-gray">
            We focus on a small, deliberate list of products:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-gray text-sm">
            <li>
              <strong className="text-charcoal font-semibold">Four raw heirloom seeds:</strong> Pumpkin seeds from Sahiwal, golden flax from Bahawalpur, sunflower kernels from Multan, and unhulled white sesame from Sargodha.
            </li>
            <li>
              <strong className="text-charcoal font-semibold">Three loose herbal teas:</strong> Hand-picked whole chamomile flowers from Gilgit, shade-dried spearmint leaves from northern valleys, and highland whole leaf green tea.
            </li>
            <li>
              <strong className="text-charcoal font-semibold">Curated seed routine boxes:</strong> Complete month-long seed cycling kits with engraved wooden measuring spoons and printed calendars.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-charcoal">
            How we source
          </h2>
          <p className="text-muted-gray">
            We don't buy anonymous bulk imports. We partner directly with smallholder growers and cooperatives in Punjab and Gilgit-Baltistan. We pay fair prices for clean harvesting and shade drying, and we test our seeds to ensure they remain raw, unsalted, and unroasted.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold text-charcoal">
            How we package
          </h2>
          <p className="text-muted-gray">
            Oxygen, light, and humidity destroy natural seed oils and delicate tea blossoms. We package our seeds in heavy, sealed barrier kraft pouches and our teas in dark amber glass jars. Every package includes a clear batch number, harvest region, and net weight.
          </p>
        </section>

        {/* 4. What We Believe / What We Don't Claim */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="p-6 rounded-3xl bg-cream border border-border-gray space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>What We Promise</span>
            </div>
            <ul className="text-xs sm:text-sm text-muted-gray space-y-2">
              <li>• 100% single ingredients with nothing added</li>
              <li>• Always raw, unbleached, and chemical-free</li>
              <li>• Accurate, honest weights and transparent origins</li>
              <li>• Direct customer support on WhatsApp</li>
            </ul>
          </div>

          <div className="p-6 rounded-3xl bg-cream border border-border-gray space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal">
              <ShieldCheck className="w-4 h-4 text-seedly-primary" />
              <span>What We Don't Claim</span>
            </div>
            <ul className="text-xs sm:text-sm text-muted-gray space-y-2">
              <li>• We do not promise overnight medical cures</li>
              <li>• We don't invent pseudo-scientific buzzwords</li>
              <li>• We don't hide where our ingredients come from</li>
              <li>• We don't use fake countdown timers or fabricated reviews</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 5. CTA Section */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-border-gray text-center space-y-4 shadow-subtle">
        <h3 className="font-serif text-2xl font-bold text-charcoal">
          Good ingredients. Simple rituals.
        </h3>
        <p className="text-xs sm:text-sm text-muted-gray max-w-md mx-auto">
          Explore our raw heirloom seeds, cycle kits, and whole blossom teas. Dispatched directly from Lahore across Pakistan.
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
