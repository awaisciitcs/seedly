import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Seedly Pakistan',
  description: 'Clear, transparent shopping terms for catalog orders, courier delivery, and customer care on Seedly.pk.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="max-w-xl space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-gray">
          Straightforward terms governing orders, courier delivery, and payments on Seedly.pk.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border-gray shadow-card space-y-6 text-sm leading-relaxed text-charcoal">
        <div>
          <h2 className="font-serif text-lg font-bold text-charcoal">1. Orders &amp; Confirmation</h2>
          <p className="text-muted-gray mt-1">
            When you place an order on Seedly.pk, you will receive an immediate order number (e.g., SED-XXXXXX) and order confirmation. Please ensure your delivery address and contact phone number are reachable for courier dispatch.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-lg font-bold text-charcoal">2. Prices &amp; Payment Options</h2>
          <p className="text-muted-gray mt-1">
            All prices are listed in Pakistani Rupees (PKR). We offer three convenient payment methods: Cash on Delivery (COD) payable to the courier upon delivery, mobile wallet transfers via JazzCash and Easypaisa, or direct online bank transfer to our Meezan Bank account.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-lg font-bold text-charcoal">3. Dispatch &amp; Nationwide Delivery</h2>
          <p className="text-muted-gray mt-1">
            Orders are packed fresh and dispatched from our central Lahore hub via TCS and Leopards Courier. Deliveries typically arrive within 1 to 2 business days in Lahore, and 2 to 4 business days in other cities across Pakistan. Free delivery applies on all orders of Rs. 2,500 or more.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-lg font-bold text-charcoal">4. 7-Day Quality Guarantee &amp; Returns</h2>
          <p className="text-muted-gray mt-1">
            If your package arrives damaged, leaking, or with a broken seal, share a quick photo and your order number via WhatsApp (+92 304 1117333) or email (care@seedly.pk) within 7 days. Our team will promptly arrange a free replacement or full refund.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-lg font-bold text-charcoal">5. Food &amp; Kitchen Use</h2>
          <p className="text-muted-gray mt-1">
            All seeds, routine kits, and herbal infusions provided by Seedly are 100% natural, culinary-grade food items and herbs intended for daily nourishment. They are not intended as prescription medical substitutes.
          </p>
        </div>
      </div>
    </div>
  );
}
