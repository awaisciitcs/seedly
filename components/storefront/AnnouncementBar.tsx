import React from 'react';
import { Truck, MessageCircle } from 'lucide-react';

import { siteConfig } from '../../lib/config';

export function AnnouncementBar() {
  return (
    <div className="bg-seedly-dark text-white text-xs py-2 px-4 border-b border-seedly-forest/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left note */}
        <div className="hidden sm:flex items-center gap-2 text-seedly-light font-medium text-[11px]">
          <span>Dispatched from Lahore to all cities in Pakistan</span>
        </div>

        {/* Center message */}
        <div className="flex-1 sm:flex-initial text-center sm:text-left flex items-center justify-center gap-2">
          <Truck className="w-3.5 h-3.5 text-amber-300" />
          <span>
            <strong>Free nationwide delivery</strong> on all orders of Rs. 2,500 or more
          </span>
        </div>

        {/* Right WhatsApp */}
        <div className="hidden md:flex items-center gap-3 text-seedly-light/90 text-[11px]">
          <a
            href={`${siteConfig.contact.whatsappUrl}?text=${encodeURIComponent('Hi Seedly, I have a question.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Helpline: {siteConfig.contact.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementBar;
