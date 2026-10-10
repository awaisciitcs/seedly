import Link from 'next/link';
import type { Metadata } from 'next';
import { MessageCircle, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../../../lib/config';

export const metadata: Metadata = {
  title: 'Contact Seedly | Customer Care & Support',
  description:
    'Connect directly with our Lahore care team via WhatsApp, phone, or email for order assistance, product guidance, and delivery support.',
  openGraph: {
    title: 'Contact Seedly | Customer Care & Support',
    description:
      'WhatsApp, phone, and email support for all catalog questions, nationwide orders, and routine guidance.',
    url: `${siteConfig.url}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div className="bg-white text-stone-900">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 md:py-20">
        <header className="max-w-2xl space-y-3">
          <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500">
            Customer Care
          </span>
          <h1 className="font-heading font-medium text-3xl sm:text-5xl lg:text-6xl text-stone-900 tracking-tight leading-tight">
            Contact Seedly
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            A question about your order, choosing seeds, or brewing your mountain tea? Get in touch with our Lahore team directly.
          </p>
        </header>

        <div className="mt-12 grid gap-12 border-t border-stone-200 pt-8 lg:mt-16 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          {/* Main Ways to Get in Touch */}
          <section aria-labelledby="contact-options-heading" className="divide-y divide-stone-200">
            <h2 id="contact-options-heading" className="sr-only">
              Ways to get in touch
            </h2>

            {/* WhatsApp */}
            <div className="py-7 sm:flex sm:items-start sm:justify-between sm:gap-8 first:pt-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-heading font-medium text-xl text-stone-900">WhatsApp</h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm">
                  Instant order assistance, address confirmations, and personalized product questions.
                </p>
              </div>
              <a
                href={siteConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-900 hover:text-stone-600 underline underline-offset-4 sm:mt-1 shrink-0"
              >
                <span>Message on WhatsApp</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Phone */}
            <div className="py-7 sm:flex sm:items-start sm:justify-between sm:gap-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-stone-800" />
                  <h3 className="font-heading font-medium text-xl text-stone-900">Phone</h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm">
                  Speak directly with our care desk during customer service hours.
                </p>
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
                  <h3 className="font-heading font-medium text-xl text-stone-900">Email</h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm">
                  Write to us with parcel photographs, feedback, or wholesale inquiries.
                </p>
              </div>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="mt-4 inline-block text-xs sm:text-sm font-semibold text-stone-900 hover:text-stone-600 underline underline-offset-4 sm:mt-1 shrink-0"
              >
                {siteConfig.contact.email}
              </a>
            </div>
          </section>

          {/* Details Sidebar */}
          <aside className="space-y-8 lg:pt-2">
            <div className="space-y-2">
              <h2 className="font-heading font-medium text-xl text-stone-900">
                Inquiring about an existing order?
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Please include your order number (e.g. SED-XXXXXX) and your delivery phone number so we can look up your dispatch status immediately. If reporting damaged goods, please attach photos or an unboxing video.
              </p>
            </div>

            <div className="space-y-1.5 pt-4 border-t border-stone-200">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">Customer care hours</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{siteConfig.contact.hours}</p>
            </div>

            <div className="space-y-1.5 pt-4 border-t border-stone-200">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">{siteConfig.contact.dispatchHub}</h3>
              <address className="text-xs sm:text-sm not-italic text-stone-600 leading-relaxed">{siteConfig.contact.address}</address>
            </div>
          </aside>
        </div>

        {/* Helpful Links Grid */}
        <nav aria-label="Customer help" className="mt-14 grid gap-6 border-t border-stone-200 pt-8 sm:grid-cols-3 lg:mt-20">
          <div className="space-y-1">
            <Link
              href="/shipping"
              className="text-sm font-semibold text-stone-900 hover:text-stone-600 underline underline-offset-4"
            >
              Shipping &amp; delivery
            </Link>
            <p className="text-xs text-stone-500">Delivery areas, flat charges, and estimated timings.</p>
          </div>
          <div className="space-y-1">
            <Link
              href="/returns"
              className="text-sm font-semibold text-stone-900 hover:text-stone-600 underline underline-offset-4"
            >
              Returns &amp; replacements
            </Link>
            <p className="text-xs text-stone-500">7-day guarantee details and how to initiate a claim.</p>
          </div>
          <div className="space-y-1">
            <Link
              href="/faq"
              className="text-sm font-semibold text-stone-900 hover:text-stone-600 underline underline-offset-4"
            >
              Frequently asked questions
            </Link>
            <p className="text-xs text-stone-500">Answers about cold-milled seeds, brewing, and storage.</p>
          </div>
        </nav>
      </div>
    </div>
  );
}
