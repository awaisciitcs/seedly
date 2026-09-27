import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export default function ProductDisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
          Compliance Notice
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          Natural Product Disclaimer
        </h1>
        <p className="text-sm text-muted-gray">
          Important consumer clarity regarding dietary seeds and botanical herbal teas.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border-gray shadow-card space-y-6 text-sm leading-relaxed text-charcoal">
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <p>
            The products offered by Seedly Naturals are 100% natural, unadulterated whole foods, seeds, and herbal infusions. They are not intended to diagnose, treat, cure, or prevent any medical condition or disease.
          </p>
        </div>

        <h2 className="font-serif text-xl font-bold pt-2">Scope of Botanical Information</h2>
        <p>
          Information provided on our website, packaging, social media channels, and wellness guides is compiled from traditional holistic usage, published dietary nutritional studies, and general food science. It is for educational and self-care routine purposes only.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2">Medical Consultation</h2>
        <p>
          Always consult with a qualified physician or licensed healthcare provider prior to starting any new dietary protocol, particularly if you are pregnant, nursing, have an existing medical diagnosis (such as thyroid disorders, renal conditions, or hormonal treatments), or are taking prescription medications.
        </p>

        <h2 className="font-serif text-xl font-bold pt-2">Allergen Notice</h2>
        <p>
          Our seeds and teas are processed in clean, dedicated facilities. However, our products include sesame seeds and sunflower kernels, which are known food allergens for certain sensitive individuals. If you experience any allergic reaction, discontinue use immediately and seek medical attention.
        </p>
      </div>
    </div>
  );
}
