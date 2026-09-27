import React from 'react';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, CheckCircle2, Phone } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
          Customer Assurance
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          7-Day Return & Replacement
        </h1>
        <p className="text-sm text-muted-gray">
          Your complete satisfaction with our fresh botanical harvest is our highest priority.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-6 text-sm leading-relaxed text-charcoal">
        <div className="flex items-center gap-3 text-emerald-800 bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
          <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-600" />
          <p className="text-xs font-medium">
            Every Seedly purchase is protected by our 7-Day Hassle-Free Replacement Policy. If your package arrives damaged or you are unsatisfied with product freshness, we will make it right.
          </p>
        </div>

        <h2 className="font-serif text-xl font-bold pt-2">Eligible Conditions</h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-gray text-xs">
          <li>Product arrived damaged, leaking, or with a broken tamper seal during transit.</li>
          <li>Incorrect product or variant received compared to your confirmed order.</li>
          <li>Unsatisfactory aroma or quality defect reported within 7 days of package delivery.</li>
        </ul>

        <h2 className="font-serif text-xl font-bold pt-2">How to Request a Replacement or Refund</h2>
        <p>
          Simply take a clear photo of the delivered items and share it with your order number via WhatsApp at <strong>+92 300 1234567</strong> or email <strong>care@seedly.pk</strong>. Our team will review within 24 hours and arrange a prompt replacement or refund.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2">Refund Processing</h2>
        <p>
          Approved refunds will be credited directly to your JazzCash, Easypaisa, or designated Pakistani bank account within 2–3 business days.
        </p>
      </div>
    </div>
  );
}
