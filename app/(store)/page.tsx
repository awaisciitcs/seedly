import Link from 'next/link';
import Image from 'next/image';
import { ArrowDownRight, ArrowUpRight, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { getFeaturedProducts } from '../../lib/services/products';
import { getKits } from '../../lib/services/kits';
import { ProductCard } from '../../components/product/ProductCard';
import { Reveal } from '../../components/ui/Reveal';
import { EditorialCollections } from '../../components/storefront/EditorialCollections';
import { TestimonialCarousel } from '../../components/storefront/TestimonialCarousel';
import { siteConfig } from '../../lib/config';
import { formatPKR } from '../../lib/utils';

export default async function HomePage() {
  const [featuredProductsList, kitsList] = await Promise.all([
    getFeaturedProducts(),
    getKits(),
  ]);
  const featuredProducts = featuredProductsList.slice(0, 4);
  const completeKit = kitsList.find((kit) => kit.slug === 'complete-cycle-kit' || kit.id === 'kit-complete');

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: 'Seedly Pakistan',
        url: siteConfig.url,
        logo: `${siteConfig.url}/logo/seedly-logo.jpg`,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: siteConfig.contact.phoneInternational,
          contactType: 'Customer Support',
          areaServed: 'PK',
          availableLanguage: ['English', 'Urdu'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: 'Seedly Pakistan',
        publisher: { '@id': `${siteConfig.url}/#organization` },
      },
    ],
  };

  return (
    <div className="bg-paper text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      {/* CANVA HERO SECTION */}
      <section className="relative overflow-hidden border-b border-gray-200/90 py-10 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Headlines & Twin CTA Buttons with diagonal arrows */}
            <div className="lg:col-span-6 flex flex-col items-start">
              
              {/* Pill Badge */}
              <div className="rounded-full border border-gray-200/90 bg-gray-100 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-stone-900 shadow-xs mb-5 inline-flex items-center gap-1.5">
                <span>✦</span>
                <span>The Seedly Pantry — Lahore</span>
              </div>

              {/* Main Headline matching Canva layout */}
              <div className="relative">
                <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-[4rem] leading-[1.04] tracking-[-0.04em] text-stone-900">
                  Raw seeds.<br />
                  Mountain teas.<br />
                  <span className="relative inline-block text-stone-900">
                    Everyday staples.
                    {/* Amber curved flourish stroke */}
                    <svg
                      className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 sm:h-4 text-[#D97706] fill-current pointer-events-none"
                      viewBox="0 0 240 16"
                      preserveAspectRatio="none"
                    >
                      <path d="M2 12C50 4 190 2 238 12C170 8 70 8 2 12Z" />
                    </svg>
                  </span>
                </h1>
              </div>

              {/* Intro Body Copy */}
              <p className="mt-7 text-sm sm:text-base leading-relaxed text-stone-600 max-w-lg font-normal">
                Good ingredients belong in ordinary daily moments. Explore our whole raw seeds,
                high-altitude loose-leaf teas, and seed cycling kits — hand-cleaned, packaged in Lahore, and delivered fresh across Pakistan.
              </p>

              {/* Twin CTA Buttons with ↘ arrows */}
              <div className="flex flex-wrap items-center gap-4 mt-8">
                {/* Primary CTA (Obsidian pill with ↘ arrow) */}
                <Link
                  href="/shop"
                  className="px-6 py-3.5 rounded-full bg-black text-white hover:bg-neutral-800 text-xs sm:text-sm uppercase tracking-wider shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 font-semibold"
                >
                  <span>Shop the pantry</span>
                  <ArrowDownRight className="h-4 w-4" />
                </Link>

                {/* Secondary CTA (White pill with ↘ arrow) */}
                <Link
                  href="/find-your-seed"
                  className="px-6 py-3.5 rounded-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 text-xs sm:text-sm uppercase tracking-wider shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 font-semibold"
                >
                  <span>Routine finder</span>
                  <ArrowDownRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Quick guarantee bullets */}
              <div className="mt-8 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-semibold text-stone-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-700"><CheckCircle2 className="h-4 w-4" /></span>
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-700"><CheckCircle2 className="h-4 w-4" /></span>
                  <span>Free Shipping Rs. 2,500+</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-700"><CheckCircle2 className="h-4 w-4" /></span>
                  <span>Fresh Harvest</span>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Card with Orbit Badge & Overlapping Tilted Frame */}
            <div className="lg:col-span-6 relative flex flex-col items-center lg:items-end justify-center">
              
              {/* Secondary tilted wireframe outline frame */}
              <div
                aria-hidden="true"
                className="absolute -bottom-8 -right-2 sm:-right-4 w-72 sm:w-80 h-56 sm:h-64 rounded-[32px] border border-gray-200/90 bg-transparent rotate-[8deg] pointer-events-none hidden sm:block z-0 opacity-30"
              />

              {/* Main Container Card */}
              <div className="relative z-10 w-full max-w-lg rounded-[24px] sm:rounded-[28px] border border-gray-200/90 bg-[#F5F5F4] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden">
                
                {/* Orbit loop wireframe behind sticker */}
                <div
                  aria-hidden="true"
                  className="absolute -top-4 right-3 w-28 sm:w-32 h-40 border-2 border-dashed border-stone-700/30 rounded-full transform rotate-[22deg] pointer-events-none z-0"
                />

                {/* Top-Right "PACKED IN LAHORE" Sticker Badge */}
                <div className="absolute top-4 right-4 z-10 rounded-full bg-black text-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-center leading-tight shadow-sm">
                  <div>PACKED IN LAHORE</div>
                  <div className="text-[10px] text-white/80 flex items-center justify-center gap-1">
                    <span>✦</span> DISPATCHED IN 24H <span>✦</span>
                  </div>
                </div>

                {/* Hero Image Viewport */}
                <div className="relative aspect-[4/3] sm:aspect-[5/4] w-full rounded-[20px] border border-gray-200/90 overflow-hidden bg-white shadow-xs z-10">
                  <Image
                    src="/images/hero/seedly-hero.jpg"
                    alt="Seedly raw pantry seeds and loose-leaf teas packed fresh in Lahore"
                    fill
                    priority
                    sizes="(max-width: 1023px) 100vw, 45vw"
                    className="object-cover object-[48%_center] transition-transform duration-500 hover:scale-105"
                  />
                </div>

                {/* Caption below image */}
                <div className="mt-3.5 flex items-center justify-between text-xs font-semibold text-stone-800 px-1 z-10 relative">
                  <span>Pure agricultural food staples</span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 border border-gray-200 text-[10px] shadow-xs">
                    Lahore, PK
                  </span>
                </div>
              </div>

              {/* Floating Amber Accent Orb */}
              <div
                aria-hidden="true"
                className="mt-4 sm:mt-6 h-9 w-9 rounded-full bg-[#D97706] shadow-sm self-center lg:self-start lg:ml-12 pointer-events-none"
              />
            </div>

          </div>
        </div>
      </section>

      {/* EDITORIAL ASYMMETRICAL 3-CARD COLLECTIONS SECTION */}
      <EditorialCollections />

      {/* FEATURED ESSENTIALS GRID */}
      {featuredProducts.length > 0 && (
        <section aria-labelledby="essentials-heading" className="border-t border-gray-200/90 bg-white py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-5 mb-10">
              <div>
                <div className="rounded-full border border-gray-200/90 bg-[#F5F5F4] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-800 shadow-sm inline-block mb-3">
                  ✦ Always In Stock
                </div>
                <h2 id="essentials-heading" className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-neutral-900 tracking-tight">
                  Start with the essentials.
                </h2>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200/90 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-200 shadow-sm"
              >
                <span>Browse all products</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EDITORIAL TESTIMONIAL & REVIEW CAROUSEL SECTION */}
      <TestimonialCarousel />

      {/* FEATURED SEED ROUTINE KIT SHOWCASE */}
      {completeKit && (
        <section aria-labelledby="kit-showcase-heading" className="border-t border-gray-200/90 bg-[#F8F8F7] py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal as="div" className="rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-10 lg:p-12 shadow-sm">
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                
                <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] lg:aspect-auto lg:h-[480px] rounded-2xl border border-gray-200/80 overflow-hidden bg-[#F5F5F4]">
                  <Image
                    src={completeKit.image_url}
                    alt={completeKit.name}
                    fill
                    sizes="(max-width: 1023px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 rounded-full border border-amber-500/20 bg-amber-500/10 backdrop-blur-md px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-900 shadow-sm">
                    ✦ 28-Day Complete Routine
                  </div>
                </div>

                <div className="lg:col-span-6 flex flex-col items-start">
                  <div className="rounded-full border border-gray-200/90 bg-[#F5F5F4] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-700 shadow-sm mb-4 inline-flex items-center">
                    All-in-One Box
                  </div>
                  
                  <h2 id="kit-showcase-heading" className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-neutral-900 leading-tight tracking-tight">
                    Four seeds.<br />One simple routine.
                  </h2>

                  <p className="mt-4 text-sm sm:text-base leading-relaxed text-neutral-600 font-normal">
                    Pumpkin, flax, sunflower, and sesame. Our complete kit brings all four together in partitioned pouches with a handcrafted wooden scoop and an easy-to-follow printed guide.
                  </p>

                  <div className="w-full mt-6 rounded-2xl border border-gray-200/90 bg-[#FAFAFA] p-5 shadow-sm">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <p className="font-heading font-bold text-base text-neutral-900">{completeKit.name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{completeKit.package_size || 'Four 250g pouches (1kg total)'}</p>
                      </div>
                      <p className="font-heading font-extrabold text-2xl text-neutral-900 tabular-nums">
                        {formatPKR(completeKit.price_minor)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-6">
                    <Link
                      href={`/kits/${completeKit.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 transition-all shadow-sm"
                    >
                      <span>Explore the complete kit</span>
                      <ArrowDownRight className="h-4 w-4" />
                    </Link>

                    <Link
                      href="/find-your-seed"
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200/90 bg-white px-6 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-900 hover:bg-neutral-50 transition-all shadow-sm"
                    >
                      <span>Take routine questionnaire</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* WHY SEEDLY / LAHORE PANTRY STORY */}
      <section aria-labelledby="story-heading" className="border-t border-gray-200/90 bg-white py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gray-200/90 bg-[#F5F5F4] p-8 sm:p-12 lg:p-16 shadow-sm">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5">
                <div className="rounded-full border border-gray-200/90 bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-800 shadow-sm inline-block mb-3">
                  ✦ Freshly Packed in Lahore
                </div>
                <h2 id="story-heading" className="font-heading font-black text-3xl sm:text-4xl text-neutral-900 leading-tight tracking-tight">
                  Real pantry food.<br />No shortcuts.
                </h2>
              </div>
              <div className="md:col-span-7">
                <p className="font-heading font-bold text-lg sm:text-xl text-neutral-900 leading-snug">
                  A spoonful of raw seeds in your morning porridge. A soothing brew of whole mountain chamomile after a long day.
                </p>
                <p className="mt-4 text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                  Seedly is an independent pantry shop based in Lahore. We source direct from growers across Gilgit-Baltistan, KP, and Punjab. Every batch is cleaned by hand, inspected for purity, and sealed in airtight pouches with clear packaging dates and transparent origin labels.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 transition-all shadow-sm"
                  >
                    Read our full story →
                  </Link>
                  <a
                    href="https://wa.me/923719055758"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold uppercase tracking-wider text-neutral-900 underline underline-offset-4 hover:text-neutral-600 transition-colors"
                  >
                    Ask our founder on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
