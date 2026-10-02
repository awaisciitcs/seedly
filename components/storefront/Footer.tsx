'use client';

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
];

export function Footer({ hideTrustStrip }: { hideTrustStrip?: boolean } = {}) {
  const pathname = usePathname();
  const shouldHideTrustStrip = hideTrustStrip || pathname === '/about';

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
              <p className="text-[11px] text-stone-600">0371 9055758</p>
            </div>
          </div>
        </div>
      )}

        {/* Links Grid: FourCol matching Trust Badges edges exactly */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 py-12 border-b border-stone-200 text-start">
          <div className="col-span-2 lg:col-span-1">
            <SeedlyLogo size="lg" />
            <p className="mt-4 max-w-xs text-xs sm:text-sm leading-relaxed text-stone-600 font-normal">
              Clean raw pantry seeds and high-altitude whole blossom teas, packed fresh in Lahore and dispatched nationwide across Pakistan.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-700 shadow-xs">
              <span>✦ Lahore, Pakistan</span>
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

          <div className="col-span-2 lg:col-span-1">
            <h3 className="mb-4 font-heading font-semibold text-xs uppercase tracking-wider text-neutral-900">
              Direct Contact
            </h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <a
                href={siteConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-neutral-900 py-2.5 px-4 text-xs font-semibold text-white hover:bg-neutral-800 transition-all shadow-xs"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp 0371 9055758</span>
              </a>
              <p className="text-[11px] text-stone-600 pt-1">{siteConfig.contact.hours}</p>
            </div>
          </div>
        </div>

        {/* Mandatory Dietary & Allergen Warning (Verbatim) */}
        <div className="my-8 rounded-xl border border-stone-200 bg-white p-4 text-[11px] text-stone-600 leading-relaxed shadow-xs text-start">
          <p className="font-semibold text-neutral-900 mb-1 uppercase tracking-wider">Dietary Food Notice &amp; Allergen Advisory:</p>
          <p>
            All products sold by Seedly are raw agricultural food staples and mountain botanicals for dietary consumption and culinary brewing only. They are not intended to diagnose, treat, cure, or prevent any medical condition. Packed in a facility that also handles tree nuts, sesame seeds, and cereal grains. If you have severe seed or nut allergies or are pregnant, consult your physician before dietary changes.
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
