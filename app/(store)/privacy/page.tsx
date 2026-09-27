import React from 'react';

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
          How Seedly protects and handles your personal information.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border-gray shadow-card space-y-6 text-sm leading-relaxed text-charcoal">
        <h2 className="font-serif text-xl font-bold">1. Information We Collect</h2>
        <p>
          We only collect personal information necessary to deliver your orders and provide customer care: your name, shipping address, email address, mobile phone number, and transaction references.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2">2. Payment Security</h2>
        <p>
          Seedly does not store or process sensitive credit card numbers or banking passwords. Digital wallet transactions are processed securely through certified payment aggregators (JazzCash / Easypaisa). Bank transfer receipt screenshots are securely stored and reviewed solely for order verification.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2">3. Third-Party Courier Sharing</h2>
        <p>
          We share your name, delivery address, and phone number with our verified Pakistani courier partners (such as TCS, Leopards, and Trax) solely for the fulfillment of your package dispatch.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2">4. Your Rights</h2>
        <p>
          You may request an update or deletion of your customer information at any time by contacting our privacy desk at <strong>care@seedly.pk</strong>.
        </p>
      </div>
    </div>
  );
}
