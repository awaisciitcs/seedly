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
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
          Data Protection
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-gray">
          How Seedly protects and handles your personal information with care.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border-gray shadow-card space-y-6 text-sm leading-relaxed text-charcoal">
        <h2 className="font-serif text-xl font-bold">1. Information We Collect</h2>
        <p className="text-muted-gray">
          We only collect personal information necessary to deliver your orders and provide customer care: your name, shipping address, landmark, email address, mobile phone number, and payment verification references.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2">2. Payment Processing &amp; Verification</h2>
        <p className="text-muted-gray">
          Seedly does not collect or store debit/credit card numbers or banking passwords. We operate transparent Pakistani payment methods: Cash on Delivery (COD) collected by the courier rider upon delivery, and direct manual transfers via JazzCash, Easypaisa, or direct online bank transfer (IBFT). Transaction IDs or transfer screenshots submitted during checkout are reviewed solely by our accounts team in Lahore to verify payment prior to parcel dispatch.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2">3. Courier Logistics Sharing</h2>
        <p className="text-muted-gray">
          We share your recipient name, destination address, and contact number exclusively with our verified courier logistics partners—<strong>TCS</strong> and <strong>Leopards Courier</strong>—solely to fulfill the safe and timely delivery of your parcel.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2">4. Your Privacy Rights</h2>
        <p className="text-muted-gray">
          You may request an update, export, or deletion of your customer information at any time by contacting our support team via WhatsApp at <strong>{siteConfig.contact.phone}</strong> or by emailing <strong>{siteConfig.contact.email}</strong>.
        </p>
      </div>
    </div>
  );
}
