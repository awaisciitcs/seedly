import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, MessageCircle, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '../../../lib/config';

export const metadata: Metadata = {
  title: '7-Day Return & Replacement Policy | Seedly Pakistan',
  description:
    'Our fresh botanical guarantee. 7-day free replacements for damaged, unsealed, or quality-compromised parcels. Direct refunds via JazzCash, Easypaisa, or Bank Transfer.',
  openGraph: {
    title: '7-Day Return & Replacement Policy | Seedly Pakistan',
    description: '7-day replacement guarantee covering freshness, quality, and transit damage across Pakistan.',
    url: `${siteConfig.url}/returns`,
  },
};

export default function ReturnsPage() {
  return (
    <div className="bg-white text-stone-900">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-20 space-y-12">
        {/* Page Header */}
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500">
            Customer Assurance
          </span>
          <h1 className="font-heading font-medium text-3xl sm:text-5xl text-stone-900 tracking-tight">
            7-Day Quality &amp; Replacement Policy
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            Your confidence in the freshness, integrity, and safety of our seeds and botanical teas is our highest standard.
          </p>
        </header>

        {/* Guarantee Banner */}
        <div className="rounded-2xl border border-stone-200 bg-[#FBFBFA] p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-start gap-3.5 text-stone-900">
            <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-800 mt-0.5" />
            <div className="space-y-1.5 text-xs sm:text-sm">
              <h2 className="font-heading font-medium text-lg text-stone-900">
                7-Day Quality &amp; Freshness Guarantee
              </h2>
              <p className="text-stone-600 leading-relaxed">
                {siteConfig.disclaimer.returnsDamaged}
              </p>
            </div>
          </div>
        </div>

        {/* Policy Details */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10 space-y-8 text-xs sm:text-sm leading-relaxed text-stone-700 shadow-xs">
          {/* Food Safety Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-amber-950">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-semibold block text-xs sm:text-sm">Food Safety Notice (Change of Mind):</strong>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                {siteConfig.disclaimer.returnsChangeOfMind} Once an airtight barrier pouch or botanical seal has been broken, we cannot accept returns or restock the product.
              </p>
            </div>
          </div>

          {/* Eligible Claims */}
          <section className="space-y-3">
            <h2 className="font-heading font-medium text-xl text-stone-900">
              Eligible Claims for Free Replacement or Refund
            </h2>
            <ul className="space-y-2 text-stone-600 list-disc pl-5">
              <li>Item arrived damaged, crushed, leaking, or with a broken courier seal during transit.</li>
              <li>Verified quality or freshness issue (such as unexpected staleness, off-odour, or rancidity reported within 7 days of delivery).</li>
              <li>Incorrect seed variety, tea blend, or routine kit received compared to your confirmed invoice.</li>
              <li>Verified packaging defect (such as pouch tear or compromised resealable zipper upon unboxing).</li>
            </ul>
          </section>

          {/* How to Initiate a Claim */}
          <section className="space-y-3">
            <h2 className="font-heading font-medium text-xl text-stone-900">
              How to Initiate a Claim
            </h2>
            <p className="text-stone-600">
              Please contact our customer care team within <strong>7 days of delivery</strong> with your order number (e.g. SED-XXXXXX) and 1–2 clear photographs or an unboxing video showing the affected item:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <a
                href={`${siteConfig.contact.whatsappUrl}?text=${encodeURIComponent('Hello Seedly care team, I would like to report an issue with my delivered order.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl border border-stone-200 bg-[#FBFBFA] hover:bg-stone-100 transition-colors flex items-center gap-3.5 text-stone-900"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-semibold text-xs">WhatsApp Helpline</span>
                  <span className="text-xs text-stone-500">{siteConfig.contact.phone}</span>
                </div>
              </a>

              <a
                href={`mailto:${siteConfig.contact.email}?subject=${encodeURIComponent('Seedly Return / Replacement Request')}`}
                className="p-4 rounded-2xl border border-stone-200 bg-[#FBFBFA] hover:bg-stone-100 transition-colors flex items-center gap-3.5 text-stone-900"
              >
                <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-semibold text-xs">Email Support</span>
                  <span className="text-xs text-stone-500">{siteConfig.contact.email}</span>
                </div>
              </a>
            </div>
          </section>

          {/* Refund Methods */}
          <section className="space-y-2 pt-2 border-t border-stone-100">
            <h2 className="font-heading font-medium text-xl text-stone-900">
              Refund Methods &amp; Timelines
            </h2>
            <p className="text-stone-600 leading-relaxed">
              If an immediate replacement is not preferred, an approved refund will be processed back to your chosen payment method within <strong>2–3 business days</strong>. For Cash on Delivery (COD) orders, refunds are transferred directly via <strong>JazzCash</strong>, <strong>Easypaisa</strong>, or <strong>Pakistani online bank transfer (IBFT)</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
