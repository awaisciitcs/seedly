import React from 'react';
import type { Metadata } from 'next';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '../../../lib/config';

export const metadata: Metadata = {
  title: 'Dietary & Product Disclaimer | Seedly Pakistan',
  description:
    'Important dietary consumer advisory regarding raw seeds, culinary nutrition, allergen notices, and botanical infusions from Seedly.',
  openGraph: {
    title: 'Product & Dietary Disclaimer | Seedly Pakistan',
    description: 'Dietary food status, allergen notices, and healthcare guidance regarding Seedly culinary staples.',
    url: `${siteConfig.url}/product-disclaimer`,
  },
};

export default function ProductDisclaimerPage() {
  return (
    <div className="bg-white text-stone-900">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-20 space-y-10">
        <header className="max-w-2xl space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500">
            Consumer Safety &amp; Compliance
          </span>
          <h1 className="font-heading font-medium text-3xl sm:text-5xl text-stone-900 tracking-tight">
            Product &amp; Dietary Disclaimer
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            Important consumer clarity regarding raw culinary seeds, botanical herbal teas, and routine practices.
          </p>
        </header>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10 space-y-8 text-xs sm:text-sm leading-relaxed text-stone-700 shadow-xs">
          {/* Main Food Status Box */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-semibold block text-xs sm:text-sm">Standard Food Notice:</strong>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                {siteConfig.disclaimer.standard}
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">
              Scope of Culinary &amp; Nutritional Content
            </h2>
            <p className="text-stone-600">
              Information presented on our website, packaging pouches, printed routine inserts, and customer care channels is published strictly for culinary and wholesome nutritional education. Seedly seeds (pumpkin, cold-milled flax, sunflower, sesame) and mountain teas (chamomile, spearmint, green tea) are raw food ingredients, not pharmaceutical drugs, endocrine therapies, or treatments for diagnosed medical conditions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">
              Medical &amp; Endocrine Advisory
            </h2>
            <p className="text-stone-600">
              {siteConfig.disclaimer.medicalConsultation}
            </p>
          </section>

          <section className="space-y-4 pt-2">
            <h2 className="font-heading font-medium text-lg text-stone-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
              <span>Allergen Advisories</span>
            </h2>

            <div className="space-y-3">
              {/* Facility Notice */}
              <div className="p-4 rounded-xl border border-stone-200 bg-[#FBFBFA] space-y-1">
                <strong className="text-stone-900 block font-medium">Facility Allergen Statement:</strong>
                <p className="text-stone-600 leading-relaxed">
                  {siteConfig.disclaimer.facility}
                </p>
              </div>

              {/* Sesame Notice */}
              <div className="p-4 rounded-xl border border-stone-200 bg-[#FBFBFA] space-y-1">
                <strong className="text-stone-900 block font-medium">Sesame Seeds (Major Allergen):</strong>
                <p className="text-stone-600 leading-relaxed">
                  {siteConfig.disclaimer.sesame}
                </p>
              </div>

              {/* Chamomile Asteraceae Notice */}
              <div className="p-4 rounded-xl border border-stone-200 bg-[#FBFBFA] space-y-1">
                <strong className="text-stone-900 block font-medium">Chamomile Blossoms (Asteraceae / Daisy Family):</strong>
                <p className="text-stone-600 leading-relaxed">
                  {siteConfig.disclaimer.chamomile}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2 pt-2 border-t border-stone-100">
            <h2 className="font-heading font-medium text-lg text-stone-900">
              Questions &amp; Product Safety
            </h2>
            <p className="text-stone-600">
              If you have specific ingredient questions, dietary sensitivities, or need batch verification details, contact our Lahore team directly via{' '}
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
