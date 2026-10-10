import { getContentDocument } from '@/lib/services/content';
import { ManagedSection } from '@/components/storefront/ManagedSections';
import type { CmsPageContent, SiteContent } from '@/lib/cms/storefront-types';
import { getContentMetadata } from '@/lib/cms/metadata';
import React from 'react';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return getContentMetadata('terms');
}

export default async function TermsPage() {
  const cms = await getContentDocument<CmsPageContent>('terms'); const { copy, links, images } = cms;
const siteConfig = (await getContentDocument<SiteContent>('site')).config;

  return (
    <div className="bg-white text-stone-900">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-20 space-y-10">
        <header className="max-w-2xl space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500">
            {copy.text_legal_terms}</span>
          <h1 className="font-heading font-medium text-3xl sm:text-5xl text-stone-900 tracking-tight">
            {copy.text_terms_of_service}</h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            {copy.text_straightforward_terms_governing_catalog_orders_nationwi}</p>
        </header>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10 space-y-8 text-xs sm:text-sm leading-relaxed text-stone-700 shadow-xs">
          <ManagedSection document="terms" sectionId="page_section_01"><section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">{copy.text_1_orders_address_verification}</h2>
            <p className="text-stone-600">
              {copy.text_when_you_place_an_order_on_seedly_pk_you_will_receive_a}</p>
          </section></ManagedSection>

          <ManagedSection document="terms" sectionId="page_section_02"><section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">{copy.text_2_pricing_payment_options}</h2>
            <p className="text-stone-600">
              {copy.text_all_prices_are_listed_in_pakistani_rupees_pkr_and_inclu}</p>
          </section></ManagedSection>

          <ManagedSection document="terms" sectionId="page_section_03"><section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">{copy.text_3_nationwide_courier_dispatch}</h2>
            <p className="text-stone-600">
              {copy.text_orders_placed_by_3_00_pm_pkt_monday_to_saturday_are_dis}<strong>{copy.text_tcs}</strong> {copy.text_and}<strong>{copy.text_leopards_courier}</strong>{copy.text_expected_transit_times_are}</p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              {siteConfig.shipping.timelines.map((timeline, idx) => (
                <li key={idx}>
                  <strong>{timeline.area}:</strong> {timeline.time}
                </li>
              ))}
            </ul>
            <p className="text-stone-600 pt-1">
              {copy.text_current_delivery_charges_and_any_free_delivery_threshol}</p>
          </section></ManagedSection>

          <ManagedSection document="terms" sectionId="page_section_04"><section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">{copy.text_4_7_day_replacement_guarantee_food_safety_returns}</h2>
            <p className="text-stone-600">
              {siteConfig.disclaimer.returnsDamaged}
            </p>
            <p className="text-stone-600">
              {siteConfig.disclaimer.returnsChangeOfMind}
            </p>
          </section></ManagedSection>

          <ManagedSection document="terms" sectionId="page_section_05"><section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">{copy.text_5_food_notice_dietary_status}</h2>
            <p className="text-stone-600">
              {siteConfig.disclaimer.standard}
            </p>
          </section></ManagedSection>

          <ManagedSection document="terms" sectionId="page_section_06"><section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">{copy.text_6_customer_care_inquiries}</h2>
            <p className="text-stone-600">
              {copy.text_for_any_questions_regarding_these_terms_your_order_stat}{' '}
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
