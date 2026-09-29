import React from 'react';
import type { Metadata } from 'next';
import { ShieldAlert, Info, AlertTriangle } from 'lucide-react';
import { siteConfig } from '../../../lib/config';

export const metadata: Metadata = {
  title: 'Dietary & Natural Product Disclaimer | Seedly Pakistan',
  description:
    'Important dietary consumer advisory regarding raw seeds, culinary nutrition, and botanical infusions from Seedly.',
  openGraph: {
    title: 'Product Disclaimer | Seedly Pakistan',
    description: 'Dietary food status, allergen notices, and guidance regarding Seedly culinary staples.',
  },
};

export default function ProductDisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
          Compliance Notice
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          Product &amp; Dietary Disclaimer
        </h1>
        <p className="text-sm text-muted-gray">
          Important consumer clarity regarding raw culinary seeds and botanical herbal teas.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border-gray shadow-card space-y-6 text-sm leading-relaxed text-charcoal">
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 text-xs sm:text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Standard Food Notice: </strong>
            {siteConfig.disclaimer.standard}
          </p>
        </div>

        <h2 className="font-serif text-xl font-bold pt-2 text-charcoal">Scope of Culinary &amp; Nutritional Content</h2>
        <p className="text-muted-gray text-xs sm:text-sm leading-relaxed">
          Information published on our website, packaging labels, educational routine guides, and WhatsApp consultation channels is presented strictly for educational and wholesome dietary purposes. Seedly seeds (pumpkin, flax, sunflower, sesame) and mountain teas (chamomile, spearmint, green tea) are raw food ingredients, not pharmaceutical drugs or endocrine therapies.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2 text-charcoal">Medical Consultation</h2>
        <p className="text-muted-gray text-xs sm:text-sm leading-relaxed">
          Always consult a qualified medical physician or certified dietitian before adopting a new nutritional rotation if you are pregnant, nursing, managing an endocrine disorder (such as PCOS, endometriosis, or thyroid conditions), or taking chronic prescription medications.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2 text-charcoal flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-700" />
          <span>Allergen Advisories</span>
        </h2>
        <div className="space-y-3 text-xs sm:text-sm">
          <div className="p-4 bg-cream rounded-xl border border-border-gray space-y-1">
            <strong className="text-charcoal block">Sesame Seeds (Allergen):</strong>
            <p className="text-muted-gray leading-relaxed">
              {siteConfig.disclaimer.sesame}
            </p>
          </div>
          <div className="p-4 bg-cream rounded-xl border border-border-gray space-y-1">
            <strong className="text-charcoal block">Chamomile Blossoms (Asteraceae Family):</strong>
            <p className="text-muted-gray leading-relaxed">
              {siteConfig.disclaimer.chamomile}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
