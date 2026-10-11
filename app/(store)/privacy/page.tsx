import {TrackingPrivacyDetails} from '@/components/tracking/TrackingPrivacyDetails';
import { getContentDocument } from '@/lib/services/content';
import { ManagedSection } from '@/components/storefront/ManagedSections';
import type { CmsPageContent, SiteContent } from '@/lib/cms/storefront-types';
import { getContentMetadata } from '@/lib/cms/metadata';
import React from 'react';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return getContentMetadata('privacy');
}

export default async function PrivacyPage() {
  const cms = await getContentDocument<CmsPageContent>('privacy'); const { copy, links, images } = cms;
const siteConfig = (await getContentDocument<SiteContent>('site')).config;

  return (
    <div className="bg-white text-stone-900">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-20 space-y-10">
        <header className="max-w-2xl space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500">
            {copy.text_data_protection}</span>
          <h1 className="font-heading font-medium text-3xl sm:text-5xl text-stone-900 tracking-tight">
            {copy.text_privacy_policy}</h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            {copy.text_how_seedly_respects_handles_and_safeguards_your_custome}</p>
        </header>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10 space-y-8 text-xs sm:text-sm leading-relaxed text-stone-700 shadow-xs">
          <ManagedSection document="privacy" sectionId="page_section_01"><section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">{copy.text_1_information_we_collect}</h2>
            <p className="text-stone-600">
              {copy.text_we_collect_personal_information_necessary_to_deliver_yo}</p>
          </section></ManagedSection>

          <ManagedSection document="privacy" sectionId="page_section_02"><section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">{copy.text_2_routine_questionnaire_interactive_tools}</h2>
            <p className="text-stone-600">
              {copy.text_when_you_use_our_routine_finder_questionnaire_cycle_cal}</p>
          </section></ManagedSection>

          <ManagedSection document="privacy" sectionId="page_section_03"><section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">{copy.text_3_email_newsletter_communications}</h2>
            <p className="text-stone-600">
              {copy.text_if_you_subscribe_to_our_fresh_dispatches_newsletter_we}</p>
          </section></ManagedSection>

          <ManagedSection document="privacy" sectionId="page_section_04"><section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">{copy.text_4_payment_processing_verification}</h2>
            <p className="text-stone-600">
              {copy.text_seedly_does_not_collect_process_or_store_credit_debit_c}</p>
          </section></ManagedSection>

          <ManagedSection document="privacy" sectionId="page_section_05"><section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">{copy.text_5_courier_logistics_partners}</h2>
            <p className="text-stone-600">
              {copy.text_to_fulfill_your_physical_delivery_we_share_your_recipie}<strong>{copy.text_tcs}</strong> {copy.text_and}<strong>{copy.text_leopards_courier}</strong>{copy.text_they_use_this_data_solely_to_transport_the_parcel_and_s}</p>
          </section></ManagedSection>

          <ManagedSection document="privacy" sectionId="page_section_06"><section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">{copy.text_6_cookies_anonymous_analytics}</h2>
            <p className="text-stone-600">
              {copy.text_we_use_essential_first_party_cookies_to_remember_your_s}</p>
          </section></ManagedSection>

          <TrackingPrivacyDetails />

          <ManagedSection document="privacy" sectionId="page_section_07"><section className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900">{copy.text_7_your_data_rights}</h2>
            <p className="text-stone-600">
              {copy.text_you_have_the_right_to_request_access_to_correction_of_o}{' '}
              <a href={siteConfig.contact.whatsappUrl} className="font-semibold text-stone-900 underline underline-offset-4">
                {siteConfig.contact.phone}
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
