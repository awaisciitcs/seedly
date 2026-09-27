import React from 'react';
import Link from 'next/link';
import { Truck, Sparkles, Phone } from 'lucide-react';

export function AnnouncementBar() {
  return (
    <div className="bg-seedly-dark text-white text-xs py-2 px-4 border-b border-seedly-forest/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left note */}
        <div className="hidden sm:flex items-center gap-2 text-seedly-light font-medium">
          <Sparkles className="w-3.5 h-3.5 text-seedly-primary" />
          <span>Pakistan's First Heirloom Seed & Herbal Tea Apothecary</span>
        </div>

        {/* Center message */}
        <div className="flex-1 sm:flex-initial text-center sm:text-left flex items-center justify-center gap-2">
          <Truck className="w-3.5 h-3.5 text-amber-300" />
          <span>
            <strong>Free delivery nationwide</strong> on all orders over Rs. 2,500
          </span>
        </div>

        {/* Right WhatsApp / Contact */}
        <div className="hidden md:flex items-center gap-4 text-seedly-light/90">
          <a
            href="https://wa.me/923001234567"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>WhatsApp Helpline: +92 300 1234567</span>
          </a>
          <span className="text-white/20">|</span>
          <Link href="/admin/login" className="hover:text-white transition-colors text-[11px] underline">
            Staff Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
