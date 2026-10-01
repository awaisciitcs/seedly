import Link from 'next/link';
import Image from 'next/image';
import { ArrowDownRight, ArrowUpRight, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { getFeaturedProducts } from '../../lib/services/products';
import { getKits } from '../../lib/services/kits';
import { ProductCard } from '../../components/product/ProductCard';
import { Reveal } from '../../components/ui/Reveal';
import { siteConfig } from '../../lib/config';
import { formatPKR } from '../../lib/utils';

const collections = [
  {
    href: '/seeds',
    title: 'Raw seeds',
    tag: 'Whole & Unroasted',
    categoryColor: 'bg-seed-lime',
    borderColor: 'border-seed-lime',
    description: 'Pumpkin, sunflower, flax, and sesame. For breakfast bowls and baking.',
    image: '/images/products/pumpkin-seeds.jpg',
    alt: 'Pumpkin seeds in a pouch with a wooden scoop',
  },
  {
    href: '/teas',
    title: 'Mountain teas',
    tag: 'High-Altitude Harvest',
    categoryColor: 'bg-tea-butter',
    borderColor: 'border-tea-butter',
    description: 'Whole blossoms and loose leaves from northern valleys. Just add hot water.',
    image: '/images/products/chamomile-tea.jpg',
    alt: 'Dried chamomile blossoms and a glass of brewed tea',
  },
  {
    href: '/kits',
    title: 'Seed kits',
    tag: '14 & 28-Day Routines',
    categoryColor: 'bg-kit-coral',
    borderColor: 'border-kit-coral',
    description: 'Our four seed combinations brought together in one box with printed guides.',
    image: '/images/products/complete-kit.jpg',
    alt: 'Four seed varieties with a scoop and printed guide',
  },
];

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
      <section className="relative overflow-hidden border-b-2 border-ink py-10 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Headlines & Twin CTA Buttons with diagonal arrows */}
            <div className="lg:col-span-6 flex flex-col items-start">
              
              {/* Butter Pill Badge */}
              <div className="rounded-full border-2 border-ink bg-tea-butter px-3.5 py-1 text-xs font-black uppercase tracking-wider text-ink shadow-brutal-sm mb-5 inline-flex items-center gap-1.5">
                <span>✦</span>
                <span>The Seedly Pantry — Lahore</span>
              </div>

              {/* Main Headline matching Canva layout */}
              <div className="relative">
                <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-[4rem] leading-[1.04] tracking-[-0.04em] text-ink">
                  Raw seeds.<br />
                  Mountain teas.<br />
                  <span className="relative inline-block text-ink">
                    Everyday staples.
                    {/* Orange curved flourish stroke matching Canva design */}
                    <svg
                      className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 sm:h-4 text-kit-coral fill-current pointer-events-none"
                      viewBox="0 0 240 16"
                      preserveAspectRatio="none"
                    >
                      <path d="M2 12C50 4 190 2 238 12C170 8 70 8 2 12Z" />
                    </svg>
                  </span>
                </h1>
              </div>

              {/* Intro Body Copy */}
              <p className="mt-7 text-sm sm:text-base leading-relaxed text-muted-gray max-w-lg font-medium">
                Good ingredients belong in ordinary daily moments. Explore our whole raw seeds,
                high-altitude loose-leaf teas, and seed cycling kits — hand-cleaned, packaged in Lahore, and delivered fresh across Pakistan.
              </p>

              {/* Twin CTA Buttons with ↘ arrows */}
              <div className="flex flex-wrap items-center gap-4 mt-8">
                {/* Primary CTA (Lime pill with ↘ arrow) */}
                <Link
                  href="/shop"
                  className="btn-brutal bg-seed-lime text-ink px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider shadow-brutal flex items-center gap-2.5 font-extrabold hover:bg-seed-lime/80"
                >
                  <span>Shop the pantry</span>
                  <ArrowDownRight className="h-4 w-4" />
                </Link>

                {/* Secondary CTA (White pill with ↘ arrow) */}
                <Link
                  href="/find-your-seed"
                  className="btn-brutal bg-white text-ink px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider shadow-brutal flex items-center gap-2.5 font-extrabold hover:bg-paper"
                >
                  <span>Routine finder</span>
                  <ArrowDownRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Quick guarantee bullets */}
              <div className="mt-8 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-bold text-ink">
                <div className="flex items-center gap-1.5">
                  <span className="text-seed-lime bg-ink rounded-full p-0.5"><CheckCircle2 className="h-3.5 w-3.5" /></span>
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-seed-lime bg-ink rounded-full p-0.5"><CheckCircle2 className="h-3.5 w-3.5" /></span>
                  <span>Free Shipping Rs. 2,500+</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-seed-lime bg-ink rounded-full p-0.5"><CheckCircle2 className="h-3.5 w-3.5" /></span>
                  <span>Fresh Harvest</span>
                </div>
              </div>

            </div>

            {/* Right Column: Sage Hero Card with Orbit Badge & Overlapping Tilted Frame matching Canva */}
            <div className="lg:col-span-6 relative flex flex-col items-center lg:items-end justify-center">
              
              {/* Secondary tilted wireframe outline frame overlapping at bottom-right */}
              <div
                aria-hidden="true"
                className="absolute -bottom-8 -right-2 sm:-right-4 w-72 sm:w-80 h-56 sm:h-64 rounded-[32px] border-2 border-ink bg-transparent rotate-[8deg] pointer-events-none hidden sm:block z-0"
              />

              {/* Main Pistachio Sage Container Card */}
              <div className="relative z-10 w-full max-w-lg rounded-[32px] border-2 border-ink bg-pistachio-sage p-4 sm:p-5 shadow-brutal-lg overflow-hidden">
                
                {/* Orbit loop wireframe behind sticker extending out */}
                <div
                  aria-hidden="true"
                  className="absolute -top-4 right-3 w-28 sm:w-32 h-40 border-2 border-dashed border-ink/60 rounded-full transform rotate-[22deg] pointer-events-none z-0"
                />

                {/* Top-Right "PACKED IN LAHORE" Sticker Badge */}
                <div className="absolute top-4 right-4 z-10 rounded-full border-2 border-ink bg-seed-lime px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-ink shadow-brutal text-center leading-tight">
                  <div>PACKED IN LAHORE</div>
                  <div className="text-[10px] text-ink/80 flex items-center justify-center gap-1">
                    <span>✦</span> DISPATCHED IN 24H <span>✦</span>
                  </div>
                </div>

                {/* Hero Image Viewport */}
                <div className="relative aspect-[4/3] sm:aspect-[5/4] w-full rounded-[24px] border-2 border-ink overflow-hidden bg-white shadow-brutal-sm z-10">
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
                <div className="mt-3.5 flex items-center justify-between text-xs font-bold text-ink px-1 z-10 relative">
                  <span>Pure agricultural food staples</span>
                  <span className="rounded-full bg-white px-2 py-0.5 border border-ink text-[10px]">
                    Lahore, PK
                  </span>
                </div>
              </div>

              {/* Floating Coral Accent Orb at bottom center-left matching Canva */}
              <div
                aria-hidden="true"
                className="mt-4 sm:mt-6 h-9 w-9 rounded-full border-2 border-ink bg-kit-coral shadow-brutal self-center lg:self-start lg:ml-12 pointer-events-none"
              />
            </div>

          </div>
        </div>
      </section>

      {/* THREE COLLECTIONS SECTION */}
      <section aria-labelledby="collections-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-5 mb-10">
          <div>
            <div className="rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-ink shadow-brutal-sm inline-block mb-3">
              ✦ Handpicked &amp; Fresh
            </div>
            <h2 id="collections-heading" className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-ink">
              Find your everyday favourites.
            </h2>
          </div>
          <p className="text-sm font-medium text-muted-gray max-w-xs">
            Three simple categories. Endless ways to add them to your pantry.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
          {collections.map((col, index) => (
            <Reveal key={col.href} delay={index * 60}>
              <Link
                href={col.href}
                className="card-brutal-interactive group flex flex-col h-full bg-white p-5"
              >
                {/* Image Container with category color accent */}
                <div className="relative aspect-[4/3] w-full rounded-[20px] border-2 border-ink overflow-hidden bg-paper mb-5">
                  <Image
                    src={col.image}
                    alt={col.alt}
                    fill
                    sizes="(max-width: 639px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className={`absolute top-3 left-3 rounded-full border-2 border-ink ${col.categoryColor} px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink shadow-brutal-sm`}>
                    {col.tag}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="font-heading font-black text-2xl text-ink">
                    {col.title}
                  </h3>
                  <div className="h-9 w-9 rounded-full border-2 border-ink bg-white flex items-center justify-center shadow-brutal-sm group-hover:bg-seed-lime transition-colors">
                    <ArrowDownRight className="h-4 w-4 text-ink" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-gray font-medium leading-relaxed mt-1 mb-4 flex-1">
                  {col.description}
                </p>

                <div className="pt-3 border-t-2 border-ink/10 flex items-center justify-between text-xs font-bold text-ink">
                  <span>Explore collection</span>
                  <span className="text-ink">→</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED ESSENTIALS GRID */}
      {featuredProducts.length > 0 && (
        <section aria-labelledby="essentials-heading" className="border-t-2 border-ink bg-paper py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-5 mb-10">
              <div>
                <div className="rounded-full border-2 border-ink bg-seed-lime px-3 py-1 text-xs font-black uppercase tracking-wider text-ink shadow-brutal-sm inline-block mb-3">
                  ✦ Always In Stock
                </div>
                <h2 id="essentials-heading" className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-ink">
                  Start with the essentials.
                </h2>
              </div>
              <Link
                href="/shop"
                className="btn-brutal bg-white px-5 py-2.5 text-xs uppercase tracking-wider font-extrabold text-ink hover:bg-seed-lime flex items-center gap-2 shadow-brutal-sm"
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

      {/* FEATURED SEED ROUTINE KIT SHOWCASE */}
      {completeKit && (
        <section aria-labelledby="kit-showcase-heading" className="border-t-2 border-ink bg-tea-butter/30 py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal as="div" className="card-brutal bg-white p-6 sm:p-10 lg:p-12 shadow-brutal-lg">
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                
                <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] lg:aspect-auto lg:h-[480px] rounded-[24px] border-2 border-ink overflow-hidden bg-paper shadow-brutal-sm">
                  <Image
                    src={completeKit.image_url}
                    alt={completeKit.name}
                    fill
                    sizes="(max-width: 1023px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 rounded-full border-2 border-ink bg-kit-coral px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-brutal-sm">
                    ✦ 28-Day Complete Routine
                  </div>
                </div>

                <div className="lg:col-span-6 flex flex-col items-start">
                  <div className="rounded-full border-2 border-ink bg-seed-lime px-3 py-1 text-xs font-black uppercase tracking-wider text-ink shadow-brutal-sm mb-4">
                    All-in-One Box
                  </div>
                  
                  <h2 id="kit-showcase-heading" className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-ink leading-tight">
                    Four seeds.<br />One simple routine.
                  </h2>

                  <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-gray font-medium">
                    Pumpkin, flax, sunflower, and sesame. Our complete kit brings all four together in partitioned pouches with a handcrafted wooden scoop and an easy-to-follow printed guide.
                  </p>

                  <div className="w-full mt-6 rounded-[20px] border-2 border-ink bg-paper p-4 shadow-brutal-sm">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <p className="font-heading font-extrabold text-base text-ink">{completeKit.name}</p>
                        <p className="text-xs text-muted-gray">{completeKit.package_size || 'Four 250g pouches (1kg total)'}</p>
                      </div>
                      <p className="font-heading font-black text-2xl text-ink tabular-nums">
                        {formatPKR(completeKit.price_minor)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-6">
                    <Link
                      href={`/kits/${completeKit.slug}`}
                      className="btn-brutal bg-seed-lime text-ink px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider font-extrabold flex items-center gap-2 shadow-brutal"
                    >
                      <span>Explore the complete kit</span>
                      <ArrowDownRight className="h-4 w-4" />
                    </Link>

                    <Link
                      href="/find-your-seed"
                      className="btn-brutal bg-white text-ink px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider font-extrabold flex items-center gap-2 shadow-brutal hover:bg-paper"
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
      <section aria-labelledby="story-heading" className="border-t-2 border-ink bg-paper py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-brutal bg-pistachio-sage/40 p-8 sm:p-12 lg:p-16 shadow-brutal">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5">
                <div className="rounded-full border-2 border-ink bg-seed-lime px-3 py-1 text-xs font-black uppercase tracking-wider text-ink shadow-brutal-sm inline-block mb-3">
                  ✦ Freshly Packed in Lahore
                </div>
                <h2 id="story-heading" className="font-heading font-black text-3xl sm:text-4xl text-ink leading-tight">
                  Real pantry food.<br />No shortcuts.
                </h2>
              </div>
              <div className="md:col-span-7">
                <p className="font-heading font-bold text-lg sm:text-xl text-ink leading-snug">
                  A spoonful of raw seeds in your morning porridge. A soothing brew of whole mountain chamomile after a long day.
                </p>
                <p className="mt-4 text-xs sm:text-sm text-muted-gray leading-relaxed font-medium">
                  Seedly is an independent pantry shop based in Lahore. We source direct from growers across Gilgit-Baltistan, KP, and Punjab. Every batch is cleaned by hand, inspected for purity, and sealed in airtight pouches with clear packaging dates and transparent origin labels.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link
                    href="/about"
                    className="btn-brutal bg-white px-5 py-2.5 text-xs uppercase tracking-wider font-extrabold text-ink hover:bg-seed-lime shadow-brutal-sm"
                  >
                    Read our full story →
                  </Link>
                  <a
                    href="https://wa.me/923719055758"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-extrabold uppercase tracking-wider text-ink underline hover:text-seed-lime transition-colors"
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
