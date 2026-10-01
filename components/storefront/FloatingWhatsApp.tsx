'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export function FloatingWhatsApp() {
  return (
    <aside
      aria-label="WhatsApp customer assistance"
      className="fixed bottom-6 right-6 z-40"
    >
      <a
        href="https://wa.me/923719055758?text=Hi%20Seedly%2C%20I%20have%20a%20question%20about%20your%20products."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Seedly customer support on WhatsApp (0371 9055758)"
        className="group flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 border-ink bg-seed-lime text-ink shadow-brutal transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8 transition-transform group-hover:scale-110" aria-hidden="true" />
        <span className="sr-only">Chat on WhatsApp</span>
      </a>
    </aside>
  );
}

export default FloatingWhatsApp;
