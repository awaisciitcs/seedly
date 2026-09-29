import React from 'react';
import Link from 'next/link';
import { getKits } from '../../../lib/services/kits';
import { ProductCard } from '../../../components/product/ProductCard';
import { Sparkles, Calendar, PackageCheck, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seed Cycling Kits (14-Day & 28-Day Routines) | Seedly Pakistan',
  description:
    'Full 250g resealable seed pouches with engraved wooden measuring scoop and printed calendar. Wholesome monthly food routines for follicular and luteal phases.',
  openGraph: {
    title: 'Seed Cycling Kits | Seedly Pakistan',
    description:
      'Portioned 14-day and full 28-day seed routines with standard 250g pouches, wooden measuring scoop, and tracking calendar.',
    url: 'https://seedly.pk/kits',
    siteName: 'Seedly',
    locale: 'en_PK',
    type: 'website',
    images: [
      {
        url: '/images/products/complete-kit.jpg',
        width: 800,
        height: 800,
        alt: 'Seedly complete seed cycling kit',
      },
    ],
  },
};

export default function KitsPage() {
  const kits = getKits();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12">
      {/* Category Header */}
      <div className="max-w-2xl">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
          Seed Cycling Kits
        </h1>
        <p className="text-sm text-muted-gray mt-2 leading-relaxed">
          Structured 14-day and full 28-day routines with standard 250g resealable seed pouches, an engraved wooden measuring scoop, and a printed calendar. Wholesome kitchen nutrition designed for each phase of your monthly cycle.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {kits.map((kit) => (
          <ProductCard key={kit.id} product={kit as any} />
        ))}
      </div>

      {/* Compact Kit Comparison Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-5">
        <div className="space-y-1">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
            Comparing the 3 Kits
          </h2>
          <p className="text-xs sm:text-sm text-muted-gray">
            Choose individual 14-day phases or get the full 28-day routine in one box.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-gray text-charcoal">
                <th className="py-3 pr-4 font-semibold text-muted-gray uppercase tracking-wider text-[11px]">Details</th>
                <th className="py-3 px-4 font-bold text-charcoal">Follicular (Phase 1)</th>
                <th className="py-3 px-4 font-bold text-charcoal">Luteal (Phase 2)</th>
                <th className="py-3 pl-4 font-bold text-seedly-dark bg-seedly-light/30 rounded-t-xl">Complete 28-Day Kit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-gray/60 text-muted-gray">
              <tr>
                <td className="py-3 pr-4 font-medium text-charcoal">Routine Duration</td>
                <td className="py-3 px-4">Days 1–14 (14-Day Routine)</td>
                <td className="py-3 px-4">Days 15–28 (14-Day Routine)</td>
                <td className="py-3 pl-4 font-semibold text-charcoal bg-seedly-light/30">Days 1–28 (Full Month Routine)</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-charcoal">Seeds Included</td>
                <td className="py-3 px-4">Raw Pumpkin + Cold-Milled Flax</td>
                <td className="py-3 px-4">Raw Sunflower + White Sesame</td>
                <td className="py-3 pl-4 font-semibold text-charcoal bg-seedly-light/30">All 4 Seeds (4 Separate Pouches)</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-charcoal">Net Seed Weight</td>
                <td className="py-3 px-4">500g (2x 250g pouches)</td>
                <td className="py-3 px-4">500g (2x 250g pouches)</td>
                <td className="py-3 pl-4 font-semibold text-charcoal bg-seedly-light/30">1,000g (4x 250g pouches)</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-charcoal">Engraved Wooden Scoop</td>
                <td className="py-3 px-4 text-emerald-800 font-semibold">Included (1 tbsp)</td>
                <td className="py-3 px-4 text-emerald-800 font-semibold">Included (1 tbsp)</td>
                <td className="py-3 pl-4 text-emerald-800 font-bold bg-seedly-light/30">Included (1 tbsp)</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-charcoal">Cycle Tracking Calendar</td>
                <td className="py-3 px-4 text-emerald-800 font-semibold">Included</td>
                <td className="py-3 px-4 text-emerald-800 font-semibold">Included</td>
                <td className="py-3 pl-4 text-emerald-800 font-bold bg-seedly-light/30">Included</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-charcoal">Nationwide Delivery</td>
                <td className="py-3 px-4">Rs. 200 (TCS / Leopards)</td>
                <td className="py-3 px-4">Rs. 200 (TCS / Leopards)</td>
                <td className="py-3 pl-4 font-bold text-emerald-800 bg-seedly-light/30">FREE Courier Delivery Included</td>
              </tr>
              <tr className="font-serif text-sm">
                <td className="py-3.5 pr-4 font-sans font-bold text-charcoal">Price</td>
                <td className="py-3.5 px-4 font-bold text-charcoal">
                  Rs. 1,550 <span className="font-sans text-[11px] font-normal text-muted-gray ml-1">(Save Rs. 80)</span>
                </td>
                <td className="py-3.5 px-4 font-bold text-charcoal">
                  Rs. 1,290 <span className="font-sans text-[11px] font-normal text-muted-gray ml-1">(Save Rs. 50)</span>
                </td>
                <td className="py-3.5 pl-4 font-bold text-seedly-dark text-base bg-seedly-light/30">
                  Rs. 2,850 <span className="font-sans text-[11px] font-normal text-muted-gray ml-1">(Save Rs. 120)</span>
                </td>
              </tr>
              <tr>
                <td className="py-4 pr-4 font-sans font-medium text-charcoal">Order Kit</td>
                <td className="py-4 px-4">
                  <Link
                    href="/kits/follicular-blend"
                    className="inline-block px-4 py-2 bg-seedly-dark hover:bg-seedly-forest text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    View Kit →
                  </Link>
                </td>
                <td className="py-4 px-4">
                  <Link
                    href="/kits/luteal-blend"
                    className="inline-block px-4 py-2 bg-seedly-dark hover:bg-seedly-forest text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    View Kit →
                  </Link>
                </td>
                <td className="py-4 pl-4 bg-seedly-light/30 rounded-b-xl">
                  <Link
                    href="/kits/complete-cycle-kit"
                    className="inline-block px-4 py-2 bg-seedly-primary hover:bg-seedly-primary/90 text-white rounded-xl text-xs font-semibold transition-colors shadow-subtle"
                  >
                    View Complete Kit →
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
