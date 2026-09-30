import Link from 'next/link';
import { siteConfig } from '../../../lib/config';

export const metadata = {
  title: 'Contact Seedly | Customer Care',
  description: 'Get in touch with Seedly for product questions, order updates and delivery support by WhatsApp, phone or email.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-20">
      <header className="max-w-2xl">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-seedly-primary">Customer care</p>
        <h1 className="font-serif text-4xl leading-tight text-seedly-dark sm:text-5xl lg:text-6xl">Contact Seedly</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-charcoal/75">
          A question about your order, choosing seeds or brewing your tea? Get in touch with us directly.
        </p>
      </header>

      <div className="mt-12 grid gap-12 border-t border-border-gray pt-2 lg:mt-16 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <section aria-labelledby="contact-options-heading">
          <h2 id="contact-options-heading" className="sr-only">Ways to get in touch</h2>

          <div className="border-b border-border-gray py-7 sm:flex sm:items-start sm:justify-between sm:gap-8">
            <div>
              <h3 className="font-serif text-2xl text-seedly-dark">WhatsApp</h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-charcoal/70">Send a message about your order or share a product question.</p>
            </div>
            <a
              href={siteConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block shrink-0 text-sm font-medium text-seedly-dark underline decoration-seedly-dark/40 underline-offset-4 transition-colors hover:decoration-seedly-dark sm:mt-1"
            >
              Message on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>

          <div className="border-b border-border-gray py-7 sm:flex sm:items-start sm:justify-between sm:gap-8">
            <div>
              <h3 className="font-serif text-2xl text-seedly-dark">Phone</h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-charcoal/70">Call us during our customer care hours.</p>
            </div>
            <a href={`tel:+${siteConfig.contact.phoneRaw}`} className="mt-4 inline-block shrink-0 text-sm font-medium text-seedly-dark underline decoration-seedly-dark/40 underline-offset-4 transition-colors hover:decoration-seedly-dark sm:mt-1">
              {siteConfig.contact.phoneInternational}
            </a>
          </div>

          <div className="border-b border-border-gray py-7 sm:flex sm:items-start sm:justify-between sm:gap-8">
            <div>
              <h3 className="font-serif text-2xl text-seedly-dark">Email</h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-charcoal/70">Write to us with the details of your question.</p>
            </div>
            <a href={`mailto:${siteConfig.contact.email}`} className="mt-4 inline-block shrink-0 text-sm font-medium text-seedly-dark underline decoration-seedly-dark/40 underline-offset-4 transition-colors hover:decoration-seedly-dark sm:mt-1">
              {siteConfig.contact.email}
            </a>
          </div>
        </section>

        <aside className="space-y-8 lg:pt-7">
          <div>
            <h2 className="font-serif text-2xl text-seedly-dark">About an order?</h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-charcoal/75">
              Include your order number and the phone number used at checkout so we can find your order. If something arrived damaged, please send photos of the parcel and the item.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-seedly-dark">Customer care hours</h2>
            <p className="mt-2 text-sm leading-7 text-charcoal/75">{siteConfig.contact.hours}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-seedly-dark">{siteConfig.contact.dispatchHub}</h2>
            <address className="mt-2 max-w-xs text-sm not-italic leading-7 text-charcoal/75">{siteConfig.contact.address}</address>
          </div>
        </aside>
      </div>

      <nav aria-label="Customer help" className="mt-14 grid gap-7 border-t border-border-gray pt-8 sm:grid-cols-3 lg:mt-20 lg:gap-12">
        <div>
          <Link href="/shipping" className="text-base font-medium text-seedly-dark underline decoration-seedly-dark/30 underline-offset-4 hover:decoration-seedly-dark">Shipping & delivery</Link>
          <p className="mt-2 text-sm leading-6 text-charcoal/70">Delivery areas, charges and estimated timings.</p>
        </div>
        <div>
          <Link href="/returns" className="text-base font-medium text-seedly-dark underline decoration-seedly-dark/30 underline-offset-4 hover:decoration-seedly-dark">Returns & replacements</Link>
          <p className="mt-2 text-sm leading-6 text-charcoal/70">What to do if something is wrong with your order.</p>
        </div>
        <div>
          <Link href="/faq" className="text-base font-medium text-seedly-dark underline decoration-seedly-dark/30 underline-offset-4 hover:decoration-seedly-dark">Frequently asked questions</Link>
          <p className="mt-2 text-sm leading-6 text-charcoal/70">Answers about products, storage and ordering.</p>
        </div>
      </nav>
    </div>
  );
}
