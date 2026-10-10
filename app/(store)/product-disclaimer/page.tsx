import { getContentDocument } from '@/lib/services/content';
import { ManagedSection } from '@/components/storefront/ManagedSections';
import type { CmsPageContent, SiteContent } from '@/lib/cms/storefront-types';
import { getContentMetadata } from '@/lib/cms/metadata';
import React from 'react';
import type { Metadata } from 'next';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return getContentMetadata('product-disclaimer');
}

export default async function ProductDisclaimerPage() {
  const cms = await getContentDocument<CmsPageContent>('product-disclaimer'); const { copy, links, images } = cms;
const siteConfig = (await getContentDocument<SiteContent>('site')).config;

  return (
    <div className="bg-white text-stone-900">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-20 space-y-10">
        <header className="max-w-2xl space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500">
            {copy.text_consumer_safety_compliance}</span>
          <h1 className="font-heading font-medium text-3xl sm:text-5xl text-stone-900 tracking-tight">
            {copy.text_product_dietary_disclaimer}</h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            {copy.text_important_consumer_clarity_regarding_raw_culinary_seeds}</p>
        </header>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10 space-y-8 text-xs sm:text-sm leading-relaxed text-stone-700 shadow-xs">
          {/* Main Food Status Box */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-semibold block text-xs sm:text-sm">{copy.text_standard_food_notice}</strong>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                {siteConfig.disclaimer.standard}
              </p>
            </div>
          </div>

          <ManagedSection document="product-disclaimer" sectionId="page_section_01"><section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">
              {copy.text_scope_of_culinary_nutritional_content}</h2>
            <p className="text-stone-600">
              {copy.text_information_presented_on_our_website_packaging_pouches}</p>
          </section></ManagedSection>

          <ManagedSection document="product-disclaimer" sectionId="page_section_02"><section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">
              {copy.text_medical_endocrine_advisory}</h2>
            <p className="text-stone-600">
              {siteConfig.disclaimer.medicalConsultation}
            </p>
          </section></ManagedSection>

          <ManagedSection document="product-disclaimer" sectionId="page_section_03"><section className="space-y-4 pt-2">
            <h2 className="font-heading font-medium text-lg text-stone-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
              <span>{copy.text_allergen_advisories}</span>
            </h2>

            <div className="space-y-3">
              {/* Facility Notice */}
              <div className="p-4 rounded-xl border border-stone-200 bg-[#FBFBFA] space-y-1">
                <strong className="text-stone-900 block font-medium">{copy.text_facility_allergen_statement}</strong>
                <p className="text-stone-600 leading-relaxed">
                  {siteConfig.disclaimer.facility}
                </p>
              </div>

              {/* Sesame Notice */}
              <div className="p-4 rounded-xl border border-stone-200 bg-[#FBFBFA] space-y-1">
                <strong className="text-stone-900 block font-medium">{copy.text_sesame_seeds_major_allergen}</strong>
                <p className="text-stone-600 leading-relaxed">
                  {siteConfig.disclaimer.sesame}
                </p>
              </div>

              {/* Chamomile Asteraceae Notice */}
              <div className="p-4 rounded-xl border border-stone-200 bg-[#FBFBFA] space-y-1">
                <strong className="text-stone-900 block font-medium">{copy.text_chamomile_blossoms_asteraceae_daisy_family}</strong>
                <p className="text-stone-600 leading-relaxed">
                  {siteConfig.disclaimer.chamomile}
                </p>
              </div>
            </div>
          </section></ManagedSection>

          <ManagedSection document="product-disclaimer" sectionId="page_section_04"><section className="space-y-2 pt-2 border-t border-stone-100">
            <h2 className="font-heading font-medium text-lg text-stone-900">
              {copy.text_questions_product_safety}</h2>
            <p className="text-stone-600">
              {copy.text_if_you_have_specific_ingredient_questions_dietary_sensi}{' '}
              <a href={siteConfig.contact.whatsappUrl} className="font-semibold text-stone-900 underline underline-offset-4">
                {copy.text_whatsapp}{siteConfig.contact.phone}
              </a>{' '}
              {copy.text_or_email}{' '}
              <a href={`mailto:${siteConfig.contact.email}`} className="font-semibold text-stone-900 underline underline-offset-4">
                {siteConfig.contact.email}
              </a>.
            </p>
          </section></ManagedSection>
        </div>
      </div>
    </div>
  );
}
