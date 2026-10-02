'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

export function EditorialCollections() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Trigger sequential staggered entrance once in viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="editorial-collections-heading"
      className="max-w-7xl mx-auto w-full px-5 md:px-8 py-12 md:py-16 bg-white"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 text-start">
        <div>
          <span className="rounded-full border border-stone-200 bg-[#FBFBFA] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-800 shadow-xs inline-block mb-3">
            ✦ Handpicked &amp; Fresh
          </span>
          <h2
            id="editorial-collections-heading"
            className="font-heading font-medium text-2xl sm:text-3xl lg:text-4xl text-neutral-900 tracking-tight leading-tight"
          >
            Find your everyday favourites
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 max-w-sm font-normal">
          Three pure pantry categories. Sourced directly from growers, hand-cleaned, and packed fresh in Lahore.
        </p>
      </div>

      {/* 3-CARD EDITORIAL GRID */}
      <div className="space-y-6 sm:space-y-8">
        
        {/* TOP ROW: CARD 1 (RAW SEEDS - 7 cols) + CARD 2 (MOUNTAIN TEAS - 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* 01 / THE BASICS (RAW SEEDS) */}
          <Link
            href="/seeds"
            aria-label="Explore Raw Seeds (4 products)"
            className={`lg:col-span-7 group relative flex flex-col justify-between rounded-2xl border border-stone-200 bg-[#FBFBFA] p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] origin-bottom-left transition-all duration-300 ease-out hover:-rotate-[1.5deg] hover:-translate-y-1.5 text-start overflow-hidden ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-6 motion-reduce:opacity-100 motion-reduce:translate-x-0'
            }`}
            style={{ transitionProperty: 'opacity, transform, box-shadow' }}
          >
            {/* Top row: Eyebrow + Count */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="font-heading font-semibold text-xs tracking-wider uppercase text-neutral-900">
                01 / THE BASICS
              </span>
              <span className="text-[11px] font-medium text-stone-600 bg-white border border-stone-200 rounded-full px-2.5 py-0.5 shadow-xs">
                4 products
              </span>
            </div>

            {/* Middle body: Text Content + Inset Thumbnail */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-auto py-2">
              <div className="sm:col-span-7 space-y-2.5">
                <h3 className="font-heading font-medium text-2xl sm:text-3xl text-neutral-900 tracking-tight leading-snug">
                  Raw Pantry Seeds
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                  Whole and cold-milled pumpkin, sunflower, sesame, and golden flaxseed. Cleaned by hand and sealed fresh in Lahore without salt or roasting.
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-medium text-stone-600 bg-white border border-stone-200/80 rounded-md px-2 py-0.5">Flax</span>
                  <span className="text-[11px] font-medium text-stone-600 bg-white border border-stone-200/80 rounded-md px-2 py-0.5">Pumpkin</span>
                  <span className="text-[11px] font-medium text-stone-600 bg-white border border-stone-200/80 rounded-md px-2 py-0.5">Sunflower</span>
                  <span className="text-[11px] font-medium text-stone-600 bg-white border border-stone-200/80 rounded-md px-2 py-0.5">Sesame</span>
                </div>
              </div>

              <div className="sm:col-span-5 flex justify-center sm:justify-end">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-xl border border-stone-200 bg-white overflow-hidden shrink-0 shadow-xs transition-transform duration-500 group-hover:scale-105">
                  <Image
                    src="/images/products/pumpkin-seeds.jpg"
                    alt="Raw pumpkin seeds in bowl"
                    fill
                    sizes="(max-width: 640px) 144px, 176px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Bottom: Action Link */}
            <div className="pt-4 border-t border-stone-200/70 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-900 group-hover:underline underline-offset-4">
                Explore raw seeds
              </span>
              <div className="h-8 w-8 rounded-full border border-stone-300 bg-white group-hover:bg-black group-hover:border-black group-hover:text-white flex items-center justify-center transition-all shadow-xs">
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>
          </Link>

          {/* 02 / THE INFUSIONS (MOUNTAIN TEAS) */}
          <Link
            href="/teas"
            aria-label="Explore Mountain Teas (3 products)"
            className={`lg:col-span-5 group relative flex flex-col justify-between rounded-2xl border border-stone-200 bg-[#FBFBFA] p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] origin-bottom-left transition-all duration-300 ease-out hover:-rotate-[1.5deg] hover:-translate-y-1.5 text-start overflow-hidden ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-6 motion-reduce:opacity-100 motion-reduce:translate-x-0'
            }`}
            style={{
              transitionProperty: 'opacity, transform, box-shadow',
              transitionDelay: '100ms',
            }}
          >
            {/* Top Inset Preview Image with Badge */}
            <div className="relative w-full h-36 sm:h-40 rounded-xl border border-stone-200 bg-white overflow-hidden shadow-xs transition-transform duration-500 group-hover:scale-[1.02]">
              <Image
                src="/images/products/chamomile-tea.jpg"
                alt="Whole chamomile flowers tisane"
                fill
                sizes="(max-width: 1023px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute top-3 start-3 font-heading font-semibold text-[11px] tracking-wider uppercase text-neutral-900 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full border border-stone-200 shadow-xs">
                02 / THE INFUSIONS
              </div>
              <div className="absolute bottom-3 end-3 text-[11px] font-medium text-neutral-900 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-stone-200 shadow-xs">
                3 products
              </div>
            </div>

            {/* Middle Content */}
            <div className="py-4 space-y-2">
              <h3 className="font-heading font-medium text-xl sm:text-2xl text-neutral-900 tracking-tight leading-snug">
                Mountain Teas &amp; Tisanes
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                Whole-flower chamomile and cut highland spearmint harvested from northern valleys. Naturally caffeine-free and soothing.
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-medium text-stone-600 bg-white border border-stone-200/80 rounded-md px-2 py-0.5">Chamomile Blossom</span>
                <span className="text-[11px] font-medium text-stone-600 bg-white border border-stone-200/80 rounded-md px-2 py-0.5">Spearmint Leaf</span>
              </div>
            </div>

            {/* Bottom: Action Link */}
            <div className="pt-3 border-t border-stone-200/70 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-900 group-hover:underline underline-offset-4">
                Explore mountain teas
              </span>
              <div className="h-8 w-8 rounded-full border border-stone-300 bg-white group-hover:bg-black group-hover:border-black group-hover:text-white flex items-center justify-center transition-all shadow-xs">
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>
          </Link>

        </div>

        {/* BOTTOM ROW: CARD 3 (ROUTINE KITS - FULL CONTAINER WIDTH) */}
        <div>
          <Link
            href="/kits"
            aria-label="Explore Seed Kits (3 routine kits)"
            className={`w-full group relative flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-stone-200 bg-[#FBFBFA] p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] origin-bottom-left transition-all duration-300 ease-out hover:-rotate-[1.2deg] hover:-translate-y-1.5 text-start overflow-hidden ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6 motion-reduce:opacity-100 motion-reduce:translate-y-0'
            }`}
            style={{
              transitionProperty: 'opacity, transform, box-shadow',
              transitionDelay: '150ms',
            }}
          >
            {/* Left Content Column */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-heading font-semibold text-xs tracking-wider uppercase text-neutral-900">
                  03 / TOGETHER
                </span>
                <span className="text-[11px] font-medium text-stone-600 bg-white border border-stone-200 rounded-full px-2.5 py-0.5 shadow-xs">
                  3 routine boxes
                </span>
              </div>

              <h3 className="font-heading font-medium text-2xl sm:text-3xl text-neutral-900 tracking-tight leading-snug">
                Curated Seed Routine Kits
              </h3>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal max-w-2xl">
                Pre-measured 14-day and 28-day routine boxes for follicular and luteal cycles. Complete with whole seeds, schedule guidelines, and resealable storage pouches.
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-medium text-stone-600 bg-white border border-stone-200/80 rounded-md px-2 py-0.5">Follicular Kit</span>
                <span className="text-[11px] font-medium text-stone-600 bg-white border border-stone-200/80 rounded-md px-2 py-0.5">Luteal Kit</span>
                <span className="text-[11px] font-medium text-stone-600 bg-white border border-stone-200/80 rounded-md px-2 py-0.5">Complete Cycle Kit</span>
              </div>

              {/* Action row */}
              <div className="pt-3 flex items-center gap-3">
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-900 group-hover:underline underline-offset-4">
                  Explore routine kits
                </span>
                <div className="h-8 w-8 rounded-full border border-stone-300 bg-white group-hover:bg-black group-hover:border-black group-hover:text-white flex items-center justify-center transition-all shadow-xs">
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Right Artwork Column */}
            <div className="w-full sm:w-64 md:w-80 h-44 sm:h-48 rounded-xl border border-stone-200 bg-white overflow-hidden shrink-0 shadow-xs transition-transform duration-500 group-hover:scale-105">
              <div className="relative w-full h-full">
                <Image
                  src="/images/products/complete-kit.jpg"
                  alt="Complete seed routine kit packaging"
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover"
                />
              </div>
            </div>
          </Link>
        </div>

      </div>
    </section>
  );
}

export default EditorialCollections;
