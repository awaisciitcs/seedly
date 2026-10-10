import React from 'react';
import type { Metadata } from 'next';
import { siteConfig } from '../../../lib/config';

export const metadata: Metadata = {
  title: 'Privacy Policy | Seedly Pakistan',
  description:
    'How Seedly protects and handles your personal information. Safe, transparent customer data practices for nationwide orders in Pakistan.',
  openGraph: {
    title: 'Privacy Policy | Seedly Pakistan',
    description: 'Safe and transparent customer data handling for orders across Pakistan.',
    url: `${siteConfig.url}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="bg-white text-stone-900">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-20 space-y-10">
        <header className="max-w-2xl space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500">
            Data Protection
          </span>
          <h1 className="font-heading font-medium text-3xl sm:text-5xl text-stone-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            How Seedly respects, handles, and safeguards your customer information across our website and delivery network.
          </p>
        </header>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10 space-y-8 text-xs sm:text-sm leading-relaxed text-stone-700 shadow-xs">
          <section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">1. Information We Collect</h2>
            <p className="text-stone-600">
              We collect personal information necessary to deliver your orders and provide helpful customer care: your name, shipping address, landmark, city, email address, mobile contact number, and payment verification references.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">2. Routine Questionnaire &amp; Interactive Tools</h2>
            <p className="text-stone-600">
              When you use our Routine Finder questionnaire, cycle calendar, or brew guides, any responses you provide are processed in-session or on your device solely to suggest relevant whole-food ingredients and guidance. We never sell, rent, or share your routine questionnaire answers with third parties or advertisers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">3. Email Newsletter &amp; Communications</h2>
            <p className="text-stone-600">
              If you subscribe to our Fresh Dispatches newsletter, we store your email address solely to send seasonal harvest announcements, pantry recipes, and store updates. You may opt out or unsubscribe at any time via the one-click unsubscribe link at the bottom of every email dispatch.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">4. Payment Processing &amp; Verification</h2>
            <p className="text-stone-600">
              Seedly does not collect, process, or store credit/debit card numbers or confidential banking passwords. For Cash on Delivery (COD), payment is made directly to the courier rider upon delivery. For manual transfers via JazzCash, Easypaisa, or direct bank transfer (IBFT), payment transaction IDs and verification screenshots are inspected solely by our internal Lahore accounts team to verify settlement prior to parcel dispatch.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">5. Courier Logistics Partners</h2>
            <p className="text-stone-600">
              To fulfill your physical delivery, we share your recipient name, destination address, and mobile phone number strictly with our contracted courier logistics partners—<strong>TCS</strong> and <strong>Leopards Courier</strong>. They use this data solely to transport the parcel and send you SMS tracking and delivery arrival notifications.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">6. Cookies &amp; Anonymous Analytics</h2>
            <p className="text-stone-600">
              We use essential first-party cookies to remember your shopping cart items across visits and retain session preferences. We also use privacy-focused, anonymous site telemetry to monitor page loading speed and technical reliability. We do not use third-party behavioral advertising trackers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">7. Your Data Rights</h2>
            <p className="text-stone-600">
              You have the right to request access to, correction of, or deletion of your customer information at any time. Simply contact our support team via WhatsApp at{' '}
              <a href={siteConfig.contact.whatsappUrl} className="font-semibold text-stone-900 underline underline-offset-4">
                {siteConfig.contact.phone}
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
