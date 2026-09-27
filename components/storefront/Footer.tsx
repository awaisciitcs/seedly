'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SeedlyLogo } from '../ui/SeedlyLogo';
import { Mail, CheckCircle2, MapPin, Phone, ShieldCheck } from 'lucide-react';

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
              Good ingredients. Simple rituals. Single-origin heirloom seeds and whole blossom mountain teas, sourced directly from Pakistani growers and packaged fresh in amber glass and kraft barrier pouches.
            </p>

            <div className="pt-2 space-y-2 text-xs text-seedly-light/70">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-seedly-primary shrink-0" />
                <span>Dispatched daily from Lahore &amp; Karachi via TCS / Leopards</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-seedly-primary shrink-0" />
                <span>Customer Care: +92 300 1234567 (Mon–Sat, 10am–7pm PKT)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-seedly-primary shrink-0" />
                <span>Support: care@seedly.pk</span>
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
                  Curated Kits
                </Link>
              </li>
              <li>
                <Link href="/teas" className="hover:text-white transition-colors">
                  Mountain Herbal Teas
                </Link>
              </li>
              <li>
                <Link href="/find-your-seed" className="hover:text-white transition-colors">
                  Find Your Seed
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white/90">Customer Care</h4>
            <ul className="space-y-2 text-sm text-seedly-light/80">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Why Seedly Exists
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Shipping &amp; Delivery Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  7-Day Freshness Guarantee
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Common Questions (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact &amp; WhatsApp
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white/90">Harvest Updates</h4>
            <p className="text-xs text-seedly-light/80 leading-relaxed">
              Seasonal harvest announcements and simple culinary recipes. No spam.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-seedly-forest rounded-xl text-xs text-seedly-light">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Thank you. We will keep you updated on new harvests.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-seedly-light/60" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-seedly-forest/70 border border-seedly-light/20 rounded-xl text-white placeholder:text-seedly-light/50 focus:outline-none focus:border-seedly-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-seedly-primary hover:bg-seedly-primary/90 text-white rounded-xl text-xs font-semibold transition-colors shadow-subtle"
                >
                  Join the Newsletter
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
              Product Disclaimer
            </Link>
            <span>•</span>
            <Link href="/admin/login" className="hover:text-white transition-colors opacity-70">
              Admin Portal
            </Link>
          </div>

          {/* Payment Badges in Pakistan */}
          <div className="flex items-center gap-2 text-[11px] text-seedly-light/80">
            <span>Payment Options:</span>
            <span className="px-2 py-0.5 bg-white/10 rounded font-medium text-white">JazzCash</span>
            <span className="px-2 py-0.5 bg-white/10 rounded font-medium text-white">Easypaisa</span>
            <span className="px-2 py-0.5 bg-white/10 rounded font-medium text-white">Bank Transfer</span>
            <span className="px-2 py-0.5 bg-white/10 rounded font-medium text-white">COD</span>
          </div>

          <p>© {new Date().getFullYear()} Seedly Naturals Pakistan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
