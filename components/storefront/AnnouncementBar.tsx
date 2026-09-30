'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { siteConfig } from '../../lib/config';

interface Announcement {
  id: string;
  text: string;
  href: string;
}

const announcements: Announcement[] = [
  {
    id: 'shipping',
    text: `Free nationwide delivery across Pakistan on orders of Rs. ${siteConfig.shipping.freeThreshold.toLocaleString('en-PK')}+`,
    href: '/shipping',
  },
  {
    id: 'origin',
    text: 'Raw pantry seeds & high-altitude herbal teas — clean, whole, & fresh-packed in Lahore',
    href: '/shop',
  },
  {
    id: 'support',
    text: `Questions about seed routines? WhatsApp our helpline: ${siteConfig.contact.phone}`,
    href: `${siteConfig.contact.whatsappUrl}?text=${encodeURIComponent('Hi Seedly, I have a question about your seed routines.')}`,
  },
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (index: number) => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsFading(false);
    }, 150);
  };

  const next = () => {
    goTo((currentIndex + 1) % announcements.length);
  };

  const prev = () => {
    goTo((currentIndex - 1 + announcements.length) % announcements.length);
  };

  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      next();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused]);

  const current = announcements[currentIndex];

  return (
    <aside
      aria-label="Store Announcements"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="relative bg-seedly-dark text-cream px-3 py-2 text-center text-[11px] leading-5 tracking-wide sm:text-xs select-none"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous announcement"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-cream/70 hover:text-white focus:outline-none focus:ring-1 focus:ring-cream/50 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        <div className="flex-1 overflow-hidden px-1">
          <Link
            href={current.href}
            className={`block truncate transition-opacity duration-150 hover:text-white ${
              isFading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {current.text}
          </Link>
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="Next announcement"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-cream/70 hover:text-white focus:outline-none focus:ring-1 focus:ring-cream/50 transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Accessible dot indicators */}
      <div className="flex justify-center items-center gap-1.5 pt-0.5" role="tablist" aria-label="Announcement slides">
        {announcements.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={idx === currentIndex}
            aria-label={`Slide ${idx + 1}`}
            onClick={() => goTo(idx)}
            className={`h-1 rounded-full transition-all duration-200 ${
              idx === currentIndex ? 'w-4 bg-white' : 'w-1 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </aside>
  );
}

export default AnnouncementBar;
