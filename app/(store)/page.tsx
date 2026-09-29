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

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://seedly.pk/#organization',
        name: 'Seedly Pakistan',
        url: 'https://seedly.pk',
        logo: 'https://seedly.pk/logo/seedly-logo.jpg',
        description: "Pakistan's pure raw seeds & mountain teas.",
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+92-304-1117333',
          contactType: 'Customer Support',
          areaServed: 'PK',
          availableLanguage: ['English', 'Urdu'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://seedly.pk/#website',
        url: 'https://seedly.pk',
        name: 'Seedly Pakistan',
        publisher: {
          '@id': 'https://seedly.pk/#organization',
        },
      },
    ],
  };

  return (
    <div className="space-y-20 sm:space-y-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
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
                Raw Seeds &amp; <br />
                <span className="italic font-normal text-seedly-dark">Mountain Teas.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-gray leading-relaxed max-w-xl mx-auto lg:mx-0">
                Raw seeds and herbal teas for eating and brewing, packed fresh in Lahore from growers in Gilgit-Baltistan, KP and Punjab. Single-origin edible harvests, clearly labelled, and kept unadulterated.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/kits"
                  className="w-full sm:w-auto px-8 py-3.5 bg-seedly-dark hover:bg-seedly-forest text-white rounded-full font-medium text-sm transition-all shadow-card flex items-center justify-center gap-2 group"
                >
                  <span>Explore Cycle Kits</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/find-your-seed"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-seedly-stone text-charcoal border border-border-gray rounded-full font-medium text-sm transition-all shadow-subtle flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-seedly-primary" />
                  <span>Routine Finder</span>
                </Link>
              </div>

              {/* Real Operational Signals: Asymmetric 2 Features + 1 Live Stat */}
              <div className="pt-8 border-t border-border-gray grid grid-cols-1 sm:grid-cols-12 gap-5 text-left max-w-xl mx-auto lg:mx-0 items-center">
                <div className="sm:col-span-4 space-y-1">
                  <p className="font-bold text-sm text-charcoal">Raw &amp; Unsalted</p>
                  <p className="text-xs text-muted-gray leading-relaxed">No glazes, oils, or preservatives</p>
                </div>
                <div className="sm:col-span-4 space-y-1 sm:border-l sm:border-border-gray/60 sm:pl-4">
                  <p className="font-bold text-sm text-charcoal">Smallholder Sourced</p>
                  <p className="text-xs text-muted-gray leading-relaxed">Direct from Punjab &amp; Gilgit</p>
                </div>
                <div className="sm:col-span-4 bg-seedly-light/70 p-3.5 rounded-2xl border border-seedly-primary/20 flex flex-col justify-center">
                  <span className="font-serif font-bold text-2xl text-seedly-dark block leading-none">500+</span>
                  <span className="text-[11px] text-muted-gray font-medium mt-1">Orders shipped nationwide</span>
                </div>
              </div>
            </div>

            {/* Right Column Authentic Studio Product Photography */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-card border border-border-gray bg-stone">
                  <Image
                    src="/images/hero/seedly-hero.jpg"
                    alt="Seedly raw edible pumpkin and flax seeds alongside whole chamomile blossoms"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>

                {/* Subtle packaging indicator card */}
                <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-white/95 backdrop-blur-sm py-3 px-4 rounded-2xl shadow-dropdown border border-border-gray flex items-center gap-3 max-w-[240px]">
                  <div className="w-8 h-8 rounded-full bg-seedly-light flex items-center justify-center text-seedly-dark shrink-0">
                    <Leaf className="w-4 h-4 text-seedly-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-charcoal">Packed in Lahore</p>
                    <p className="text-[11px] text-muted-gray font-mono">Autumn 2025 / Summer 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Real Product Worlds (Asymmetric Editorial Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8 space-y-1">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Three simple categories
          </h2>
          <p className="text-sm text-muted-gray">
            Single-ingredient raw pantry seeds, structured monthly routine boxes, and loose mountain blossoms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* Featured Hero Card: Routine Kits (Spans 7 cols) */}
          <Link
            href="/kits"
            className="lg:col-span-7 group relative rounded-3xl overflow-hidden bg-white border border-border-gray shadow-card hover:shadow-hover transition-all p-6 sm:p-8 flex flex-col justify-between"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-6 relative aspect-square w-full rounded-2xl overflow-hidden bg-stone/40">
                <Image
                  src="/images/products/complete-kit.jpg"
                  alt="Curated Seed Kits"
                  fill
                  sizes="(max-width: 1024px) 100vw, 35vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="sm:col-span-6 space-y-3">
                <div className="inline-block px-2.5 py-1 rounded-full bg-seedly-light text-seedly-dark text-[11px] font-semibold uppercase tracking-wider">
                  Featured Routine
                </div>
                <h3 className="font-serif text-2xl font-bold text-charcoal group-hover:text-seedly-dark transition-colors">
                  Curated Seed Kits
                </h3>
                <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
                  Complete 28-day routine boxes with raw pantry seeds portioned for both monthly phases, an engraved wooden measuring scoop, and a printed cycle calendar.
                </p>
                <div className="pt-2 text-xs font-semibold text-seedly-dark flex items-center gap-1.5">
                  <span>Explore starter boxes</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Right Column: 2 Companion Cards (Spans 5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {/* Card: Seeds */}
            <Link
              href="/seeds"
              className="group relative rounded-3xl overflow-hidden bg-white border border-border-gray shadow-card hover:shadow-hover transition-all p-6 flex items-center gap-5"
            >
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-cream/70 shrink-0">
                <Image
                  src="/images/products/pumpkin-seeds.jpg"
                  alt="Raw Pantry Seeds"
                  fill
                  sizes="96px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-charcoal group-hover:text-seedly-dark transition-colors">
                  Raw Pantry Seeds
                </h3>
                <p className="text-xs text-muted-gray leading-relaxed">
                  Raw pumpkin, cold-milled flax, sunflower, and sesame. Unsalted and unbleached.
                </p>
                <div className="text-xs font-semibold text-seedly-dark pt-1 flex items-center gap-1">
                  <span>View 4 single-origin seeds</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Card: Teas */}
            <Link
              href="/teas"
              className="group relative rounded-3xl overflow-hidden bg-white border border-border-gray shadow-card hover:shadow-hover transition-all p-6 flex items-center gap-5"
            >
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-cream/70 shrink-0">
                <Image
                  src="/images/products/chamomile-tea.jpg"
                  alt="Mountain Herbal Teas"
                  fill
                  sizes="96px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-charcoal group-hover:text-seedly-dark transition-colors">
                  Mountain Herbal Teas
                </h3>
                <p className="text-xs text-muted-gray leading-relaxed">
                  Whole chamomile blossoms in amber glass, and coarse mountain spearmint leaves in airtight barrier pouches.
                </p>
                <div className="text-xs font-semibold text-seedly-dark pt-1 flex items-center gap-1">
                  <span>View 3 loose infusions</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Actual Best Sellers (No redundant eyebrow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              Everyday essentials
            </h2>
            <p className="text-xs sm:text-sm text-muted-gray">Direct harvests from smallholder family farms in Punjab &amp; Gilgit.</p>
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

      {/* 4. How We Handle Your Harvest (2 Substantive Points + Operational Pull-Quote) */}
      <section className="bg-seedly-stone py-16 sm:py-20 border-y border-border-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 space-y-2">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              How we handle your harvest
            </h2>
            <p className="text-sm text-muted-gray">
              The difference between industrial bulk bins and cold-stored pantry seeds and botanicals.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Column 1: Bleaching & Glazes */}
            <div className="lg:col-span-4 bg-white p-7 sm:p-8 rounded-3xl border border-border-gray space-y-4 shadow-subtle flex flex-col justify-between">
              <div className="space-y-3">
                <span className="w-8 h-8 rounded-full bg-seedly-light text-seedly-dark text-xs flex items-center justify-center font-bold">
                  01
                </span>
                <h3 className="font-serif font-bold text-xl text-charcoal">
                  Never chemically bleached or oil-glazed
                </h3>
                <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
                  Supermarket seeds in Pakistan are often washed in caustic alkali to look artificially pale or sprayed with mineral oil for false luster. Our pumpkin and sunflower seeds are cold-cleaned, unsalted, and sun-dried without additives.
                </p>
              </div>
              <div className="pt-3 border-t border-border-gray/50 text-[11px] font-mono text-seedly-dark">
                Tested: Crisp &amp; Dry (&lt; 8% Moisture)
              </div>
            </div>

            {/* Column 2: Whole Blossoms */}
            <div className="lg:col-span-4 bg-white p-7 sm:p-8 rounded-3xl border border-border-gray space-y-4 shadow-subtle flex flex-col justify-between">
              <div className="space-y-3">
                <span className="w-8 h-8 rounded-full bg-seedly-light text-seedly-dark text-xs flex items-center justify-center font-bold">
                  02
                </span>
                <h3 className="font-serif font-bold text-xl text-charcoal">
                  Intact blossoms, not machine tea dust
                </h3>
                <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
                  Commercial paper tea bags are packed with pulverized fannings that lose their aromatics and essential oils in weeks. We preserve intact dried chamomile flowers in UV-protective amber jars, and whole alpine spearmint leaves in resealable oxygen-barrier pouches.
                </p>
              </div>
              <div className="pt-3 border-t border-border-gray/50 text-[11px] font-mono text-seedly-dark">
                Shade-Dried at 2,200m Elevation
              </div>
            </div>

            {/* Column 3: Operational Pull-Quote Callout (Breaks 3-card monotony) */}
            <div className="lg:col-span-4 bg-seedly-dark text-white p-7 sm:p-8 rounded-3xl space-y-5 shadow-card flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest font-mono text-seedly-light/80 block">
                  Smallholder Commitment
                </span>
                <blockquote className="font-serif text-lg sm:text-xl font-normal leading-relaxed text-cream">
                  "We pay above wholesale market rates directly to family growers in Sahiwal and Gilgit. No middlemen, no mystery blending, and no inventory sitting in humid warehouses."
                </blockquote>
              </div>
              <div className="pt-4 border-t border-seedly-forest/40 flex items-center justify-between text-xs text-seedly-light/80">
                <span>Lahore Dispatch Hub</span>
                <span className="font-mono text-[11px]">Direct Trade</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Complete Kit Storytelling Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-border-gray p-8 sm:p-12 lg:p-16 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-cream shadow-subtle">
                <Image
                  src="/images/products/complete-kit.jpg"
                  alt="Complete 28-Day Seed Cycling Kit"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5">
              <div className="inline-block px-2.5 py-1 rounded-full bg-seedly-light text-seedly-dark text-[11px] font-semibold uppercase tracking-wider">
                Full Monthly Routine
              </div>
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

      {/* 6. First-Person Authentic Founder's Note */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-border-gray rounded-3xl p-8 sm:p-12 bg-white space-y-6 shadow-card relative overflow-hidden">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal leading-snug">
              "I started buying seeds from the Akbari Mandi in Lahore because the bagged stuff at grocery stores tasted stale."
            </h2>
            <p className="text-sm sm:text-base text-muted-gray leading-relaxed">
              They were either roasted in commercial vegetable oils, salted to mask aging, or chemically glazed for shelf appearance. Seedly is that same fresh harvest, tested for purity, cold-stored, and packaged properly so it arrives at your doorstep in its natural state.
            </p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border-gray/60">
            <div>
              <p className="font-bold text-charcoal text-sm">Awais</p>
              <p className="text-xs text-muted-gray">Founder, Seedly Naturals • Lahore, Pakistan</p>
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-seedly-dark hover:underline"
            >
              <span>Read our full sourcing story</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Real Customer Reviews (No repetitive eyebrow) */}
      <section className="bg-cream py-16 sm:py-20 border-t border-border-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
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
            href="https://wa.me/923041117333?text=Hi%20Seedly%2C%20I%20have%20a%20question%20about%20your%20seeds%20and%20teas."
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
