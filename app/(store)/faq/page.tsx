import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronDown, Phone, Mail, ArrowRight } from 'lucide-react';
import { siteConfig } from '../../../lib/config';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Seedly Pakistan',
  description:
    'Answers about raw seeds, mountain teas, seed cycling routines, nationwide delivery across Pakistan, and our 7-day quality guarantee.',
  openGraph: {
    title: 'Frequently Asked Questions | Seedly Pakistan',
    description:
      'Everything you need to know about our sourcing, fresh cold-milling, brewing parameters, couriers, and payment verification.',
    url: `${siteConfig.url}/faq`,
  },
};

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FaqItem[] = [
  {
    category: 'Seed Routines & Usage',
    question: 'What is seed cycling and how does it work?',
    answer:
      'Seed cycling is a traditional whole-food dietary habit where you rotate four nutrient-dense pantry seeds between the two phases of your monthly cycle. During Phase 1 (Days 1–14, Follicular), raw pumpkin seeds and cold-milled golden flax provide dietary magnesium, zinc, and plant-based ALA omega-3 fatty acids. During Phase 2 (Days 15–28, Luteal), raw sunflower kernels and unhulled sesame seeds supply natural Vitamin E, selenium, and essential minerals. While popular as a gentle dietary habit, research is early and limited. Individuals with PCOS, thyroid conditions, or who are pregnant or nursing should speak with their physician.',
  },
  {
    category: 'Seed Routines & Usage',
    question: 'Do I need to grind Seedly Golden Flax Seeds at home?',
    answer:
      'No grinding required! Whole flax seeds have a tough outer cellulose husk that passes through the digestive tract unabsorbed unless milled. To save you time and maximize nutrient absorption, Seedly Golden Flax is already freshly cold-milled into a coarse meal in small batches right here in Lahore. It arrives ready to spoon straight into yogurt bowls, warm oatmeal, or morning smoothies.',
  },
  {
    category: 'Seed Routines & Usage',
    question: 'How long does a 250g pouch or Complete Kit last?',
    answer:
      'Based on the standard daily serving of 1 level tablespoon (approx. 8–10g), a single 250g pouch provides roughly 25–30 daily servings. Our Complete Cycle Kit contains four separate 250g pouches (1kg total) plus a wooden measured scoop and cycle calendar, providing approximately 50–60 daily servings—enough for two complete 28-day cycles.',
  },
  {
    category: 'Mountain Teas & Brewing',
    question: 'Why does Seedly use loose whole chamomile flowers instead of teabags?',
    answer:
      'Commercial teabags frequently contain finely pulverized "tea dust" (fannings) that leach bitter tannins, and many bags contain microplastics or bleached paper fibers. Our whole chamomile flowers are intact blossoms harvested by smallholder growers in high mountain valleys of Gilgit-Baltistan, delivering a clean, sweet honey-apple infusion without microplastics or artificial additives.',
  },
  {
    category: 'Mountain Teas & Brewing',
    question: 'What are the recommended water temperatures and steeping times?',
    answer:
      'For Pure Chamomile Flowers: 1 rounded teaspoon (approx. 2.5g) in 200–250ml freshly boiled water (95–100°C), steeping 5–7 minutes for a soothing evening cup (yields approx. 20 cups per 50g pack). For Highland Spearmint Leaf: 1 teaspoon (approx. 2g) in 90–95°C water, steeping 4–5 minutes. For Highland Green Tea: 1 teaspoon in cooler water (approx. 80°C) for 2–3 minutes to avoid bitter astringency.',
  },
  {
    category: 'Mountain Teas & Brewing',
    question: 'Are your herbal teas caffeine-free?',
    answer:
      'Both our Pure Mountain Chamomile Flowers and Highland Spearmint Leaf teas are 100% naturally caffeine-free herbal tisanes that can be enjoyed any time of day or night. Highland Green Tea contains a gentle amount of natural caffeine (approx. 20–25mg per cup).',
  },
  {
    category: 'Storage & Freshness',
    question: 'What is the shelf life and how should seeds be stored?',
    answer:
      'Whole raw seeds (pumpkin, sunflower, unhulled sesame) stay fresh for 12 months when stored in a cool, dry, dark pantry in their airtight barrier pouches. Because cold-milled flax meal contains fragile polyunsaturated omega-3 fatty acids, it has a 9-month sealed shelf life. Once opened, we strongly recommend storing cold-milled flax in the refrigerator and consuming it within 60–90 days for peak freshness.',
  },
  {
    category: 'Allergen Advisory',
    question: 'What allergens are handled in your facility?',
    answer:
      'All Seedly products are cleaned and packed in a Lahore facility that also handles edible seeds (sesame, sunflower, pumpkin, flax), mustard, and tree nuts (almonds, walnuts). In addition, individuals with known sensitivities to the Asteraceae / Daisy plant family (e.g. ragweed, chrysanthemums) should exercise caution with chamomile infusions.',
  },
  {
    category: 'Shipping & Delivery',
    question: 'How fast is nationwide courier delivery across Pakistan?',
    answer:
      'All orders are dispatched daily from our central Lahore hub via TCS and Leopards Courier. Expected transit windows are: Lahore (1–2 business days); rest of Punjab and Islamabad/Rawalpindi (2–3 business days); Sindh (including Karachi), Khyber Pakhtunkhwa, and Balochistan (3–4 business days); Gilgit-Baltistan and Azad Jammu & Kashmir (4–6 business days).',
  },
  {
    category: 'Shipping & Delivery',
    question: 'How does Free Delivery work?',
    answer:
      `We offer FREE nationwide courier delivery on all orders of Rs. ${siteConfig.shipping.freeThreshold.toLocaleString()} or more across Pakistan. For orders below Rs. ${siteConfig.shipping.freeThreshold.toLocaleString()}, a flat standard shipping fee of Rs. ${siteConfig.shipping.standardFee} applies nationwide.`,
  },
  {
    category: 'Payments & Verification',
    question: 'What payment methods do you accept?',
    answer:
      'We accept Cash on Delivery (COD) across Pakistan, allowing you to pay the courier rider in cash upon parcel arrival. We also accept digital wallet payments via JazzCash and Easypaisa, as well as direct online bank transfer (IBFT). Note that direct digital payments are verified manually by our accounts team against your transaction ID or screenshot prior to dispatch.',
  },
  {
    category: 'Quality & Returns',
    question: 'What does your 7-Day Guarantee cover?',
    answer:
      `Under our 7-Day Quality & Freshness Guarantee, if any item arrives damaged, crushed, unsealed, incorrect, or with a verified quality or freshness concern (such as unexpected staleness or rancidity), we will dispatch a free replacement immediately at our expense or issue a full refund to your original payment method. Reach out via WhatsApp at ${siteConfig.contact.phone} within 7 days of delivery.`,
  },
];

export default function FaqPage() {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-20 space-y-12">
        {/* Header */}
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500">
            Answers &amp; Guidance
          </span>
          <h1 className="font-heading font-medium text-3xl sm:text-5xl text-stone-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            Clear facts on our smallholder sourcing, cold-milling standards, brewing parameters, and nationwide courier delivery.
          </p>
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
        <section aria-labelledby="cta-heading" className="rounded-3xl border border-stone-200 bg-[#F5F5F4] p-8 sm:p-10 text-center space-y-4">
          <h2 id="cta-heading" className="font-heading font-medium text-xl sm:text-2xl text-stone-900">
            Still have a question?
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            Our Lahore pantry team is available Monday to Saturday (9am–7pm PKT) to guide you on seed routines, batch origin, or courier tracking.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={siteConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-stone-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-xs"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp ({siteConfig.contact.phone})</span>
            </a>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-full bg-white border border-stone-200 text-stone-900 text-xs sm:text-sm font-semibold hover:bg-stone-50 transition-all shadow-xs flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Contact &amp; Care Team</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
