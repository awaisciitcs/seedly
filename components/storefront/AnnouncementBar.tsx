'use client';

import React from 'react';
import Link from 'next/link';

export function AnnouncementBar() {
  return (
    <aside
      aria-label="Store Announcements"
      className="relative bg-neutral-900 text-white/90 py-2 border-b border-neutral-800 z-50 select-none"
    >
      <div className="sr-only">
        Free nationwide delivery across Pakistan on orders of Rs. 2,500+. Cash on delivery, JazzCash, and Easypaisa accepted. Questions? WhatsApp 0371 9055758.
      </div>

      {/* Desktop (lg and up): Static row inside Container, justify-between, 3 items */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8 flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase text-white/90">
          <Link href="/shipping" className="hover:text-white transition-colors">
            Free delivery over Rs. 2,500
          </Link>
          <span className="text-white/70">COD · JazzCash · Easypaisa</span>
          <a
            href="https://wa.me/923719055758?text=Hi%20Seedly%2C%20I%20have%20a%20question%20about%20your%20products."
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            WhatsApp helpline: 0371 9055758
          </a>
        </div>
      </div>

      {/* Mobile & Tablet (<lg): Marquee ticker, stops under prefers-reduced-motion */}
      <div className="block lg:hidden overflow-hidden">
        <div
          className="marquee-track motion-reduce:animate-none flex whitespace-nowrap text-[10px] sm:text-[11px] font-semibold tracking-[0.14em] uppercase"
          aria-hidden="true"
        >
          {Array.from({ length: 4 }).map((_, idx) => (
            <span key={idx} className="flex items-center gap-6 px-4">
              <Link href="/shipping" className="hover:underline transition-all">
                Free delivery over Rs. 2,500
              </Link>
              <span className="text-stone-400">✦</span>
              <span>COD · JazzCash · Easypaisa</span>
              <span className="text-stone-400">✦</span>
              <a
                href="https://wa.me/923719055758?text=Hi%20Seedly%2C%20I%20have%20a%20question%20about%20your%20products."
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline transition-all"
              >
                WhatsApp helpline: 0371 9055758
              </a>
              <span className="text-stone-400">✦</span>
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default AnnouncementBar;
