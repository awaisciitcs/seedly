import React from 'react';
import type { Metadata } from 'next';
import { siteConfig } from '../../../lib/config';

export const metadata: Metadata = {
  title: 'Terms of Service | Seedly Pakistan',
  description:
    'Clear, transparent shopping terms for catalog orders, courier delivery, payments, and 7-day replacements on Seedly.pk.',
  openGraph: {
    title: 'Terms of Service | Seedly Pakistan',
    description: 'Straightforward terms governing orders, courier delivery, and customer care on Seedly.pk.',
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="max-w-xl space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-gray">
          Straightforward terms governing orders, nationwide courier delivery, and payments on Seedly.pk.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border-gray shadow-card space-y-6 text-sm leading-relaxed text-charcoal">
        <div>
          <h2 className="font-serif text-lg font-bold text-charcoal">1. Orders &amp; Confirmation</h2>
          <p className="text-muted-gray mt-1">
            When you place an order on Seedly.pk, you will receive an immediate order number (e.g., SED-XXXXXX) and order confirmation. Please ensure your delivery address and contact phone number are reachable for courier dispatch. For first-time Cash on Delivery orders, our team may verify shipping details via WhatsApp prior to dispatch.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-lg font-bold text-charcoal">2. Prices &amp; Payment Options</h2>
          <p className="text-muted-gray mt-1">
            All prices are listed in Pakistani Rupees (PKR). We offer three convenient payment methods: Cash on Delivery (COD) payable to the courier rider upon delivery, mobile wallet transfers via JazzCash and Easypaisa, or direct online bank transfer (IBFT).
          </p>
        </div>

        <div>
          <h2 className="font-serif text-lg font-bold text-charcoal">3. Dispatch &amp; Nationwide Delivery</h2>
          <p className="text-muted-gray mt-1">
            Orders placed by 3:00 PM PKT (Monday to Saturday) are dispatched the same day from our central Lahore hub via TCS and Leopards Courier. Expected delivery timelines are:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-muted-gray">
            <li><strong>Lahore:</strong> 1–2 business days</li>
            <li><strong>Rest of Punjab &amp; Islamabad / Rawalpindi:</strong> 2–3 business days</li>
            <li><strong>Sindh, Khyber Pakhtunkhwa &amp; Balochistan:</strong> 3–4 business days</li>
            <li><strong>Gilgit-Baltistan &amp; Azad Jammu and Kashmir (AJK):</strong> 4–6 business days</li>
          </ul>
          <p className="text-muted-gray mt-2 text-xs">
            FREE nationwide delivery applies on all orders of Rs. 2,500 or more. For orders below Rs. 2,500, a flat delivery fee of Rs. 200 applies.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-lg font-bold text-charcoal">4. 7-Day Replacement Guarantee &amp; Food Safety Returns</h2>
          <p className="text-muted-gray mt-1">
            {siteConfig.disclaimer.returnsDamaged}
          </p>
          <p className="text-muted-gray mt-2 text-xs">
            {siteConfig.disclaimer.returnsChangeOfMind}
          </p>
        </div>

        <div>
          <h2 className="font-serif text-lg font-bold text-charcoal">5. Food Notice &amp; Culinary Use</h2>
          <p className="text-muted-gray mt-1">
            {siteConfig.disclaimer.standard}
          </p>
        </div>
      </div>
    </div>
  );
}
