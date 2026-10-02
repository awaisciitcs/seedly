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
    url: `${siteConfig.url}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="bg-white text-stone-900">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-20 space-y-10">
        <header className="max-w-2xl space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500">
            Legal Terms
          </span>
          <h1 className="font-heading font-medium text-3xl sm:text-5xl text-stone-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            Straightforward terms governing catalog orders, nationwide courier dispatch, payment processing, and consumer safety on Seedly.pk.
          </p>
        </header>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10 space-y-8 text-xs sm:text-sm leading-relaxed text-stone-700 shadow-xs">
          <section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">1. Orders &amp; Address Verification</h2>
            <p className="text-stone-600">
              When you place an order on Seedly.pk, you will receive an immediate order number (e.g., SED-XXXXXX) and automated confirmation. Please ensure your shipping address, city, and active mobile number are accurate. For first-time Cash on Delivery orders, our care team may reach out via WhatsApp to verify shipping details before dispatching parcels with TCS or Leopards Courier.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">2. Pricing &amp; Payment Options</h2>
            <p className="text-stone-600">
              All prices are listed in Pakistani Rupees (PKR) and inclusive of packaging costs. We offer three transparent payment channels: Cash on Delivery (COD) paid to the courier upon delivery, mobile wallets (JazzCash and Easypaisa), and direct Pakistani bank transfer (IBFT). Digital transfers are manually reviewed and verified by our accounts team against your submitted transaction ID or proof of payment prior to dispatch.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">3. Nationwide Courier Dispatch</h2>
            <p className="text-stone-600">
              Orders placed by 3:00 PM PKT (Monday to Saturday) are dispatched the same day from our central Lahore hub via <strong>TCS</strong> and <strong>Leopards Courier</strong>. Expected transit times are:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              {siteConfig.shipping.timelines.map((timeline, idx) => (
                <li key={idx}>
                  <strong>{timeline.area}:</strong> {timeline.time}
                </li>
              ))}
            </ul>
            <p className="text-stone-600 pt-1">
              FREE nationwide delivery applies on all orders of Rs. {siteConfig.shipping.freeThreshold.toLocaleString()} or more. For orders below Rs. {siteConfig.shipping.freeThreshold.toLocaleString()}, a flat standard shipping fee of Rs. {siteConfig.shipping.standardFee} applies nationwide.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">4. 7-Day Replacement Guarantee &amp; Food Safety Returns</h2>
            <p className="text-stone-600">
              {siteConfig.disclaimer.returnsDamaged}
            </p>
            <p className="text-stone-600">
              {siteConfig.disclaimer.returnsChangeOfMind}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">5. Food Notice &amp; Dietary Status</h2>
            <p className="text-stone-600">
              {siteConfig.disclaimer.standard}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">6. Customer Care &amp; Inquiries</h2>
            <p className="text-stone-600">
              For any questions regarding these terms, your order status, or dietary guidance, contact our team Monday to Saturday (9am–7pm PKT) at{' '}
              <a href={siteConfig.contact.whatsappUrl} className="font-semibold text-stone-900 underline underline-offset-4">
                WhatsApp {siteConfig.contact.phone}
              </a>{' '}
              or email{' '}
              <a href={`mailto:${siteConfig.contact.email}`} className="font-semibold text-stone-900 underline underline-offset-4">
                {siteConfig.contact.email}
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
