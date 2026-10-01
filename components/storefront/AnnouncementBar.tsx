'use client';

import React from 'react';
import Link from 'next/link';

export function AnnouncementBar() {
  const tickerText = 'FREE NATIONWIDE DELIVERY ON RS. 2,500+ ✦ CASH ON DELIVERY ✦ JAZZCASH ✦ EASYPAISA ✦ QUESTIONS? WHATSAPP 0371 9055758 ✦';

  return (
    <aside
      aria-label="Store Announcements"
      className="relative bg-ink text-seed-lime py-2.5 overflow-hidden select-none border-b-2 border-ink z-50"
    >
      <div className="sr-only">
        Free nationwide delivery across Pakistan on orders of Rs. 2,500+. Cash on delivery, JazzCash, and EasyPaisa accepted. Questions? WhatsApp 0371 9055758.
      </div>
      <div className="marquee-track flex whitespace-nowrap text-[11px] sm:text-xs font-bold tracking-[0.14em] uppercase" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, idx) => (
          <span key={idx} className="flex items-center gap-6 px-4">
            <Link href="/shipping" className="hover:underline transition-all">
              FREE NATIONWIDE DELIVERY ON RS. 2,500+
            </Link>
            <span className="text-white/60">✦</span>
            <span>CASH ON DELIVERY</span>
            <span className="text-white/60">✦</span>
            <span>JAZZCASH</span>
            <span className="text-white/60">✦</span>
            <span>EASYPAISA</span>
            <span className="text-white/60">✦</span>
            <a
              href="https://wa.me/923719055758?text=Hi%20Seedly%2C%20I%20have%20a%20question%20about%20your%20products."
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline transition-all"
            >
              QUESTIONS? WHATSAPP 0371 9055758
            </a>
            <span className="text-white/60">✦</span>
          </span>
        ))}
      </div>
    </aside>
  );
}

export default AnnouncementBar;

