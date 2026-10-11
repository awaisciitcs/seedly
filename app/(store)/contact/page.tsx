import {LeadForm} from '@/components/tracking/LeadForm';
import { getContentDocument } from '@/lib/services/content';
import { ManagedSection } from '@/components/storefront/ManagedSections';
import type { CmsPageContent, SiteContent } from '@/lib/cms/storefront-types';
import { getContentMetadata } from '@/lib/cms/metadata';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MessageCircle, Phone, Mail, ArrowUpRight } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return getContentMetadata('contact');
}

export default async function ContactPage() {
  const cms = await getContentDocument<CmsPageContent>('contact'); const { copy, links, images } = cms;
const siteConfig = (await getContentDocument<SiteContent>('site')).config;

  return (
    <div className="bg-white text-stone-900">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 md:py-20">
        <header className="max-w-2xl space-y-3">
          <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500">
            {copy.text_customer_care}</span>
          <h1 className="font-heading font-medium text-3xl sm:text-5xl lg:text-6xl text-stone-900 tracking-tight leading-tight">
            {copy.text_contact_seedly}</h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            {copy.text_a_question_about_your_order_choosing_seeds_or_brewing_y}</p>
        </header>

        <div className="mt-12 grid gap-12 border-t border-stone-200 pt-8 lg:mt-16 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          {/* Main Ways to Get in Touch */}
          <ManagedSection document="contact" sectionId="page_section_01"><section aria-labelledby="contact-options-heading" className="divide-y divide-stone-200">
            <h2 id="contact-options-heading" className="sr-only">
              {copy.text_ways_to_get_in_touch}</h2>

            {/* WhatsApp */}
            <div className="py-7 sm:flex sm:items-start sm:justify-between sm:gap-8 first:pt-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-heading font-medium text-xl text-stone-900">{copy.text_whatsapp}</h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm">
                  {copy.text_instant_order_assistance_address_confirmations_and_pers}</p>
              </div>
              <a
                href={siteConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-900 hover:text-stone-600 underline underline-offset-4 sm:mt-1 shrink-0"
              >
                <span>{copy.text_message_on_whatsapp}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Phone */}
            <div className="py-7 sm:flex sm:items-start sm:justify-between sm:gap-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-stone-800" />
                  <h3 className="font-heading font-medium text-xl text-stone-900">{copy.text_phone}</h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm">
                  {copy.text_speak_directly_with_our_care_desk_during_customer_servi}</p>
              </div>
              <a
                href={`tel:+${siteConfig.contact.phoneRaw}`}
                className="mt-4 inline-block text-xs sm:text-sm font-semibold text-stone-900 hover:text-stone-600 underline underline-offset-4 sm:mt-1 shrink-0"
              >
                {siteConfig.contact.phoneInternational}
              </a>
            </div>

            {/* Email */}
            <div className="py-7 sm:flex sm:items-start sm:justify-between sm:gap-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-stone-800" />
                  <h3 className="font-heading font-medium text-xl text-stone-900">{copy.text_email}</h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm">
                  {copy.text_write_to_us_with_parcel_photographs_feedback_or_wholesa}</p>
              </div>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="mt-4 inline-block text-xs sm:text-sm font-semibold text-stone-900 hover:text-stone-600 underline underline-offset-4 sm:mt-1 shrink-0"
              >
                {siteConfig.contact.email}
              </a>
            </div>
          </section></ManagedSection>

          {/* Details Sidebar */}
          <aside className="space-y-8 lg:pt-2">
            <div className="space-y-2">
              <h2 className="font-heading font-medium text-xl text-stone-900">
                {copy.text_inquiring_about_an_existing_order}</h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {copy.text_please_include_your_order_number_e_g_sed_xxxxxx_and_you}</p>
            </div>

            <div className="space-y-1.5 pt-4 border-t border-stone-200">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">{copy.text_customer_care_hours}</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{siteConfig.contact.hours}</p>
            </div>

            <div className="space-y-1.5 pt-4 border-t border-stone-200">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">{siteConfig.contact.dispatchHub}</h3>
              <address className="text-xs sm:text-sm not-italic text-stone-600 leading-relaxed">{siteConfig.contact.address}</address>
            </div>
          </aside>
        </div>

        <LeadForm />

        {/* Helpful Links Grid */}
        <nav aria-label="Customer help" className="mt-14 grid gap-6 border-t border-stone-200 pt-8 sm:grid-cols-3 lg:mt-20">
          <div className="space-y-1">
            <Link
              href={links.href_shipping}
              className="text-sm font-semibold text-stone-900 hover:text-stone-600 underline underline-offset-4"
            >
              {copy.text_shipping_delivery}</Link>
            <p className="text-xs text-stone-500">{copy.text_delivery_areas_flat_charges_and_estimated_timings}</p>
          </div>
          <div className="space-y-1">
            <Link
              href={links.href_returns}
              className="text-sm font-semibold text-stone-900 hover:text-stone-600 underline underline-offset-4"
            >
              {copy.text_returns_replacements}</Link>
            <p className="text-xs text-stone-500">{copy.text_7_day_guarantee_details_and_how_to_initiate_a_claim}</p>
          </div>
          <div className="space-y-1">
            <Link
              href={links.href_faq}
              className="text-sm font-semibold text-stone-900 hover:text-stone-600 underline underline-offset-4"
            >
              {copy.text_frequently_asked_questions}</Link>
            <p className="text-xs text-stone-500">{copy.text_answers_about_cold_milled_seeds_brewing_and_storage}</p>
          </div>
        </nav>
      </div>
    </div>
  );
}
