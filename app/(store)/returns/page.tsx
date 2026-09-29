import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { RotateCcw, ShieldCheck, CheckCircle2, Phone, AlertCircle, MessageCircle } from 'lucide-react';
import { siteConfig } from '../../../lib/config';

export const metadata: Metadata = {
  title: '7-Day Return & Replacement Policy | Seedly Pakistan',
  description:
    'Our fresh botanical guarantee. 7-day free replacements for damaged or unsealed parcels. Direct refunds via JazzCash, Easypaisa, or Bank Transfer.',
  openGraph: {
    title: '7-Day Return & Replacement Policy | Seedly Pakistan',
    description: '7-day replacement guarantee for damaged or unsealed parcels. Food safety returns terms.',
  },
};

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
          Customer Assurance
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          7-Day Return &amp; Replacement Policy
        </h1>
        <p className="text-sm text-muted-gray">
          Your confidence in the freshness, integrity, and safety of our seeds and botanicals is our top priority.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-6 text-sm leading-relaxed text-charcoal">
        <div className="flex items-start gap-3.5 text-emerald-900 bg-emerald-50/90 p-4 rounded-2xl border border-emerald-200">
          <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-700 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm">
            <h3 className="font-bold font-serif text-emerald-950">7-Day Free Replacement Guarantee</h3>
            <p className="text-emerald-900/90 leading-relaxed">
              {siteConfig.disclaimer.returnsDamaged}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs sm:text-sm text-amber-950">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block mb-0.5">Food Safety Notice (Change of Mind):</strong>
            <p className="text-amber-900/90 leading-relaxed">
              {siteConfig.disclaimer.returnsChangeOfMind} Once an airtight barrier pouch or glass jar seal has been opened, we cannot accept returns or restock the item.
            </p>
          </div>
        </div>

        <h2 className="font-serif text-xl font-bold pt-4 text-charcoal">Eligible Claims for Free Replacement or Refund</h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-gray text-xs sm:text-sm">
          <li>Item arrived damaged, crushed, leaking, or with a broken factory seal during courier transit.</li>
          <li>Incorrect seed variety, tea, or routine kit received compared to your confirmed invoice.</li>
          <li>Verified packaging defect (such as pouch tear or compromised ziplock seal upon unboxing).</li>
        </ul>

        <h2 className="font-serif text-xl font-bold pt-4 text-charcoal">How to Initiate a Claim</h2>
        <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
          Please contact our customer support team within <strong>7 days of delivery</strong>:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <a
            href={`${siteConfig.contact.whatsappUrl}?text=${encodeURIComponent('Hello Seedly team, I would like to report an issue with my delivered order.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-cream/60 border border-border-gray hover:bg-cream transition-colors flex items-center gap-3 text-charcoal"
          >
            <MessageCircle className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <span className="block font-semibold text-xs">WhatsApp Helpline</span>
              <span className="text-xs text-muted-gray">{siteConfig.contact.phone}</span>
            </div>
          </a>
          <a
            href={`mailto:${siteConfig.contact.email}?subject=${encodeURIComponent('Seedly Return / Replacement Request')}`}
            className="p-4 rounded-2xl bg-cream/60 border border-border-gray hover:bg-cream transition-colors flex items-center gap-3 text-charcoal"
          >
            <Phone className="w-5 h-5 text-seedly-primary shrink-0" />
            <div>
              <span className="block font-semibold text-xs">Email Support</span>
              <span className="text-xs text-muted-gray">{siteConfig.contact.email}</span>
            </div>
          </a>
        </div>
        <p className="text-xs text-muted-gray leading-relaxed">
          Please attach your order number (e.g., SED-...) and 1–2 clear photographs or an unboxing video of the affected items and outer packaging.
        </p>

        <h2 className="font-serif text-xl font-bold pt-4 text-charcoal">Refund Methods &amp; Timelines</h2>
        <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
          If a replacement is not preferred, an approved refund will be processed back to your chosen payment method within <strong>2–3 business days</strong>. For Cash on Delivery (COD) orders, refunds are transferred directly via <strong>JazzCash</strong>, <strong>Easypaisa</strong>, or <strong>Pakistani bank transfer (IBFT)</strong>.
        </p>
      </div>
    </div>
  );
}
