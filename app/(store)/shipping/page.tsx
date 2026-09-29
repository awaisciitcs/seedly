import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Truck, Clock, ShieldCheck, MapPin, Banknote, MessageCircle, AlertCircle } from 'lucide-react';
import { siteConfig } from '../../../lib/config';

export const metadata: Metadata = {
  title: 'Shipping & Nationwide Delivery Policy | Seedly Pakistan',
  description:
    'Flat Rs. 200 delivery across Pakistan, FREE on orders of Rs. 2,500 or more. Daily dispatch from Lahore via TCS and Leopards Courier.',
  openGraph: {
    title: 'Shipping & Delivery Policy | Seedly Pakistan',
    description: 'Flat Rs. 200 delivery, FREE on orders over Rs. 2,500. Reliable dispatch via TCS and Leopards.',
  },
};

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
          Nationwide Logistics
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          Shipping &amp; Delivery Policy
        </h1>
        <p className="text-sm text-muted-gray">
          Carefully packaged fresh pantry seeds and mountain teas dispatched daily from our central Lahore hub across Pakistan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-border-gray shadow-card space-y-2">
          <Truck className="w-6 h-6 text-seedly-primary mb-2" />
          <h3 className="font-serif font-bold text-base text-charcoal">Delivery Charges</h3>
          <p className="text-xs text-muted-gray leading-relaxed">
            <strong>FREE Nationwide Delivery</strong> on all orders of <strong>Rs. {siteConfig.shipping.freeThreshold.toLocaleString()} or more</strong>. For orders under Rs. 2,500, delivery is a flat <strong>Rs. {siteConfig.shipping.standardFee}</strong> nationwide.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-gray shadow-card space-y-2">
          <Clock className="w-6 h-6 text-seedly-primary mb-2" />
          <h3 className="font-serif font-bold text-base text-charcoal">Dispatch Cutoff</h3>
          <p className="text-xs text-muted-gray leading-relaxed">
            Orders placed before <strong>3:00 PM PKT (Monday to Saturday)</strong> ship the same day. Orders placed after 3:00 PM or on Sundays ship on the next business day.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-gray shadow-card space-y-2">
          <ShieldCheck className="w-6 h-6 text-seedly-primary mb-2" />
          <h3 className="font-serif font-bold text-base text-charcoal">Courier Partners</h3>
          <p className="text-xs text-muted-gray leading-relaxed">
            We partner exclusively with <strong>TCS</strong> and <strong>Leopards Courier</strong> for secure door-to-door delivery with live SMS and tracking updates.
          </p>
        </div>
      </div>

      {/* Delivery Timelines Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-6">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
          Estimated Delivery Timelines
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border-gray text-charcoal font-semibold bg-cream/30">
                <th className="py-3 px-4">Destination Region</th>
                <th className="py-3 px-4">Expected Delivery Window</th>
                <th className="py-3 px-4">Courier Network</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-gray/50 text-muted-gray">
              {siteConfig.shipping.timelines.map((timeline, idx) => (
                <tr key={idx} className="hover:bg-cream/20">
                  <td className="py-3.5 px-4 font-medium text-charcoal">{timeline.area}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-800">{timeline.time}</td>
                  <td className="py-3.5 px-4">TCS / Leopards Courier</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-gray">
          * Remote localities or peak courier festival periods may add 24–48 hours to transit windows.
        </p>
      </div>

      {/* COD and Order Policies */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-6 text-sm leading-relaxed text-charcoal">
        <h2 className="font-serif text-xl font-bold flex items-center gap-2">
          <Banknote className="w-5 h-5 text-seedly-primary" />
          <span>Cash on Delivery (COD) &amp; Payment Verification</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
          Cash on Delivery is available across all serviceable delivery zones in Pakistan. Please ensure the exact cash amount is ready for the courier rider upon delivery. For first-time customers or high-value orders, our support team may reach out via WhatsApp at <strong>{siteConfig.contact.phone}</strong> to confirm your delivery address prior to handing parcels over to TCS or Leopards.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-seedly-primary" />
          <span>Packaging Standards &amp; Transit Protection</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
          All pantry seeds are packed in thick food-grade, moisture-resistant barrier pouches with tamper-evident tear notches and airtight press-locks. Chamomile glass jars are fitted with internal freshness seals and bubble-cushioned transit boxes to prevent damage during road and air transit across Pakistan.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-emerald-700" />
          <span>Order Tracking &amp; Delivery Support</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
          Once your parcel is dispatched from our Lahore hub, you will receive a tracking link via WhatsApp and SMS. If your delivery is delayed or you need rider contact details, reach out directly to our customer care team on WhatsApp at{' '}
          <a
            href={siteConfig.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-seedly-dark font-semibold hover:underline"
          >
            {siteConfig.contact.phone}
          </a>{' '}
          or email{' '}
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="text-seedly-dark font-semibold hover:underline"
          >
            {siteConfig.contact.email}
          </a>.
        </p>
      </div>
    </div>
  );
}
