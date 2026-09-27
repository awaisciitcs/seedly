'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SeedlyLogo } from '../ui/SeedlyLogo';
import { Mail, CheckCircle2, ShieldCheck, Heart, Sparkles, MapPin, Phone } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-seedly-dark text-cream border-t border-seedly-forest/40 pt-16 pb-24 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-seedly-light/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <SeedlyLogo size="lg" textColor="text-white" />
            <p className="text-sm text-seedly-light/80 leading-relaxed max-w-sm">
              Rooted in nature. Made for modern Pakistani life. We curate heirloom, cold-milled seeds and whole flower mountain teas to nurture daily hormonal balance and grounding wellness rituals.
            </p>

            <div className="pt-2 space-y-2 text-xs text-seedly-light/70">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-seedly-primary" />
                <span>Dispatched daily from Lahore & Karachi to all cities in Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-seedly-primary" />
                <span>Customer Care: +92 300 1234567 (Mon–Sat, 10am–7pm PKT)</span>
              </div>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white/90">Catalog</h4>
            <ul className="space-y-2 text-sm text-seedly-light/80">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href="/seeds" className="hover:text-white transition-colors">
                  Heirloom Seeds
                </Link>
              </li>
              <li>
                <Link href="/kits" className="hover:text-white transition-colors">
                  Curated Seed Kits
                </Link>
              </li>
              <li>
                <Link href="/teas" className="hover:text-white transition-colors">
                  Mountain Herbal Teas
                </Link>
              </li>
              <li>
                <Link href="/find-your-seed" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Find Your Seed Quiz</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Brand & Support */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white/90">Customer Care</h4>
            <ul className="space-y-2 text-sm text-seedly-light/80">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Story & Sourcing
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Shipping & Delivery Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  7-Day Return Guarantee
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact & WhatsApp
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white/90">Stay Close to Nature</h4>
            <p className="text-xs text-seedly-light/80 leading-relaxed">
              Receive gentle wellness guides, seasonal harvest updates, and natural cycle living inspiration.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-seedly-forest rounded-xl text-xs text-seedly-light">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Thank you! Welcome to the Seedly botanical circle.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-seedly-light/60" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-seedly-forest/70 border border-seedly-light/20 rounded-xl text-white placeholder:text-seedly-light/50 focus:outline-none focus:border-seedly-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-seedly-primary hover:bg-seedly-primary/90 text-white rounded-xl text-xs font-medium transition-colors shadow-subtle"
                >
                  Join the Circle
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Trust & Legal row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-seedly-light/60 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/product-disclaimer" className="hover:text-white transition-colors">
              Natural Wellness Disclaimer
            </Link>
          </div>

          {/* Payment Badges in Pakistan */}
          <div className="flex items-center gap-2 text-[11px] text-seedly-light/80">
            <span>Secure Payments:</span>
            <span className="px-2 py-0.5 bg-white/10 rounded font-medium text-white">JazzCash</span>
            <span className="px-2 py-0.5 bg-white/10 rounded font-medium text-white">Easypaisa</span>
            <span className="px-2 py-0.5 bg-white/10 rounded font-medium text-white">Bank Transfer</span>
          </div>

          <p>© {new Date().getFullYear()} Seedly Naturals Pakistan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
