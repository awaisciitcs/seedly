import React from 'react';
import Link from 'next/link';
import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
          Delivery Policy
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          Shipping & Nationwide Delivery
        </h1>
        <p className="text-sm text-muted-gray">
          Carefully packaged fresh botanicals dispatched daily from our central Lahore hub across Pakistan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-border-gray shadow-card space-y-2">
          <Truck className="w-6 h-6 text-seedly-primary mb-2" />
          <h3 className="font-serif font-bold text-base text-charcoal">Free Shipping</h3>
          <p className="text-xs text-muted-gray leading-relaxed">
            Free nationwide courier delivery on all orders of <strong>Rs. 2,500 or more</strong>. For orders under Rs. 2,500, delivery is a flat Rs. 200.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-gray shadow-card space-y-2">
          <Clock className="w-6 h-6 text-seedly-primary mb-2" />
          <h3 className="font-serif font-bold text-base text-charcoal">Delivery Times</h3>
          <p className="text-xs text-muted-gray leading-relaxed">
            <strong>Lahore:</strong> 1–2 business days.<br />
            <strong>Punjab &amp; Islamabad / Rawalpindi:</strong> 2–3 business days.<br />
            <strong>Sindh (including Karachi), KPK &amp; Nationwide:</strong> 3–4 business days.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-gray shadow-card space-y-2">
          <ShieldCheck className="w-6 h-6 text-seedly-primary mb-2" />
          <h3 className="font-serif font-bold text-base text-charcoal">Courier Partners</h3>
          <p className="text-xs text-muted-gray leading-relaxed">
            We partner with reliable courier networks including TCS, Leopards Express, and Trax with end-to-end tracking.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-6 text-sm leading-relaxed text-charcoal">
        <h2 className="font-serif text-xl font-bold">Order Tracking & Updates</h2>
        <p>
          Once your order has been packed and handed over to our courier partner, you will receive an automatic tracking notification via WhatsApp and Email containing your courier tracking number and real-time tracking link.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2">Serviceable Destinations</h2>
        <p>
          We ship to every major city, district, and town in Pakistan, including Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad Capital Territory, Gilgit-Baltistan, and Azad Jammu & Kashmir.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2">Packaging Standards</h2>
        <p>
          All seeds and teas are sealed in food-grade, airtight, moisture-resistant amber glass or thick resealable barrier pouches with tamper-evident seals to protect them from heat and humidity during transit.
        </p>
      </div>
    </div>
  );
}
