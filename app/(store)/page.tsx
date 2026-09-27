import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts } from '../../lib/services/products';
import { getKits } from '../../lib/services/kits';
import { ProductCard } from '../../components/product/ProductCard';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Leaf,
  Moon,
  Sun,
  HeartHandshake,
  CheckCircle2,
  Calendar,
  Compass,
} from 'lucide-react';

export default function HomePage() {
  const featuredProducts = getFeaturedProducts();
  const kits = getKits();
  const follicularKit = kits.find((k) => k.slug === 'follicular-blend');
  const lutealKit = kits.find((k) => k.slug === 'luteal-blend');

  return (
    <div className="space-y-20 lg:space-y-28">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-cream pt-10 pb-20 lg:pt-16 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-seedly-light border border-seedly-primary/30 text-seedly-dark text-xs font-semibold uppercase tracking-wider shadow-subtle">
                <Leaf className="w-3.5 h-3.5 text-seedly-primary" />
                <span>Pakistan's Pure Botanical Apothecary</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-charcoal leading-[1.1]">
                Grow something <br />
                <span className="italic font-normal text-seedly-dark">good.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-gray leading-relaxed max-w-xl mx-auto lg:mx-0">
                Cold-milled heirloom seeds, daily seed-cycling rituals, and whole blossom mountain teas. Consciously harvested to nurture energy, digestion, and daily hormonal harmony.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto px-8 py-4 bg-seedly-dark hover:bg-seedly-forest text-white rounded-full font-medium text-sm transition-all shadow-card flex items-center justify-center gap-2 group"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/find-your-seed"
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-seedly-light/60 text-seedly-dark border border-border-gray rounded-full font-medium text-sm transition-all shadow-subtle flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-seedly-primary" />
                  <span>Find Your Seed Quiz</span>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="pt-6 border-t border-border-gray/70 grid grid-cols-3 gap-3 text-left max-w-lg mx-auto lg:mx-0">
                <div className="space-y-1">
                  <p className="font-serif font-bold text-sm text-charcoal">100% Raw</p>
                  <p className="text-xs text-muted-gray">Non-GMO Heirloom</p>
                </div>
                <div className="space-y-1">
                  <p className="font-serif font-bold text-sm text-charcoal">Alpine Sourced</p>
                  <p className="text-xs text-muted-gray">Gilgit & Northern Valleys</p>
                </div>
                <div className="space-y-1">
                  <p className="font-serif font-bold text-sm text-charcoal">Direct Delivery</p>
                  <p className="text-xs text-muted-gray">Across all Pakistan</p>
                </div>
              </div>
            </div>

            {/* Right Column Visual / Botanical Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Card */}
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-cream">
                  <Image
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=900"
                    alt="Seedly natural seeds and herbal infusions"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-seedly-light">
                      Natural Daily Ritual
                    </span>
                    <h3 className="font-serif text-xl font-medium">Seed Cycling & Herbal Nourishment</h3>
                    <p className="text-xs text-white/80">Tailored to your body’s natural rhythm.</p>
                  </div>
                </div>

                {/* Floating Seal Card */}
                <div className="absolute -bottom-6 -left-6 sm:-left-8 bg-white p-4 rounded-2xl shadow-dropdown border border-border-gray/80 flex items-center gap-3.5 max-w-[240px]">
                  <div className="w-10 h-10 rounded-full bg-seedly-light flex items-center justify-center text-seedly-dark shrink-0">
                    <Sparkles className="w-5 h-5 text-seedly-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-charcoal">Fresh Harvest 2026</p>
                    <p className="text-[11px] text-muted-gray">Cold-stored for active vitality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Explore Collections (3 Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
            Explore Seedly
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Pure Botanical Categories
          </h2>
          <p className="text-sm text-muted-gray">
            Targeted single-ingredient seeds, curated daily wellness kits, and soothing loose-leaf teas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: Seeds */}
          <Link
            href="/seeds"
            className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-cream border border-border-gray shadow-card hover:shadow-hover transition-all"
          >
            <Image
              src="https://images.unsplash.com/photo-1596797882870-8c33deeac224?auto=format&fit=crop&q=80&w=600"
              alt="Heirloom Seeds"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white flex items-end justify-between">
              <div>
                <span className="text-xs text-seedly-light font-medium uppercase tracking-wider">Single Origin</span>
                <h3 className="font-serif text-2xl font-semibold mt-1">Heirloom Seeds</h3>
                <p className="text-xs text-white/80 mt-1">Pumpkin, Golden Flax, Sunflower & Sesame</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-seedly-dark transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* Card 2: Kits */}
          <Link
            href="/kits"
            className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-cream border border-border-gray shadow-card hover:shadow-hover transition-all"
          >
            <Image
              src="https://images.unsplash.com/photo-1505253758473-96b3015f27eb?auto=format&fit=crop&q=80&w=600"
              alt="Curated Seed Kits"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white flex items-end justify-between">
              <div>
                <span className="text-xs text-seedly-light font-medium uppercase tracking-wider">Formulated Rituals</span>
                <h3 className="font-serif text-2xl font-semibold mt-1">Seed Kits</h3>
                <p className="text-xs text-white/80 mt-1">Follicular, Luteal & Complete 28-Day Boxes</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-seedly-dark transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* Card 3: Teas */}
          <Link
            href="/teas"
            className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-cream border border-border-gray shadow-card hover:shadow-hover transition-all"
          >
            <Image
              src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600"
              alt="Herbal Teas"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white flex items-end justify-between">
              <div>
                <span className="text-xs text-seedly-light font-medium uppercase tracking-wider">Mountain Botanicals</span>
                <h3 className="font-serif text-2xl font-semibold mt-1">Herbal Teas</h3>
                <p className="text-xs text-white/80 mt-1">Whole Chamomile, Mountain Spearmint & Green Tea</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-seedly-dark transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Seedly Favorites / Featured Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
              Seedly Favorites
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-1">
              Most Loved by Our Community
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-seedly-dark hover:underline"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Kit Spotlight: Seed Cycling Phase Duo */}
      <section className="bg-seedly-light/50 py-16 lg:py-24 border-y border-border-gray/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs uppercase tracking-widest font-bold text-seedly-dark">
              Ritual Spotlight
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              The Science & Simplicity of Seed Cycling
            </h2>
            <p className="text-sm text-muted-gray leading-relaxed">
              Seed cycling is an ancient botanical practice using targeted raw seeds to nourish natural hormonal fluctuations across the 28-day monthly cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Phase 1: Follicular */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold">
                    <Sun className="w-3.5 h-3.5 text-amber-600" />
                    <span>Phase 1 (Days 1–14)</span>
                  </div>
                  <span className="text-xs text-muted-gray font-medium">Follicular Phase</span>
                </div>

                <h3 className="font-serif text-2xl font-bold text-charcoal">
                  Follicular Phase Seed Kit
                </h3>
                <p className="text-sm text-muted-gray leading-relaxed">
                  Raw Pumpkin Seeds + Golden Flax Seeds. Supplies bioavailable zinc and lignans to support healthy follicular growth and balanced estrogen clearance.
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl relative overflow-hidden bg-cream border border-border-gray">
                    <Image
                      src="https://images.unsplash.com/photo-1596797882870-8c33deeac224?auto=format&fit=crop&q=80&w=200"
                      alt="Pumpkin Seeds"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="w-12 h-12 rounded-xl relative overflow-hidden bg-cream border border-border-gray">
                    <Image
                      src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=200"
                      alt="Flax Seeds"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs text-muted-gray font-medium">+ Botanical measuring scoop</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-border-gray/60 flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-xl text-charcoal">Rs. 1,550</span>
                  <p className="text-[11px] text-muted-gray">2 x 250g Glass Amber Jars</p>
                </div>
                <Link
                  href="/kits/follicular-blend"
                  className="px-5 py-2.5 bg-seedly-dark hover:bg-seedly-forest text-white rounded-full text-xs font-semibold transition-colors"
                >
                  View Details & Order
                </Link>
              </div>
            </div>

            {/* Phase 2: Luteal */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-semibold">
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Phase 2 (Days 15–28)</span>
                  </div>
                  <span className="text-xs text-muted-gray font-medium">Luteal Phase</span>
                </div>

                <h3 className="font-serif text-2xl font-bold text-charcoal">
                  Luteal Phase Seed Kit
                </h3>
                <p className="text-sm text-muted-gray leading-relaxed">
                  Raw Sunflower Kernels + Sesame Seeds. Rich in natural Vitamin E, selenium, and calcium to sustain progesterone production and ease premenstrual mood shifts.
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl relative overflow-hidden bg-cream border border-border-gray">
                    <Image
                      src="https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=200"
                      alt="Sunflower Seeds"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="w-12 h-12 rounded-xl relative overflow-hidden bg-cream border border-border-gray">
                    <Image
                      src="https://images.unsplash.com/photo-1627916607164-7b20241db935?auto=format&fit=crop&q=80&w=200"
                      alt="Sesame Seeds"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs text-muted-gray font-medium">+ Botanical measuring scoop</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-border-gray/60 flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-xl text-charcoal">Rs. 1,450</span>
                  <p className="text-[11px] text-muted-gray">2 x 250g Glass Amber Jars</p>
                </div>
                <Link
                  href="/kits/luteal-blend"
                  className="px-5 py-2.5 bg-seedly-dark hover:bg-seedly-forest text-white rounded-full text-xs font-semibold transition-colors"
                >
                  View Details & Order
                </Link>
              </div>
            </div>
          </div>

          {/* Bundle banner */}
          <div className="mt-8 bg-white/80 border border-seedly-primary/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-seedly-primary shrink-0" />
              <div>
                <p className="text-sm font-bold text-charcoal">
                  Want the complete 28-day routine with calendar & brass scoop?
                </p>
                <p className="text-xs text-muted-gray">
                  Save Rs. 550 with the Complete 28-Day Ritual Kit. Free nationwide shipping included.
                </p>
              </div>
            </div>
            <Link
              href="/kits/complete-cycle-kit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-semibold shrink-0"
            >
              Get Complete Kit (Rs. 2,850)
            </Link>
          </div>
        </div>
      </section>

      {/* 5. V1.1 Find Your Seed Quiz Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-seedly-forest text-white p-8 sm:p-12 lg:p-16">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-seedly-light text-xs font-medium">
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              <span>Interactive Wellness Quiz</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
              Not sure where to begin your seed journey?
            </h2>
            <p className="text-sm sm:text-base text-seedly-light/90 leading-relaxed">
              Answer 3 simple questions about your wellness focus (hormonal harmony, digestive comfort, calm sleep, or sustained energy) to receive your tailored botanical blend recommendation.
            </p>
            <div className="pt-2">
              <Link
                href="/find-your-seed"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-seedly-forest hover:bg-cream rounded-full font-semibold text-sm transition-all shadow-hover"
              >
                <span>Take the 2-Minute Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Decorative motif */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none hidden lg:flex items-center justify-center">
            <Leaf className="w-80 h-80 text-white stroke-[0.5]" />
          </div>
        </div>
      </section>

      {/* 6. Brand Story & Sourcing Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-3xl overflow-hidden shadow-card border border-border-gray">
            <Image
              src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=900"
              alt="Botanical mountain harvesting in Pakistan"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
                Our Philosophy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
                Rooted in nature. <br />
                Made for modern life.
              </h2>
            </div>

            <p className="text-sm sm:text-base text-muted-gray leading-relaxed">
              We started Seedly because supermarket seeds and commercial tea bags in Pakistan are all too often dusty, bleached, stale, or treated with chemical preservatives.
            </p>

            <p className="text-sm text-muted-gray leading-relaxed">
              We partner directly with family farms and certified cooperatives in Gilgit-Baltistan, Hunza, and the fertile plains of Punjab. Our seeds are kept whole or cold-milled in micro-batches to safeguard delicate essential fatty acids. Our herbal teas are composed of intact flower blossoms and mountain-shade-dried leaves.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-medium text-charcoal">
                  Zero artificial flavors, colors, or fillers
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-medium text-charcoal">
                  Cold-packed in amber UV-protective glass
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-medium text-charcoal">
                  Direct ethical income for northern growers
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-medium text-charcoal">
                  Independent batch purity verification
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-seedly-dark hover:underline"
              >
                <span>Read our full sourcing story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Verified Customer Reviews */}
      <section className="bg-cream py-16 lg:py-24 border-t border-border-gray/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
              Real Stories
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              Loved Across Pakistan
            </h2>
            <p className="text-sm text-muted-gray">
              Read how our community incorporates Seedly into their morning smoothies, tea hours, and wellness routines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Review 1 */}
            <div className="bg-white p-6 rounded-2xl border border-border-gray/80 shadow-subtle flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center text-amber-500 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <h4 className="font-serif font-semibold text-charcoal text-base">
                  "Remarkably fresh and crunchy"
                </h4>
                <p className="text-xs text-muted-gray leading-relaxed">
                  "Unlike standard grocery store seeds that often taste stale or oily, these arrived wonderfully clean, vibrant green, and fragrant. I add them to my yogurt bowl every morning."
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border-gray/50 flex items-center justify-between text-xs">
                <span className="font-medium text-charcoal">Ayesha K.</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[10px]">
                  Verified Buyer • Lahore
                </span>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-6 rounded-2xl border border-border-gray/80 shadow-subtle flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center text-amber-500 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <h4 className="font-serif font-semibold text-charcoal text-base">
                  "Real whole flowers make all the difference"
                </h4>
                <p className="text-xs text-muted-gray leading-relaxed">
                  "Opening the jar was an absolute delight—actual intact chamomile blossoms with a sweet honey scent. No dust or paper bags. My sleep quality has noticeably improved."
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border-gray/50 flex items-center justify-between text-xs">
                <span className="font-medium text-charcoal">Dr. Bilal S.</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[10px]">
                  Verified Buyer • Islamabad
                </span>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white p-6 rounded-2xl border border-border-gray/80 shadow-subtle flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center text-amber-500 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <h4 className="font-serif font-semibold text-charcoal text-base">
                  "A beautifully curated wellness ritual"
                </h4>
                <p className="text-xs text-muted-gray leading-relaxed">
                  "The packaging is breathtaking and thoughtful. Having all 4 seeds portioned with the wooden scoop made it effortless to stick to my daily routine. Delivery in Clifton took just 2 days."
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border-gray/50 flex items-center justify-between text-xs">
                <span className="font-medium text-charcoal">Zainab M.</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[10px]">
                  Verified Buyer • Karachi
                </span>
              </div>
            </div>

            {/* Review 4 */}
            <div className="bg-white p-6 rounded-2xl border border-border-gray/80 shadow-subtle flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center text-amber-500 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <h4 className="font-serif font-semibold text-charcoal text-base">
                  "So soothing for digestion"
                </h4>
                <p className="text-xs text-muted-gray leading-relaxed">
                  "The spearmint taste is pure mountain herbs with no bitterness. I drink a cup after dinner and feel so light and calm. Highly recommended!"
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border-gray/50 flex items-center justify-between text-xs">
                <span className="font-medium text-charcoal">Mariam T.</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[10px]">
                  Verified Buyer • Rawalpindi
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
