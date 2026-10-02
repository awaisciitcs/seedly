import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { ArrowRight, MapPin, Sparkles, Package, Truck } from 'lucide-react';
import { siteConfig } from '../../../lib/config';
import { getProducts } from '../../../lib/services/products';
import { getKits } from '../../../lib/services/kits';
import { ourStoryEn } from '../../../content/our-story';

export const metadata: Metadata = {
  title: 'Our story | Seedly',
  description:
    'Get to know the Seedly collection: pantry seeds, loose-leaf teas and seed cycling kits, with ingredients, pack sizes and preparation details on every product page.',
  openGraph: {
    title: 'Our story | Seedly',
    description:
      'Get to know the Seedly collection: pantry seeds, loose-leaf teas and seed cycling kits, with ingredients, pack sizes and preparation details on every product page.',
    url: `${siteConfig.url}/about`,
    siteName: 'Seedly',
    locale: 'en_PK',
    images: [
      {
        url: `${siteConfig.url}/images/hero/seedly-hero-lifestyle.jpg`,
        width: 1200,
        height: 630,
        alt: 'Seedly everyday pantry ingredients',
      },
    ],
    type: 'website',
  },
};

export default async function AboutPage() {
  const content = ourStoryEn;

  // Read one product image per category from existing data layer (with safe fallbacks)
  const [seeds, teas, kits] = await Promise.all([
    getProducts({ productType: 'seed', limit: 1 }),
    getProducts({ productType: 'tea', limit: 1 }),
    getKits(),
  ]);

  const categoryImages: Record<string, string | undefined> = {
    seeds: seeds[0]?.image_url || '/images/products/pumpkin-seeds.jpg',
    teas: teas[0]?.image_url || '/images/products/chamomile-tea.jpg',
    kits: kits[0]?.image_url || '/images/products/complete-kit.jpg',
  };

  const stepIcons = [MapPin, Sparkles, Package, Truck];

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Seedly',
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo/seedly-logo.jpg`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lahore',
      addressRegion: 'Punjab',
      addressCountry: 'PK',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.contact.phoneInternational,
      contactType: 'Customer Support',
      availableLanguage: ['English', 'Urdu'],
    },
  };

  return (
    <div className="bg-white text-neutral-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      {/* 1. HERO (TwoCol, items-center, py-16 md:py-20) */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12 gap-y-10 items-center">
            
            {/* Left Hero Column */}
            <div className="text-start max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] rtl:tracking-normal text-stone-500 mb-4 block">
                {content.hero.eyebrow}
              </span>
              <h1 className="font-heading font-medium text-4xl md:text-5xl lg:text-6xl text-neutral-900 tracking-tight leading-[1.05] mb-6">
                {content.hero.h1}
              </h1>
              <p className="text-lg md:text-xl text-stone-700 leading-relaxed mb-8 font-normal">
                {content.hero.lead}
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="/shop"
                  className="h-12 rounded-full px-7 bg-black hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center justify-center transition-colors shadow-xs"
                >
                  {content.hero.primaryCta}
                </Link>
                <Link
                  href="/find-your-seed"
                  className="h-12 rounded-full px-7 border border-black bg-white hover:bg-black hover:text-white text-neutral-900 font-semibold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center justify-center transition-colors shadow-xs"
                >
                  {content.hero.secondaryCta}
                </Link>
              </div>
            </div>

            {/* Right Hero Column: Left edge sits on the center gutter */}
            <div className="w-full">
              <div className="relative aspect-[5/4] w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-xs">
                <Image
                  src="/images/hero/seedly-hero-lifestyle.jpg"
                  alt="Seedly pumpkin seeds, sesame and chamomile on a kitchen table"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. WHY SEEDLY (Section, border-t, TwoCol) */}
      <section className="py-12 md:py-16 border-t border-stone-200">
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12 gap-y-10 items-start">
            
            {/* Left Column */}
            <div className="text-start">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] rtl:tracking-normal text-stone-500 mb-3 block">
                {content.whySeedly.eyebrow}
              </span>
              <h2 className="font-heading font-medium text-3xl sm:text-4xl text-neutral-900 tracking-tight leading-tight">
                {content.whySeedly.h2}
              </h2>
            </div>

            {/* Right Column: Left edge sits on the center gutter, matching hero image */}
            <div className="text-start text-lg text-stone-700 leading-relaxed space-y-5 font-normal">
              <p>{content.whySeedly.paragraph1}</p>
              <p>{content.whySeedly.paragraph2}</p>
              
              <div className="pt-2 flex items-center gap-3">
                {content.whySeedly.founderAvatar && (
                  <div className="relative h-10 w-10 rounded-full overflow-hidden bg-stone-200 border border-stone-300 shrink-0">
                    <Image
                      src={content.whySeedly.founderAvatar}
                      alt="Founder"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="font-medium text-neutral-900 text-sm">
                  {content.whySeedly.signature}
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. SOURCE TO POUCH (Section, border-t, full-bleed off-white band matching trust-strip) */}
      <section className="border-t border-stone-200 bg-[#FBFBFA] py-12 md:py-16">
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8">
          <h2 className="font-heading font-medium text-2xl sm:text-3xl text-neutral-900 tracking-tight mb-10 text-start">
            {content.sourceToPouch.h2}
          </h2>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Hairline connector across the top on lg */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute top-5 start-8 end-8 h-[1px] bg-stone-200/90 z-0 pointer-events-none"
            />

            {content.sourceToPouch.steps.map((stepItem, idx) => {
              const StepIcon = stepIcons[idx] || Sparkles;
              return (
                <div
                  key={stepItem.step}
                  className="relative z-10 flex flex-col text-start border-s border-stone-300 ps-5 sm:border-s-0 sm:ps-0"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full border border-stone-200 bg-white flex items-center justify-center text-neutral-900 shadow-xs shrink-0">
                      <StepIcon className="h-4.5 w-4.5 text-neutral-800" aria-hidden="true" />
                    </div>
                    <span className="font-mono font-bold text-xs tracking-wider text-kit-coral">
                      {stepItem.step}
                    </span>
                  </div>

                  <h3 className="font-heading font-medium text-lg text-neutral-900 tracking-tight mb-2">
                    {stepItem.title}
                  </h3>

                  <p className="text-sm text-stone-600 leading-relaxed font-normal">
                    {stepItem.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. COLLECTION (Section, border-t) */}
      <section className="py-12 md:py-16 border-t border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8">
          
          {/* Header Row */}
          <div className="flex items-baseline justify-between mb-8 sm:mb-10 text-start">
            <h2 className="font-heading font-medium text-2xl sm:text-3xl text-neutral-900 tracking-tight">
              {content.collection.h2}
            </h2>
            <Link
              href="/shop"
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-900 hover:text-black underline underline-offset-4 transition-colors"
            >
              {content.collection.shopAll}
            </Link>
          </div>

          {/* Desktop/Tablet 3-Card Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {content.collection.cards.map((card) => {
              const imgSrc = categoryImages[card.id];
              return (
                <div
                  key={card.id}
                  className="group flex flex-col text-start"
                >
                  <Link href={card.href} className="block group">
                    <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80 mb-4 shadow-xs">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={card.title}
                          fill
                          sizes="(max-width: 1024px) 33vw, 400px"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-100" />
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-col flex-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      {card.count}
                    </span>
                    <h3 className="font-heading font-medium text-xl text-neutral-900 tracking-tight mb-2">
                      <Link href={card.href} className="hover:underline underline-offset-2">
                        {card.title}
                      </Link>
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal mb-4 flex-1">
                      {card.description}
                    </p>
                    <Link
                      href={card.href}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-900 hover:text-black hover:underline underline-offset-4 group/link"
                    >
                      <span>{card.linkText}</span>
                      <ArrowRight className="h-4 w-4 rtl:-scale-x-100 transition-transform group-hover/link:translate-x-1 rtl:group-hover/link:-translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Snap Scroller (<md) */}
          <div className="md:hidden flex snap-x snap-mandatory gap-4 overflow-x-auto -mx-5 px-5 pb-4">
            {content.collection.cards.map((card) => {
              const imgSrc = categoryImages[card.id];
              return (
                <div
                  key={card.id}
                  className="w-[78%] shrink-0 snap-start flex flex-col text-start"
                >
                  <Link href={card.href} className="block group">
                    <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80 mb-3 shadow-xs">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={card.title}
                          fill
                          sizes="280px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-100" />
                      )}
                    </div>
                  </Link>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                    {card.count}
                  </span>
                  <h3 className="font-heading font-medium text-lg text-neutral-900 tracking-tight mb-1.5">
                    <Link href={card.href}>{card.title}</Link>
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-normal mb-3">
                    {card.description}
                  </p>
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 underline underline-offset-4"
                  >
                    <span>{card.linkText}</span>
                    <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. CLOSING CTA (full-bleed dark background matching announcement bar) */}
      <section className="bg-neutral-900 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <h2 className="font-heading font-medium text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              {content.closingCta.h2}
            </h2>
            <p className="text-sm sm:text-base text-stone-300 font-normal leading-relaxed">
              {content.closingCta.sub}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
              <Link
                href="/seeds"
                className="h-12 rounded-full px-7 bg-white text-neutral-900 hover:bg-stone-100 font-semibold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center justify-center transition-colors shadow-xs"
              >
                {content.closingCta.primaryCta}
              </Link>
              <Link
                href="/find-your-seed"
                className="h-12 rounded-full px-7 border border-white text-white hover:bg-white hover:text-neutral-900 font-semibold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center justify-center transition-colors shadow-xs"
              >
                {content.closingCta.secondaryCta}
              </Link>
            </div>
            <div className="pt-2">
              <a
                href={siteConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-stone-300 hover:text-white underline underline-offset-4 transition-colors"
              >
                {content.closingCta.whatsappCta}
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
