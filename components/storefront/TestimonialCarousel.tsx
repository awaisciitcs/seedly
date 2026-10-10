'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Star, ArrowUpRight, Instagram } from 'lucide-react';
import Link from 'next/link';
import { useSiteContent } from './SiteContentProvider';
import type { SiteContent } from '@/lib/cms/storefront-types';
import type { Review } from '@/lib/types';

interface ReviewItem {
  id: string;
  categoryTag: string;
  rating: number;
  text: string;
  author: string;
  location: string;
}



export function TestimonialCarousel({initialReviews,unavailable=false}:{initialReviews:Review[];unavailable?:boolean}) {
 const {config:siteConfig,features,testimonials}=useSiteContent<SiteContent>('site');
 const reviewSets:ReviewItem[][]=[];
 for(let i=0;i<initialReviews.length;i+=3)reviewSets.push(initialReviews.slice(i,i+3).map(review=>({id:review.id,categoryTag:review.product_name,rating:review.rating,text:review.body,author:review.customer_name,location:''})));

  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const activeReviews = reviewSets[activeSetIndex] || reviewSets[0] || [];
 useEffect(()=>{setActiveSetIndex(index=>Math.min(index,Math.max(0,Math.ceil(initialReviews.length/3)-1)));},[initialReviews]);

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
  }, [features.reviews,initialReviews.length]);

  if(!features.reviews)return null;
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
            <span>{testimonials.eyebrow}</span>
          </div>

          <h2 id="testimonials-heading" className="sr-only">
            {testimonials.title}
          </h2>

          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-stone-700 hidden sm:block">
            {testimonials.subtitle}
          </p>
        </div>

        {!activeReviews.length && <p role="status" className="py-8 text-center text-sm text-stone-600">{unavailable?testimonials.unavailable:testimonials.empty}</p>}
        {/* THREE TESTIMONIAL CARDS (WHITE, OBSIDIAN FOCAL, WHITE) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center pt-2 pb-10">
          
          {/* LEFT CARD (WHITE, TILTED COUNTERCLOCKWISE -3.5°) */}
          {activeReviews[0] && (<article
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
                  <Star key={idx} className={idx < activeReviews[0].rating ? "h-4 w-4 fill-amber-400 text-amber-400 stroke-none" : "h-4 w-4 fill-gray-200 text-gray-200 stroke-none"} />
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
          </article>)}

          {/* MIDDLE CARD (OBSIDIAN BLACK FOCAL CARD, TILTED CLOCKWISE +3.5°) */}
          {activeReviews[1] && (<article
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
                  <Star key={idx} className={idx < activeReviews[1].rating ? "h-4 w-4 fill-amber-400 text-amber-400 stroke-none" : "h-4 w-4 fill-gray-200 text-gray-200 stroke-none"} />
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
          </article>)}

          {/* RIGHT CARD (WHITE, TILTED COUNTERCLOCKWISE -2.5°) */}
          {activeReviews[2] && (<article
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
                  <Star key={idx} className={idx < activeReviews[2].rating ? "h-4 w-4 fill-amber-400 text-amber-400 stroke-none" : "h-4 w-4 fill-gray-200 text-gray-200 stroke-none"} />
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
          </article>)}

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
                  {testimonials.reviewLabel}
                </span>
              </button>
            );
          })}

          {/* Tile 6: Warm Amber "Tag us to be featured" Call to Action */}
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tag us on Instagram to be featured"
            className="group h-16 sm:h-20 rounded-[18px] sm:rounded-[22px] border border-amber-600/40 bg-[#D97706] p-2.5 sm:p-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center text-white cursor-pointer"
          >
            <div className="flex items-center gap-1 font-heading font-bold text-xs sm:text-[13px] leading-tight text-white group-hover:underline underline-offset-2">
              <span>{testimonials.instagramLabel}</span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-medium text-white/90 mt-0.5">
              {testimonials.instagramHandle}
            </span>
          </a>

        </div>

      </div>
    </section>
  );
}

export default TestimonialCarousel;
