'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Star, ArrowUpRight, Instagram } from 'lucide-react';
import Link from 'next/link';

interface ReviewItem {
  id: string;
  categoryTag: string;
  rating: number;
  text: string;
  author: string;
  location: string;
}

const reviewSets: ReviewItem[][] = [
  // Set 1 (Default)
  [
    {
      id: 'rev-1',
      categoryTag: 'SEED ROUTINE KIT',
      rating: 5,
      text: 'Clean seeds, noticeable energy within two weeks. The scoop and cycle schedule made this effortless to stick to every morning.',
      author: 'Fatima K.',
      location: 'Lahore',
    },
    {
      id: 'rev-2',
      categoryTag: 'MOUNTAIN CHAMOMILE',
      rating: 5,
      text: 'Whole dried flower blossoms that brew into real golden chamomile. Nothing from the supermarket compares in fragrance or purity.',
      author: 'Zainab M.',
      location: 'Islamabad',
    },
    {
      id: 'rev-3',
      categoryTag: 'RAW PUMPKIN SEEDS',
      rating: 5,
      text: 'Fresh, plump seeds with lot dates stamped on every pouch. Dispatched to Karachi in two days and perfectly sealed.',
      author: 'Bilal A.',
      location: 'Karachi',
    },
  ],
  // Set 2
  [
    {
      id: 'rev-4',
      categoryTag: 'COLD-MILLED FLAX',
      rating: 5,
      text: 'Extremely fresh golden flax. You can tell it has not been sitting in a warm warehouse for months. A daily breakfast staple.',
      author: 'Mariam H.',
      location: 'Rawalpindi',
    },
    {
      id: 'rev-5',
      categoryTag: 'FOLLICULAR BLEND',
      rating: 5,
      text: 'The packaging and instructions are so thoughtful. Started seed cycling last month and my cycle has never felt more regular.',
      author: 'Dr. Ayesha S.',
      location: 'Lahore',
    },
    {
      id: 'rev-6',
      categoryTag: 'SPEARMINT TEA',
      rating: 5,
      text: 'Real mountain leaves with a soothing natural sweetness. Best evening tisane after dinner. Will definitely reorder.',
      author: 'Usman T.',
      location: 'Peshawar',
    },
  ],
  // Set 3
  [
    {
      id: 'rev-7',
      categoryTag: 'LUTEAL BLEND',
      rating: 5,
      text: 'Sunflower and sesame blend in exact portions. Clean, raw, and delivered fresh to my doorstep in Faisalabad.',
      author: 'Hina B.',
      location: 'Faisalabad',
    },
    {
      id: 'rev-8',
      categoryTag: 'COMPLETE CYCLE KIT',
      rating: 5,
      text: 'Everything in one tidy box with printed instructions. Truly Lahore’s best wellness pantry. Highly recommended!',
      author: 'Sadia N.',
      location: 'Lahore',
    },
    {
      id: 'rev-9',
      categoryTag: 'HIGHLAND GREEN TEA',
      rating: 5,
      text: 'Loose whole green leaves from northern valleys. Clear infusion with zero bitterness. Simply exceptional.',
      author: 'Hamza Q.',
      location: 'Multan',
    },
  ],
  // Set 4
  [
    {
      id: 'rev-10',
      categoryTag: 'RAW SESAME SEEDS',
      rating: 5,
      text: 'Unroasted, pure sesame seeds with clean aroma. Perfect for our homemade sourdough and salad dressings.',
      author: 'Khadija W.',
      location: 'Sialkot',
    },
    {
      id: 'rev-11',
      categoryTag: 'CYCLE ROUTINE GUIDE',
      rating: 5,
      text: 'The printed guide in the kit answered every question. So grateful to have authentic raw seeds readily available in Pakistan.',
      author: 'Farah E.',
      location: 'Karachi',
    },
    {
      id: 'rev-12',
      categoryTag: 'RAW SUNFLOWER SEEDS',
      rating: 5,
      text: 'Crunchy and naturally sweet. Packed in resealable moisture-proof pouches. Love supporting independent local pantry shops.',
      author: 'Taimur R.',
      location: 'Islamabad',
    },
  ],
  // Set 5
  [
    {
      id: 'rev-13',
      categoryTag: '28-DAY CYCLE BOX',
      rating: 5,
      text: 'Three months of continuous routine kits and I feel balanced and energized. Customer support on WhatsApp is wonderfully attentive.',
      author: 'Noreen P.',
      location: 'Lahore',
    },
    {
      id: 'rev-14',
      categoryTag: 'MOUNTAIN TISANE',
      rating: 5,
      text: 'Caffeine-free and packed with whole aromatic botanicals. Our family replaced regular evening chai with Seedly’s chamomile.',
      author: 'Adeel K.',
      location: 'Quetta',
    },
    {
      id: 'rev-15',
      categoryTag: 'PANTRY PACKS',
      rating: 5,
      text: 'Generous 250g and 500g pouches with clearly marked harvest dates. High quality agricultural produce.',
      author: 'Mahnoor Z.',
      location: 'Gujranwala',
    },
  ],
];

export function TestimonialCarousel() {
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const activeReviews = reviewSets[activeSetIndex];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="testimonials-heading"
      className="relative bg-[#F5F5F4] border-y border-gray-200/90 py-14 sm:py-20 select-none overflow-hidden transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Eyebrow Pill */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 sm:mb-12">
          <div className="rounded-full border border-gray-200/90 bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-stone-900 shadow-xs inline-flex items-center gap-1.5">
            <span>✦</span>
            <span>COMMUNITY FEEDBACK</span>
          </div>

          <h2 id="testimonials-heading" className="sr-only">
            Customer Testimonials &amp; Reviews
          </h2>

          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-stone-700 hidden sm:block">
            Verified Pantry Stories Across Pakistan
          </p>
        </div>

        {/* THREE TESTIMONIAL CARDS (WHITE, OBSIDIAN FOCAL, WHITE) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center pt-2 pb-10">
          
          {/* LEFT CARD (WHITE, TILTED COUNTERCLOCKWISE -3.5°) */}
          <article
            className={`group relative rounded-[24px] sm:rounded-[28px] border border-gray-200/90 bg-white p-6 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out cursor-default transform md:-rotate-[3.5deg] hover:md:-rotate-[1deg] hover:-translate-y-2 hover:z-20 min-h-[250px] flex flex-col justify-between ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-8 motion-reduce:opacity-100 motion-reduce:translate-x-0'
            }`}
          >
            <div>
              {/* Category Eyebrow */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-heading font-black text-[11px] tracking-wider uppercase text-stone-900 opacity-80">
                  {activeReviews[0].categoryTag}
                </span>
              </div>

              {/* 5 Amber Stars */}
              <div className="flex items-center gap-1 mb-3 text-amber-500">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400 stroke-none" />
                ))}
              </div>

              {/* Review Text */}
              <p className="font-sans text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                &ldquo;{activeReviews[0].text}&rdquo;
              </p>
            </div>

            {/* Attribution */}
            <div className="mt-5 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-bold text-stone-900">
              <span>{activeReviews[0].author}</span>
              <span className="text-stone-500 uppercase text-[11px]">{activeReviews[0].location}</span>
            </div>
          </article>

          {/* MIDDLE CARD (OBSIDIAN BLACK FOCAL CARD, TILTED CLOCKWISE +3.5°) */}
          <article
            className={`group relative rounded-[24px] sm:rounded-[28px] border border-gray-200/90 bg-[#111827] text-white p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.14)] transition-all duration-300 ease-out cursor-default transform md:rotate-[3.5deg] hover:md:rotate-[1deg] hover:-translate-y-2.5 hover:z-20 min-h-[270px] flex flex-col justify-between z-10 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8 motion-reduce:opacity-100 motion-reduce:translate-y-0'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <div>
              {/* Category Eyebrow */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-heading font-black text-[11px] tracking-wider uppercase text-white opacity-90">
                  {activeReviews[1].categoryTag}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs">
                  ★ Top Pick
                </span>
              </div>

              {/* 5 Amber Stars */}
              <div className="flex items-center gap-1 mb-3 text-amber-400">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400 stroke-none" />
                ))}
              </div>

              {/* Review Text */}
              <p className="font-sans text-xs sm:text-sm text-white/95 leading-relaxed font-semibold">
                &ldquo;{activeReviews[1].text}&rdquo;
              </p>
            </div>

            {/* Attribution */}
            <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-bold text-white">
              <span>{activeReviews[1].author}</span>
              <span className="text-white/70 uppercase text-[11px]">{activeReviews[1].location}</span>
            </div>
          </article>

          {/* RIGHT CARD (WHITE, TILTED COUNTERCLOCKWISE -2.5°) */}
          <article
            className={`group relative rounded-[24px] sm:rounded-[28px] border border-gray-200/90 bg-white p-6 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out cursor-default transform md:-rotate-[2.5deg] hover:md:-rotate-[0.5deg] hover:-translate-y-2 hover:z-20 min-h-[250px] flex flex-col justify-between ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-8 motion-reduce:opacity-100 motion-reduce:translate-x-0'
            }`}
            style={{ transitionDelay: '180ms' }}
          >
            <div>
              {/* Category Eyebrow */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-heading font-black text-[11px] tracking-wider uppercase text-stone-900 opacity-80">
                  {activeReviews[2].categoryTag}
                </span>
              </div>

              {/* 5 Amber Stars */}
              <div className="flex items-center gap-1 mb-3 text-amber-500">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400 stroke-none" />
                ))}
              </div>

              {/* Review Text */}
              <p className="font-sans text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                &ldquo;{activeReviews[2].text}&rdquo;
              </p>
            </div>

            {/* Attribution */}
            <div className="mt-5 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-bold text-stone-900">
              <span>{activeReviews[2].author}</span>
              <span className="text-stone-500 uppercase text-[11px]">{activeReviews[2].location}</span>
            </div>
          </article>

        </div>

        {/* BOTTOM NAVIGATION ROW: 6 ROUNDED TILES (5 SETS + 1 INSTAGRAM CALL-TO-ACTION) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 pt-4">
          
          {/* Tiles 1 through 5: Selectable Review Sets */}
          {reviewSets.map((_, idx) => {
            const isActive = activeSetIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSetIndex(idx)}
                aria-label={`View review set ${idx + 1}`}
                aria-pressed={isActive}
                className={`h-16 sm:h-20 rounded-[18px] sm:rounded-[22px] border border-gray-200/90 transition-all duration-200 flex flex-col items-center justify-center p-2 cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-black text-white -translate-y-0.5 shadow-sm'
                    : 'bg-white text-stone-700 hover:bg-stone-50 hover:text-black hover:-translate-y-0.5'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">
                  0{idx + 1}
                </span>
                <span className="text-[10px] font-medium uppercase opacity-75">
                  Story
                </span>
              </button>
            );
          })}

          {/* Tile 6: Warm Amber "Tag us to be featured" Call to Action */}
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tag us on Instagram to be featured"
            className="group h-16 sm:h-20 rounded-[18px] sm:rounded-[22px] border border-amber-600/40 bg-[#D97706] p-2.5 sm:p-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center text-white cursor-pointer"
          >
            <div className="flex items-center gap-1 font-heading font-bold text-xs sm:text-[13px] leading-tight text-white group-hover:underline underline-offset-2">
              <span>Tag us to be featured</span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-medium text-white/90 mt-0.5">
              @seedly.pk
            </span>
          </a>

        </div>

      </div>
    </section>
  );
}

export default TestimonialCarousel;
