'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

export function EditorialCollections() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 bg-paper"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-end justify-between gap-5 mb-10 sm:mb-12">
        <div>
          <div className="rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-ink shadow-brutal-sm inline-block mb-3">
            ✦ Handpicked &amp; Fresh
          </div>
          <h2
            id="editorial-collections-heading"
            className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-ink leading-tight"
          >
            Find your everyday favourites.
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-medium text-muted-gray max-w-xs">
          Three pure categories. Sourced clean, hand-cleaned, and packed fresh in Lahore.
        </p>
      </div>

      {/* ASYMMETRICAL 3-CARD EDITORIAL LAYOUT */}
      <div className="space-y-6 sm:space-y-8">
        
        {/* TOP ROW: GREEN CARD (~58%) + YELLOW CARD (~40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* 01 / THE BASICS (RAW SEEDS) - LIME GREEN CARD */}
          <Link
            href="/seeds"
            aria-label="Explore Raw Seeds (4 products)"
            className={`lg:col-span-7 group relative flex flex-col justify-between rounded-[28px] sm:rounded-[32px] border-2 border-ink bg-seed-lime p-6 sm:p-8 min-h-[260px] sm:min-h-[300px] shadow-brutal hover:shadow-[6px_8px_0px_#14201A] origin-bottom-left transition-all duration-300 ease-out hover:-rotate-[1.5deg] hover:-translate-y-1 overflow-hidden ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-8 motion-reduce:opacity-100 motion-reduce:translate-x-0'
            }`}
            style={{ transitionProperty: 'opacity, transform, box-shadow' }}
          >
            {/* Subtle Vertical Divider through the middle matching design */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-1/2 w-[1px] bg-ink/15 pointer-events-none hidden sm:block"
            />

            {/* Inset Product Artwork preview on the right half */}
            <div
              aria-hidden="true"
              className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-40 sm:w-56 h-40 sm:h-56 rounded-[22px] border-2 border-ink/40 bg-white/40 overflow-hidden pointer-events-none transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
            >
              <Image
                src="/images/products/pumpkin-seeds.jpg"
                alt=""
                fill
                sizes="(max-width: 640px) 160px, 224px"
                className="object-cover opacity-85 group-hover:opacity-95 transition-opacity"
              />
              <div className="absolute inset-0 bg-seed-lime/20 mix-blend-multiply" />
            </div>

            {/* Upper Left: Eyebrow Tag */}
            <div className="relative z-10">
              <span className="font-heading font-black text-xs sm:text-sm tracking-wider uppercase text-ink">
                01 / THE BASICS
              </span>
            </div>

            {/* Lower Left: Interactive Product Label & Action Button */}
            <div className="relative z-10 mt-12 sm:mt-16 flex items-center gap-2.5 text-xs sm:text-sm font-black text-ink">
              <div className="overflow-hidden h-5 flex flex-col justify-center">
                <span className="transition-transform duration-300 group-hover:-translate-y-full block">
                  4 products
                </span>
                <span className="transition-transform duration-300 group-hover:-translate-y-full block text-ink underline underline-offset-4">
                  Explore seeds →
                </span>
              </div>
              <div className="h-6 w-6 rounded-full border border-ink flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-white">
                <ArrowUpRight className="h-3.5 w-3.5 text-ink stroke-[2.5]" />
              </div>
            </div>
          </Link>

          {/* TOP RIGHT: PALE YELLOW CARD - MOUNTAIN TEAS */}
          <Link
            href="/teas"
            aria-label="Explore Mountain Teas (3 products)"
            className={`lg:col-span-5 group relative flex flex-col justify-between rounded-[28px] sm:rounded-[32px] border-2 border-ink bg-tea-butter p-6 sm:p-8 min-h-[260px] sm:min-h-[300px] shadow-brutal hover:shadow-[6px_8px_0px_#14201A] origin-bottom-left transition-all duration-300 ease-out hover:-rotate-[1.5deg] hover:-translate-y-1 overflow-hidden ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-8 motion-reduce:opacity-100 motion-reduce:translate-x-0'
            }`}
            style={{
              transitionProperty: 'opacity, transform, box-shadow',
              transitionDelay: '100ms',
            }}
          >
            {/* Top Inset Rounded Rectangle preview box */}
            <div
              aria-hidden="true"
              className="relative w-full h-32 sm:h-36 rounded-[20px] sm:rounded-[22px] border-2 border-ink bg-white/50 overflow-hidden transition-transform duration-500 group-hover:scale-[1.02] group-hover:-rotate-1"
            >
              <Image
                src="/images/products/chamomile-tea.jpg"
                alt=""
                fill
                sizes="(max-width: 1023px) 100vw, 40vw"
                className="object-cover opacity-85 group-hover:opacity-95 transition-opacity"
              />
              <div className="absolute inset-0 bg-tea-butter/25 mix-blend-multiply" />
              <div className="absolute top-2.5 left-3 font-heading font-black text-[10px] tracking-wider uppercase text-ink bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-ink/40">
                02 / THE INFUSIONS
              </div>
            </div>

            {/* Bottom: Interactive Product Label & Action Button */}
            <div className="relative z-10 mt-5 flex items-center gap-2.5 text-xs sm:text-sm font-black text-ink">
              <div className="overflow-hidden h-5 flex flex-col justify-center">
                <span className="transition-transform duration-300 group-hover:-translate-y-full block">
                  3 products
                </span>
                <span className="transition-transform duration-300 group-hover:-translate-y-full block text-ink underline underline-offset-4">
                  Explore teas →
                </span>
              </div>
              <div className="h-6 w-6 rounded-full border border-ink flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-white">
                <ArrowUpRight className="h-3.5 w-3.5 text-ink stroke-[2.5]" />
              </div>
            </div>
          </Link>

        </div>

        {/* BOTTOM ROW: WIDE CORAL CARD OFFSET TO THE LEFT (~70% WIDTH) */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <Link
            href="/kits"
            aria-label="Explore Seed Kits (3 routine kits)"
            className={`lg:col-span-9 group relative flex items-center justify-between rounded-[28px] sm:rounded-[32px] border-2 border-ink bg-kit-coral p-6 sm:p-8 min-h-[160px] sm:min-h-[180px] shadow-brutal hover:shadow-[6px_8px_0px_#14201A] origin-bottom-left transition-all duration-300 ease-out hover:-rotate-[1.2deg] hover:-translate-y-1 overflow-hidden ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8 motion-reduce:opacity-100 motion-reduce:translate-y-0'
            }`}
            style={{
              transitionProperty: 'opacity, transform, box-shadow',
              transitionDelay: '200ms',
            }}
          >
            {/* Left Side: Eyebrow label and interactive product count */}
            <div className="flex flex-col justify-between h-full gap-4 z-10">
              <span className="font-heading font-black text-xs sm:text-sm tracking-wider uppercase text-ink">
                03 / TOGETHER
              </span>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black text-ink">
                <div className="overflow-hidden h-5 flex flex-col justify-center">
                  <span className="transition-transform duration-300 group-hover:-translate-y-full block">
                    3 routine kits
                  </span>
                  <span className="transition-transform duration-300 group-hover:-translate-y-full block text-ink underline underline-offset-4">
                    Explore kits →
                  </span>
                </div>
                <div className="h-6 w-6 rounded-full border border-ink flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-white">
                  <ArrowUpRight className="h-3.5 w-3.5 text-ink stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Right Side: Inset Rounded Square Preview Frame */}
            <div
              aria-hidden="true"
              className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-[20px] sm:rounded-[22px] border-2 border-ink bg-white/50 overflow-hidden shrink-0 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
            >
              <Image
                src="/images/products/complete-kit.jpg"
                alt=""
                fill
                sizes="(max-width: 640px) 112px, 144px"
                className="object-cover opacity-85 group-hover:opacity-95 transition-opacity"
              />
              <div className="absolute inset-0 bg-kit-coral/25 mix-blend-multiply" />
            </div>
          </Link>
        </div>

      </div>
    </section>
  );
}

export default EditorialCollections;
