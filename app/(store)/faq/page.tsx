import { getContentDocument } from '@/lib/services/content';
import { ManagedSection } from '@/components/storefront/ManagedSections';
import type { CmsPageContent, SiteContent, FaqContent } from '@/lib/cms/storefront-types';
import { getContentMetadata } from '@/lib/cms/metadata';
import { serializeStructuredData } from '@/lib/structured-data';
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronDown, Phone, Mail, ArrowRight } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return getContentMetadata('faq');
}

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}



export default async function FaqPage() {
  const cms = await getContentDocument<FaqContent>('faq'); const { copy, links, images } = cms; const faqs=cms.items;
const siteConfig = (await getContentDocument<SiteContent>('site')).config;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="bg-white text-stone-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeStructuredData(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-20 space-y-12">
        {/* Header */}
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500">
            {copy.text_answers_guidance}</span>
          <h1 className="font-heading font-medium text-3xl sm:text-5xl text-stone-900 tracking-tight">
            {copy.text_frequently_asked_questions}</h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            {copy.text_clear_facts_on_our_smallholder_sourcing_cold_milling_st}</p>
        </header>

        {/* FAQ List using native semantic accessible <details> elements (SSR-rendered for SEO & crawlers) */}
        <div className="space-y-3.5">
          {faqs.map((item, idx) => (
            <details
              key={idx}
              open={idx === 0}
              className="group rounded-2xl border border-stone-200 bg-[#FBFBFA] p-5 sm:p-6 transition-all duration-200 open:bg-white open:shadow-xs"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading font-medium text-base sm:text-lg text-stone-900 select-none">
                <div className="space-y-1 text-start">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-600 bg-white border border-stone-200/90 px-2.5 py-0.5 rounded-full inline-block">
                    {item.category}
                  </span>
                  <h2 className="font-heading font-medium text-base sm:text-lg text-stone-900">
                    {item.question}
                  </h2>
                </div>
                <div className="w-8 h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center shrink-0 text-stone-500 group-open:rotate-180 group-open:bg-stone-900 group-open:text-white transition-all">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </summary>

              <div className="mt-4 pt-3.5 border-t border-stone-200/60 text-xs sm:text-sm text-stone-600 leading-relaxed text-start">
                {item.answer}
              </div>
            </details>
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <ManagedSection document="faq" sectionId="page_section_01"><section aria-labelledby="cta-heading" className="rounded-3xl border border-stone-200 bg-[#F5F5F4] p-8 sm:p-10 text-center space-y-4">
          <h2 id="cta-heading" className="font-heading font-medium text-xl sm:text-2xl text-stone-900">
            {copy.text_still_have_a_question}</h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            {copy.text_our_lahore_pantry_team_is_available_monday_to_saturday}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={siteConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-stone-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-xs"
            >
              <Phone className="w-4 h-4" />
              <span>{copy.text_whatsapp}{siteConfig.contact.phone})</span>
            </a>
            <Link
              href={links.href_contact}
              className="px-6 py-3 rounded-full bg-white border border-stone-200 text-stone-900 text-xs sm:text-sm font-semibold hover:bg-stone-50 transition-all shadow-xs flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>{copy.text_contact_care_team}</span>
            </Link>
          </div>
        </section></ManagedSection>
      </div>
    </div>
  );
}
