'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SeedlyLogo } from '../ui/SeedlyLogo';
import { siteConfig } from '../../lib/config';
import { MessageCircle, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const shopLinks = [
  { href: '/shop', label: 'Shop all' },
  { href: '/seeds', label: 'Raw seeds' },
  { href: '/kits', label: 'Seed kits' },
  { href: '/teas', label: 'Mountain teas' },
  { href: '/find-your-seed', label: 'Routine finder' },
];

const helpLinks = [
  { href: '/about', label: 'Our story' },
  { href: '/shipping', label: 'Shipping & delivery' },
  { href: '/returns', label: 'Returns & replacements' },
  { href: '/faq', label: 'Frequently asked questions' },
  { href: '/contact', label: 'Contact us' },
  { href: '/terms', label: 'Terms of service' },
  { href: '/privacy', label: 'Privacy policy' },
  { href: '/product-disclaimer', label: 'Dietary notice' },
];

export function Footer({ hideTrustStrip }: { hideTrustStrip?: boolean } = {}) {
  const pathname = usePathname();
  const shouldHideTrustStrip = hideTrustStrip || pathname === '/about';
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
    }, 3000);
  };

  return (
    <footer className="border-t border-stone-200 bg-[#FBFBFA] pt-12 md:pt-16 pb-24 lg:pb-12 text-neutral-900">
      <div className="max-w-7xl mx-auto w-full px-5 md:px-8">
        
        {/* Trust Badges Bar: FourCol (grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6), items-center equal height */}
        {!shouldHideTrustStrip && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 pb-12 border-b border-stone-200">
          <div className="h-full rounded-xl border border-stone-200 bg-white p-4 shadow-xs flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-full border border-stone-200 bg-stone-100 flex items-center justify-center shrink-0">
              <Truck className="h-4.5 w-4.5 text-neutral-800" />
            </div>
            <div className="min-w-0 text-start">
              <p className="font-heading font-semibold text-xs uppercase tracking-wider text-neutral-900">Dispatched in 24h</p>
              <p className="text-[11px] text-stone-600">Freshly packed in Lahore</p>
            </div>
          </div>

          <div className="h-full rounded-xl border border-stone-200 bg-white p-4 shadow-xs flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-full border border-stone-200 bg-stone-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4.5 w-4.5 text-neutral-800" />
            </div>
            <div className="min-w-0 text-start">
              <p className="font-heading font-semibold text-xs uppercase tracking-wider text-neutral-900">100% Pure &amp; Raw</p>
              <p className="text-[11px] text-stone-600">No additives or fillers</p>
            </div>
          </div>

          <div className="h-full rounded-xl border border-stone-200 bg-white p-4 shadow-xs flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-full border border-stone-200 bg-stone-100 flex items-center justify-center shrink-0">
              <RefreshCw className="h-4.5 w-4.5 text-neutral-800" />
            </div>
            <div className="min-w-0 text-start">
              <p className="font-heading font-semibold text-xs uppercase tracking-wider text-neutral-900">Free Delivery 2,500+</p>
              <p className="text-[11px] text-stone-600">Nationwide COD across Pakistan</p>
            </div>
          </div>

          <div className="h-full rounded-xl border border-stone-200 bg-white p-4 shadow-xs flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-full border border-stone-200 bg-stone-100 flex items-center justify-center shrink-0">
              <MessageCircle className="h-4.5 w-4.5 text-neutral-800" />
            </div>
            <div className="min-w-0 text-start">
              <p className="font-heading font-semibold text-xs uppercase tracking-wider text-neutral-900">Helpline WhatsApp</p>
              <p className="text-[11px] text-stone-600">{siteConfig.contact.phone}</p>
            </div>
          </div>
        </div>
      )}

        {/* Links Grid: FourCol matching Trust Badges edges exactly */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 py-12 border-b border-stone-200 text-start">
          <div className="col-span-2 lg:col-span-1">
            <SeedlyLogo size="lg" />
            <p className="mt-4 max-w-xs text-xs sm:text-sm leading-relaxed text-stone-600 font-normal">
              Clean raw pantry seeds and high-altitude whole blossom teas, packed fresh in Lahore and dispatched nationwide across Pakistan via TCS and Leopards.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-700 shadow-xs">
                <span>✦ Lahore, Pakistan</span>
              </div>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-medium text-stone-600 hover:text-black hover:border-black transition-colors shadow-xs"
              >
                <span>@seedlypk</span>
              </a>
            </div>
          </div>

          <nav aria-label="Shop footer links">
            <h3 className="mb-4 font-heading font-semibold text-xs uppercase tracking-wider text-neutral-900">
              The Pantry
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-stone-600 transition-colors hover:text-neutral-900 hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help footer links">
            <h3 className="mb-4 font-heading font-semibold text-xs uppercase tracking-wider text-neutral-900">
              Good To Know
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-stone-600 transition-colors hover:text-neutral-900 hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 lg:col-span-1 space-y-4">
            <div>
              <h3 className="mb-2 font-heading font-semibold text-xs uppercase tracking-wider text-neutral-900">
                Direct Contact
              </h3>
              <a
                href={siteConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-neutral-900 py-2.5 px-4 text-xs font-semibold text-white hover:bg-neutral-800 transition-all shadow-xs"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp {siteConfig.contact.phone}</span>
              </a>
              <p className="text-[11px] text-stone-600 pt-1.5">{siteConfig.contact.hours}</p>
            </div>

            {/* Newsletter Signup */}
            <div className="pt-2 border-t border-stone-200">
              <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-neutral-900 mb-1">Fresh Dispatches</h4>
              <p className="text-[11px] text-stone-500 mb-2">Seasonal harvest updates, simple kitchen recipes, and storage tips.</p>
              {subscribed ? (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-xs text-emerald-800 font-medium">
                  ✓ Subscribed! Thank you for joining our table.
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-1.5">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 min-w-0 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-black transition-colors shrink-0"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Mandatory Dietary & Allergen Warning (Verbatim) */}
        <div className="my-8 rounded-xl border border-stone-200 bg-white p-4 text-[11px] text-stone-600 leading-relaxed shadow-xs text-start">
          <p className="font-semibold text-neutral-900 mb-1 uppercase tracking-wider">Dietary Food Notice &amp; Allergen Advisory:</p>
          <p>
            All products sold by Seedly are raw agricultural food staples and mountain botanicals for dietary consumption and culinary brewing only. They are not intended to diagnose, treat, cure, or prevent any medical condition. {siteConfig.disclaimer.facility} If you have severe seed or nut allergies or are pregnant, consult your physician before dietary changes.
          </p>
        </div>

        {/* Bottom Legal & Payment Badges: on container edges */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs text-stone-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-neutral-900">Accepted Payments:</span>
            <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-neutral-700">Cash on Delivery</span>
            <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-neutral-700">JazzCash</span>
            <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-neutral-700">Easypaisa</span>
            <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-neutral-700">Bank Transfer</span>
          </div>
          <p className="text-[11px] text-stone-600">
            &copy; {new Date().getFullYear()} Seedly Naturals Pakistan. Dispatched from Lahore.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
