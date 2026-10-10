import { getContentDocument } from '@/lib/services/content';
import { ManagedSection } from '@/components/storefront/ManagedSections';
import type { CmsPageContent, SiteContent } from '@/lib/cms/storefront-types';
import { getContentMetadata } from '@/lib/cms/metadata';
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, MessageCircle, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return getContentMetadata('returns');
}

export default async function ReturnsPage() {
  const cms = await getContentDocument<CmsPageContent>('returns'); const { copy, links, images } = cms;
const siteConfig = (await getContentDocument<SiteContent>('site')).config;

  return (
    <div className="bg-white text-stone-900">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-20 space-y-12">
        {/* Page Header */}
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500">
            {copy.text_customer_assurance}</span>
          <h1 className="font-heading font-medium text-3xl sm:text-5xl text-stone-900 tracking-tight">
            {copy.text_7_day_quality_replacement_policy}</h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            {copy.text_your_confidence_in_the_freshness_integrity_and_safety_o}</p>
        </header>

        {/* Guarantee Banner */}
        <div className="rounded-2xl border border-stone-200 bg-[#FBFBFA] p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-start gap-3.5 text-stone-900">
            <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-800 mt-0.5" />
            <div className="space-y-1.5 text-xs sm:text-sm">
              <h2 className="font-heading font-medium text-lg text-stone-900">
                {copy.text_7_day_quality_freshness_guarantee}</h2>
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
              <strong className="font-semibold block text-xs sm:text-sm">{copy.text_food_safety_notice_change_of_mind}</strong>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                {siteConfig.disclaimer.returnsChangeOfMind} {copy.text_once_an_airtight_barrier_pouch_or_botanical_seal_has_be}</p>
            </div>
          </div>

          {/* Eligible Claims */}
          <ManagedSection document="returns" sectionId="page_section_01"><section className="space-y-3">
            <h2 className="font-heading font-medium text-xl text-stone-900">
              {copy.text_eligible_claims_for_free_replacement_or_refund}</h2>
            <ul className="space-y-2 text-stone-600 list-disc pl-5">
              <li>{copy.text_item_arrived_damaged_crushed_leaking_or_with_a_broken_c}</li>
              <li>{copy.text_verified_quality_or_freshness_issue_such_as_unexpected}</li>
              <li>{copy.text_incorrect_seed_variety_tea_blend_or_routine_kit_receive}</li>
              <li>{copy.text_verified_packaging_defect_such_as_pouch_tear_or_comprom}</li>
            </ul>
          </section></ManagedSection>

          {/* How to Initiate a Claim */}
          <ManagedSection document="returns" sectionId="page_section_02"><section className="space-y-3">
            <h2 className="font-heading font-medium text-xl text-stone-900">
              {copy.text_how_to_initiate_a_claim}</h2>
            <p className="text-stone-600">
              {copy.text_please_contact_our_customer_care_team_within}<strong>{copy.text_7_days_of_delivery}</strong> {copy.text_with_your_order_number_e_g_sed_xxxxxx_and_1_2_clear_pho}</p>

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
                  <span className="block font-semibold text-xs">{copy.text_whatsapp_helpline}</span>
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
                  <span className="block font-semibold text-xs">{copy.text_email_support}</span>
                  <span className="text-xs text-stone-500">{siteConfig.contact.email}</span>
                </div>
              </a>
            </div>
          </section></ManagedSection>

          {/* Refund Methods */}
          <ManagedSection document="returns" sectionId="page_section_03"><section className="space-y-2 pt-2 border-t border-stone-100">
            <h2 className="font-heading font-medium text-xl text-stone-900">
              {copy.text_refund_methods_timelines}</h2>
            <p className="text-stone-600 leading-relaxed">
              {copy.text_if_an_immediate_replacement_is_not_preferred_an_approve}<strong>{copy.text_2_3_business_days}</strong>{copy.text_for_cash_on_delivery_cod_orders_refunds_are_transferred}<strong>{copy.text_jazzcash}</strong>, <strong>{copy.text_easypaisa}</strong>{copy.text_or}<strong>{copy.text_pakistani_online_bank_transfer_ibft}</strong>.
            </p>
          </section></ManagedSection>
        </div>
      </div>
    </div>
  );
}
