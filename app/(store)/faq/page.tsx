'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, Phone, ArrowRight } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FaqItem[] = [
  {
    category: 'Seed Cycling & Usage',
    question: 'What is seed cycling and how does it support hormonal balance?',
    answer:
      'Seed cycling is an evidence-backed nutritional practice where you consume specific raw seeds during the two phases of your menstrual cycle. During Phase 1 (Days 1–14, Follicular), Pumpkin and Flax seeds supply zinc and lignans to support healthy estrogen metabolism. During Phase 2 (Days 15–28, Luteal), Sunflower and Sesame seeds provide natural Vitamin E and selenium to nurture progesterone production.',
  },
  {
    category: 'Seed Cycling & Usage',
    question: 'Should I grind flax seeds before eating them?',
    answer:
      'Yes! Flax seeds have a very tough outer husk that the human digestive tract cannot break down whole. For optimal absorption of Omega-3 ALA and lignans, ground flax is ideal. Our golden flax seeds can be ground easily in a small spice grinder or blender, or enjoyed in our pre-portioned kits.',
  },
  {
    category: 'Botanical Teas',
    question: 'Why does Seedly use loose whole chamomile flowers instead of teabags?',
    answer:
      'Commercial tea bags often contain pulverized "tea fannings"—the bitter, dusty leftovers of broken herbs. More importantly, most tea bags contain microplastics or chlorine-bleached paper. Our whole chamomile flowers are intact blossoms harvested in Gilgit valleys, yielding a sweet honey-apple flavor without microplastics.',
  },
  {
    category: 'Botanical Teas',
    question: 'Is your chamomile and spearmint tea caffeine-free?',
    answer:
      'Yes, 100%! Both our Pure Chamomile Flowers and Gilgit Spearmint Leaf teas are naturally caffeine-free herbal tisanes. They can be enjoyed any time of day or evening without disrupting sleep.',
  },
  {
    category: 'Shipping & Delivery',
    question: 'How fast is delivery within Pakistan?',
    answer:
      'All orders are dispatched daily from our Lahore central hub via TCS and Leopards Courier. Packages arrive in 1 to 2 business days within Lahore, and 2 to 4 business days across Islamabad, Karachi, Rawalpindi, Faisalabad, Multan, Peshawar, and all other cities nationwide.',
  },
  {
    category: 'Shipping & Delivery',
    question: 'How does Free Shipping work?',
    answer:
      'We offer FREE courier delivery anywhere in Pakistan on all orders of Rs. 2,500 or above. For orders below Rs. 2,500, a standard delivery fee of Rs. 200 applies.',
  },
  {
    category: 'Payments',
    question: 'What payment methods do you accept?',
    answer:
      'We accept Cash on Delivery (COD) across Pakistan, allowing you to pay the courier in cash when your order arrives. We also accept instant mobile wallet transfers via JazzCash and Easypaisa, as well as direct online bank transfer to our Meezan Bank corporate account.',
  },
];

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
          Answers & Guidance
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-muted-gray">
          Learn more about our heirloom harvesting, brewing instructions, and nationwide delivery.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-border-gray shadow-subtle overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-cream/40 transition-colors"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-seedly-dark bg-seedly-light px-2 py-0.5 rounded-full mb-1.5 inline-block">
                    {item.category}
                  </span>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-charcoal">
                    {item.question}
                  </h3>
                </div>
                <div
                  className={`w-8 h-8 rounded-full border border-border-gray flex items-center justify-center shrink-0 transition-transform ${
                    isOpen ? 'rotate-180 bg-seedly-light text-seedly-dark' : 'text-muted-gray'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-6 sm:px-6 text-sm text-muted-gray leading-relaxed border-t border-border-gray/50 pt-3 animate-fadeIn">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still Have Questions CTA */}
      <div className="bg-cream border border-border-gray rounded-3xl p-6 sm:p-8 text-center space-y-4">
        <h3 className="font-serif text-xl font-bold text-charcoal">Still have a question?</h3>
        <p className="text-xs text-muted-gray max-w-sm mx-auto">
          Our botanical team is always happy to guide you regarding cycle routines or custom requirements.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://wa.me/923041117333"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-semibold flex items-center gap-2"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp (+92 304 1117333)</span>
          </a>
          <Link
            href="/contact"
            className="px-6 py-2.5 bg-white border border-border-gray text-charcoal rounded-full text-xs font-semibold hover:bg-cream"
          >
            Send an Email Inquiry
          </Link>
        </div>
      </div>
    </div>
  );
}
