import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Truck, Clock, ShieldCheck, MapPin, Banknote, MessageCircle } from 'lucide-react';
import { siteConfig } from '../../../lib/config';

export const metadata: Metadata = {
  title: 'Shipping & Nationwide Delivery Policy | Seedly Pakistan',
  description:
    `Flat Rs. ${siteConfig.shipping.standardFee} delivery across Pakistan, FREE on orders of Rs. ${siteConfig.shipping.freeThreshold.toLocaleString()} or more. Daily dispatch from Lahore via TCS and Leopards Courier.`,
  openGraph: {
    title: 'Shipping & Delivery Policy | Seedly Pakistan',
    description:
      `Flat Rs. ${siteConfig.shipping.standardFee} delivery, FREE on orders over Rs. ${siteConfig.shipping.freeThreshold.toLocaleString()}. Reliable dispatch via TCS and Leopards Courier.`,
    url: `${siteConfig.url}/shipping`,
  },
};

export default function ShippingPage() {
  return (
    <div className="bg-white text-stone-900">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-20 space-y-12">
        {/* Page Header */}
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500">
            Nationwide Logistics
          </span>
          <h1 className="font-heading font-medium text-3xl sm:text-5xl text-stone-900 tracking-tight">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            Carefully packaged raw pantry seeds and mountain teas dispatched daily from our central Lahore hub across all serviceable areas in Pakistan.
          </p>
        </header>

        {/* 3 Overview Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-stone-200 bg-[#FBFBFA] p-6 space-y-2.5 shadow-xs">
            <Truck className="w-5 h-5 text-stone-800 mb-1" />
            <h2 className="font-heading font-medium text-base text-stone-900">Delivery Charges</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              <strong>FREE nationwide delivery</strong> on all orders of <strong>Rs. {siteConfig.shipping.freeThreshold.toLocaleString()} or more</strong>. For orders under Rs. {siteConfig.shipping.freeThreshold.toLocaleString()}, shipping is a flat <strong>Rs. {siteConfig.shipping.standardFee}</strong> nationwide.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-[#FBFBFA] p-6 space-y-2.5 shadow-xs">
            <Clock className="w-5 h-5 text-stone-800 mb-1" />
            <h2 className="font-heading font-medium text-base text-stone-900">Daily Dispatch Cutoff</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Orders placed before <strong>3:00 PM PKT (Monday to Saturday)</strong> are dispatched same day from Lahore. Orders placed after 3:00 PM or on Sundays ship on the next business morning.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-[#FBFBFA] p-6 space-y-2.5 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-stone-800 mb-1" />
            <h2 className="font-heading font-medium text-base text-stone-900">Courier Partners</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              We partner exclusively with <strong>TCS</strong> and <strong>Leopards Courier</strong> for secure door-to-door delivery with SMS status notifications and parcel tracking.
            </p>
          </div>
        </div>

        {/* Delivery Timelines Table */}
        <section aria-labelledby="timelines-heading" className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <h2 id="timelines-heading" className="font-heading font-medium text-xl sm:text-2xl text-stone-900">
            Estimated Delivery Timelines
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-start border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-900 font-semibold bg-[#FBFBFA]">
                  <th className="py-3.5 px-4 text-start">Destination Region</th>
                  <th className="py-3.5 px-4 text-start">Expected Transit Window</th>
                  <th className="py-3.5 px-4 text-start">Courier Network</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-600">
                {siteConfig.shipping.timelines.map((timeline, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-stone-900">{timeline.area}</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-800">{timeline.time}</td>
                    <td className="py-3.5 px-4">TCS / Leopards Courier</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-stone-500">
            * Remote addresses or extreme seasonal weather conditions may occasionally add 24–48 hours to transit windows.
          </p>
        </section>

        {/* Packaging & Payment Verification */}
        <section className="rounded-3xl border border-stone-200 bg-[#FBFBFA] p-6 sm:p-8 space-y-6 text-xs sm:text-sm leading-relaxed text-stone-700 shadow-xs">
          <div className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-stone-800" />
              <span>Cash on Delivery (COD) &amp; Payment Verification</span>
            </h2>
            <p className="text-stone-600 leading-relaxed">
              Cash on Delivery is available across all serviceable delivery zones in Pakistan. Please ensure the exact cash amount is ready for the courier rider upon delivery. For first-time customers or high-value orders, our care team may reach out via WhatsApp at <strong>{siteConfig.contact.phone}</strong> to confirm your delivery address prior to handing parcels over to TCS or Leopards.
            </p>
            <p className="text-stone-600 leading-relaxed">
              For online bank transfers (IBFT), JazzCash, or Easypaisa, our accounts team manually verifies the transaction ID or payment screenshot before releasing your parcel to dispatch.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-200/60">
            <h2 className="font-heading font-medium text-lg text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-stone-800" />
              <span>Airtight Packaging &amp; Transit Protection</span>
            </h2>
            <p className="text-stone-600 leading-relaxed">
              All raw seeds are heat-sealed in thick, food-grade moisture-barrier pouches with tamper-evident tear notches and press-to-close airtight locks. Loose-leaf chamomile flowers and delicate botanicals are protected inside sturdy, bubble-cushioned outer boxes to prevent crushing during transit.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-200/60">
            <h2 className="font-heading font-medium text-lg text-stone-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              <span>Order Tracking &amp; Delivery Support</span>
            </h2>
            <p className="text-stone-600 leading-relaxed">
              Once your package leaves our Lahore dispatch hub, you will receive a tracking link via WhatsApp and SMS. For order status inquiries, reach out directly to our customer care team on WhatsApp at{' '}
              <a
                href={siteConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-900 font-semibold underline underline-offset-4 hover:text-stone-600"
              >
                {siteConfig.contact.phone}
              </a>{' '}
              or email{' '}
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="text-stone-900 font-semibold underline underline-offset-4 hover:text-stone-600"
              >
                {siteConfig.contact.email}
              </a>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
