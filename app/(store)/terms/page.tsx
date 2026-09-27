import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
          Store Agreement
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-gray">
          Standard terms governing catalog purchases on Seedly.pk.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border-gray shadow-card space-y-6 text-sm leading-relaxed text-charcoal">
        <h2 className="font-serif text-xl font-bold">1. Order Placement & Acceptance</h2>
        <p>
          By placing an order on Seedly.pk, you warrant that all contact and delivery details provided are accurate. We reserve the right to cancel or place on hold any order with unverified payment receipts or inaccessible delivery addresses.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2">2. Pricing & Invariant Guarantee</h2>
        <p>
          All product prices are quoted in Pakistani Rupees (PKR) and calculated authoritatively by our server checkout engine. In the event of a technical pricing error, we reserve the right to contact you prior to dispatch.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2">3. Product Availability & Kit Formulation</h2>
        <p>
          Seed kits are assembled dynamically from our heirloom seed batches. If an individual component seed SKU experiences a crop harvest bottleneck, kit availability will automatically adjust.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2">4. Governing Law</h2>
        <p>
          These terms and transactions conducted through Seedly.pk are governed by the applicable laws of the Islamic Republic of Pakistan.
        </p>
      </div>
    </div>
  );
}
