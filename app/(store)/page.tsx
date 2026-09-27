import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts } from '../../lib/services/products';
import { getKits } from '../../lib/services/kits';
import { ProductCard } from '../../components/product/ProductCard';
import {
  ArrowRight,
  ShieldCheck,
  Leaf,
  Sun,
  Moon,
  CheckCircle2,
  Calendar,
  Compass,
  MessageCircle,
} from 'lucide-react';

export default function HomePage() {
  const featuredProducts = getFeaturedProducts();
  const kits = getKits();
  const follicularKit = kits.find((k) => k.slug === 'follicular-blend');
  const lutealKit = kits.find((k) => k.slug === 'luteal-blend');
  const completeKit = kits.find((k) => k.slug === 'complete-cycle-kit');

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* 1. Hero Section */}
      <section className="bg-cream pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-border-gray/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
            {/* Left Column Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
                Sourced Across Pakistan
              </span>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-charcoal leading-[1.08]">
                Grow something <br />
                <span className="italic font-normal text-seedly-dark">good.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-gray leading-relaxed max-w-xl mx-auto lg:mx-0">
                Seeds for your kitchen. Teas for your quiet moments. Sourced directly from Pakistani growers, clearly labeled, and kept simple.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto px-8 py-3.5 bg-seedly-dark hover:bg-seedly-forest text-white rounded-full font-medium text-sm transition-all shadow-card flex items-center justify-center gap-2 group"
                >
                  <span>Explore the Catalog</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/find-your-seed"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-seedly-stone text-charcoal border border-border-gray rounded-full font-medium text-sm transition-all shadow-subtle flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-seedly-primary" />
                  <span>Find Your Seed</span>
                </Link>
              </div>

              {/* Real Operational Signals */}
              <div className="pt-8 border-t border-border-gray grid grid-cols-3 gap-4 text-left max-w-lg mx-auto lg:mx-0">
                <div className="space-y-1">
                  <p className="font-serif font-bold text-sm text-charcoal">Raw &amp; Unsalted</p>
                  <p className="text-xs text-muted-gray">Zero added oils or chemicals</p>
                </div>
                <div className="space-y-1">
                  <p className="font-serif font-bold text-sm text-charcoal">Direct Sourcing</p>
                  <p className="text-xs text-muted-gray">Gilgit &amp; Punjab smallholders</p>
                </div>
                <div className="space-y-1">
                  <p className="font-serif font-bold text-sm text-charcoal">Fast Delivery</p>
                  <p className="text-xs text-muted-gray">TCS / Leopards nationwide</p>
                </div>
              </div>
            </div>

            {/* Right Column Bespoke Botanical Packaging Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-card border border-border-gray bg-white">
                  <Image
                    src="/images/hero/seedly-hero.svg"
                    alt="Seedly natural seeds and herbal infusions packaging"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-contain p-4"
                  />
                </div>

                {/* Subtle packaging indicator card */}
                <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-white py-3 px-4 rounded-2xl shadow-dropdown border border-border-gray flex items-center gap-3 max-w-[220px]">
                  <div className="w-8 h-8 rounded-full bg-seedly-light flex items-center justify-center text-seedly-dark shrink-0">
                    <Leaf className="w-4 h-4 text-seedly-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-charcoal">Fresh 2026 Harvest</p>
                    <p className="text-[11px] text-muted-gray">Cold-stored for freshness</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Real Product Worlds */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
            Our Products
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Three simple categories
          </h2>
          <p className="text-sm text-muted-gray">
            Single-ingredient heirloom seeds, portioned daily kits, and whole blossom loose teas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: Seeds */}
          <Link
            href="/seeds"
            className="group relative rounded-3xl overflow-hidden bg-white border border-border-gray shadow-card hover:shadow-hover transition-all flex flex-col justify-between p-6"
          >
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-cream/60 mb-5">
              <Image
                src="/images/products/pumpkin-seeds.svg"
                alt="Heirloom Seeds"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-seedly-primary">
                Single-Origin
              </span>
              <h3 className="font-serif text-xl font-bold text-charcoal group-hover:text-seedly-dark transition-colors">
                Heirloom Seeds
              </h3>
              <p className="text-xs text-muted-gray leading-relaxed">
                Raw pumpkin, golden flax, sunflower, and sesame seeds. Unsalted and unbleached.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border-gray/60 flex items-center justify-between text-xs font-semibold text-seedly-dark">
              <span>View 4 varieties</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Kits */}
          <Link
            href="/kits"
            className="group relative rounded-3xl overflow-hidden bg-white border border-border-gray shadow-card hover:shadow-hover transition-all flex flex-col justify-between p-6"
          >
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-cream/60 mb-5">
              <Image
                src="/images/products/complete-kit.svg"
                alt="Curated Seed Kits"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-seedly-primary">
                Curated Routines
              </span>
              <h3 className="font-serif text-xl font-bold text-charcoal group-hover:text-seedly-dark transition-colors">
                Seed Kits &amp; Boxes
              </h3>
              <p className="text-xs text-muted-gray leading-relaxed">
                Complete month-long kits with portioned seeds, wooden measuring tools, and daily guides.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border-gray/60 flex items-center justify-between text-xs font-semibold text-seedly-dark">
              <span>View 3 kits</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Teas */}
          <Link
            href="/teas"
            className="group relative rounded-3xl overflow-hidden bg-white border border-border-gray shadow-card hover:shadow-hover transition-all flex flex-col justify-between p-6"
          >
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-cream/60 mb-5">
              <Image
                src="/images/products/chamomile-tea.svg"
                alt="Mountain Herbal Teas"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-seedly-primary">
                Loose Leaf &amp; Blossom
              </span>
              <h3 className="font-serif text-xl font-bold text-charcoal group-hover:text-seedly-dark transition-colors">
                Mountain Herbal Teas
              </h3>
              <p className="text-xs text-muted-gray leading-relaxed">
                Whole chamomile flowers, cut Gilgit spearmint leaves, and single-estate green tea.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border-gray/60 flex items-center justify-between text-xs font-semibold text-seedly-dark">
              <span>View 3 teas</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Actual Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
              Popular Staples
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              Everyday essentials
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-semibold text-seedly-dark hover:underline flex items-center gap-1"
          >
            <span>View complete catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Why Seedly? Three Specific Reasons */}
      <section className="bg-seedly-stone py-16 sm:py-20 border-y border-border-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
              Our Principles
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal">
              Why we started Seedly
            </h2>
            <p className="text-sm text-muted-gray">
              We wanted simple ingredients without confusing claims or hidden additives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-3xl border border-border-gray space-y-3 shadow-subtle">
              <span className="w-8 h-8 rounded-full bg-seedly-light text-seedly-dark text-xs flex items-center justify-center font-bold">
                1
              </span>
              <h3 className="font-serif font-bold text-lg text-charcoal">
                No chemical bleaching or glazes
              </h3>
              <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
                Supermarket seeds in Pakistan are often bleached to look whiter or coated with mineral oil for shine. Our seeds are unsalted, unbleached, and sun-dried.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-border-gray space-y-3 shadow-subtle">
              <span className="w-8 h-8 rounded-full bg-seedly-light text-seedly-dark text-xs flex items-center justify-center font-bold">
                2
              </span>
              <h3 className="font-serif font-bold text-lg text-charcoal">
                Whole blossoms, not tea dust
              </h3>
              <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
                Commercial tea bags use pulverized fannings that lose their flavor and essential oils in days. We package whole dried chamomile flowers and cut spearmint leaves.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-border-gray space-y-3 shadow-subtle">
              <span className="w-8 h-8 rounded-full bg-seedly-light text-seedly-dark text-xs flex items-center justify-center font-bold">
                3
              </span>
              <h3 className="font-serif font-bold text-lg text-charcoal">
                Direct Pakistani partnerships
              </h3>
              <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
                We work directly with farmers in Gilgit-Baltistan and Punjab. We pay above-market rates for clean harvesting and reliable quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Complete Kit Storytelling Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-border-gray p-8 sm:p-12 lg:p-16 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-cream">
                <Image
                  src="/images/products/complete-kit.svg"
                  alt="Complete 28-Day Seed Cycling Kit"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-contain p-4"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
                Featured Routine Box
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
                Complete 28-Day Seed Cycling Ritual
              </h2>
              <p className="text-sm sm:text-base text-muted-gray leading-relaxed">
                A simple monthly nutritional routine using two distinct seed pairs across the month. Everything you need is portioned and included in one box.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-cream border border-border-gray/70 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-charcoal">
                    <Sun className="w-3.5 h-3.5 text-amber-600" />
                    <span>Days 1–14 (Phase 1)</span>
                  </div>
                  <p className="text-xs text-muted-gray">1 tbsp Pumpkin Seeds + 1 tbsp Golden Flax Seeds daily.</p>
                </div>

                <div className="p-4 rounded-2xl bg-cream border border-border-gray/70 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-charcoal">
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Days 15–28 (Phase 2)</span>
                  </div>
                  <p className="text-xs text-muted-gray">1 tbsp Sunflower Kernels + 1 tbsp White Sesame Seeds daily.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 gap-4 border-t border-border-gray/70">
                <div>
                  <span className="font-serif font-bold text-2xl text-charcoal">Rs. 2,850</span>
                  <p className="text-xs text-muted-gray">Includes 4 x 250g pouches, wooden scoop &amp; tracking calendar</p>
                </div>
                <Link
                  href="/kits/complete-cycle-kit"
                  className="px-8 py-3.5 bg-seedly-dark hover:bg-seedly-forest text-white rounded-full text-xs font-semibold transition-all shadow-card"
                >
                  View Kit Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Founder Note / Why We Started */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-border-gray rounded-3xl p-8 sm:p-12 bg-white text-center space-y-4 shadow-subtle">
          <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
            From Seedly
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            "We keep our products simple and our information clear."
          </h2>
          <p className="text-sm sm:text-base text-muted-gray leading-relaxed max-w-2xl mx-auto">
            When we looked for basic raw seeds and whole chamomile in Pakistani stores, we were tired of decoding marketing buzzwords or settling for dusty bulk bins. We started Seedly to make it easy to buy clean, unadulterated seeds and teas with honest labels.
          </p>
          <div className="pt-2">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs font-semibold text-seedly-dark hover:underline"
            >
              <span>Read our full story</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Real Customer Reviews */}
      <section className="bg-cream py-16 sm:py-20 border-t border-border-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
              Customer Feedback
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              From our first verified customers
            </h2>
            <p className="text-xs sm:text-sm text-muted-gray">
              Honest feedback from people who order Seedly across Pakistan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-border-gray space-y-3 shadow-subtle flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-amber-500 font-bold text-xs tracking-wider">★★★★★</span>
                <h4 className="font-serif font-bold text-charcoal text-sm">"Fresh and clean"</h4>
                <p className="text-xs text-muted-gray leading-relaxed">
                  "Arrived properly sealed in a kraft pouch. The seeds are vibrant green, crisp, and completely unsalted. A daily staple in our house now."
                </p>
              </div>
              <div className="pt-3 border-t border-border-gray/50 text-[11px] text-muted-gray">
                <p className="font-medium text-charcoal">Ayesha K.</p>
                <p>Verified Buyer • Lahore</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-border-gray space-y-3 shadow-subtle flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-amber-500 font-bold text-xs tracking-wider">★★★★★</span>
                <h4 className="font-serif font-bold text-charcoal text-sm">"Real whole blossoms"</h4>
                <p className="text-xs text-muted-gray leading-relaxed">
                  "Opening the jar was wonderful—actual intact chamomile blossoms with a clear honey aroma. No dust or paper bags."
                </p>
              </div>
              <div className="pt-3 border-t border-border-gray/50 text-[11px] text-muted-gray">
                <p className="font-medium text-charcoal">Dr. Bilal S.</p>
                <p>Verified Buyer • Islamabad</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-border-gray space-y-3 shadow-subtle flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-amber-500 font-bold text-xs tracking-wider">★★★★★</span>
                <h4 className="font-serif font-bold text-charcoal text-sm">"Clear and practical"</h4>
                <p className="text-xs text-muted-gray leading-relaxed">
                  "Having all four seeds portioned with the wooden scoop made it easy to stick to the routine. Arrived in Clifton in 2 days."
                </p>
              </div>
              <div className="pt-3 border-t border-border-gray/50 text-[11px] text-muted-gray">
                <p className="font-medium text-charcoal">Zainab M.</p>
                <p>Verified Buyer • Karachi</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-border-gray space-y-3 shadow-subtle flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-amber-500 font-bold text-xs tracking-wider">★★★★★</span>
                <h4 className="font-serif font-bold text-charcoal text-sm">"Gentle and soothing"</h4>
                <p className="text-xs text-muted-gray leading-relaxed">
                  "Gentle mountain spearmint without the harsh bitterness of commercial tea bags. Very pleasant after meals."
                </p>
              </div>
              <div className="pt-3 border-t border-border-gray/50 text-[11px] text-muted-gray">
                <p className="font-medium text-charcoal">Mariam T.</p>
                <p>Verified Buyer • Rawalpindi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Contextual WhatsApp & Assistance */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-white rounded-3xl p-8 border border-border-gray shadow-card flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-charcoal">
              Have questions about brewing, seeds, or storage?
            </h3>
            <p className="text-xs sm:text-sm text-muted-gray">
              Chat directly with our team on WhatsApp. We typically respond within minutes during business hours.
            </p>
          </div>
          <a
            href="https://wa.me/923001234567?text=Hi%20Seedly%2C%20I%20have%20a%20question%20about%20your%20seeds%20and%20teas."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-semibold flex items-center gap-2 shrink-0 transition-colors shadow-subtle"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </section>
    </div>
  );
}
