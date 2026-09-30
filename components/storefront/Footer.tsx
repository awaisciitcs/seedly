import Link from 'next/link';
import { SeedlyLogo } from '../ui/SeedlyLogo';
import { siteConfig } from '../../lib/config';

const shopLinks = [
  { href: '/shop', label: 'Shop all' },
  { href: '/seeds', label: 'Raw seeds' },
  { href: '/kits', label: 'Seed kits' },
  { href: '/teas', label: 'Mountain teas' },
  { href: '/find-your-seed', label: 'Routine finder' },
];

const helpLinks = [
  { href: '/about', label: 'Our story' },
  { href: '/shipping', label: 'Shipping & delivery' },
  { href: '/returns', label: 'Returns & replacements' },
  { href: '/faq', label: 'Frequently asked questions' },
  { href: '/contact', label: 'Contact us' },
];

export function Footer() {
  return (
    <footer className="border-t border-seedly-forest bg-seedly-dark pb-28 pt-14 text-cream lg:pb-8 lg:pt-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 pb-12 md:grid-cols-4 lg:grid-cols-[1.35fr_0.8fr_1fr_1.2fr] lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <SeedlyLogo size="lg" textColor="text-cream" />
            <p className="mt-5 max-w-xs text-sm leading-7 text-cream/75">
              Raw pantry seeds and whole-flower teas, packed in Lahore for everyday use.
            </p>
            <p className="mt-5 text-xs leading-6 text-cream/60">Lahore, Pakistan<br />Delivering nationwide.</p>
          </div>

          <nav aria-label="Shop footer links">
            <h2 className="mb-5 text-sm font-semibold text-cream">Shop</h2>
            <ul className="space-y-3 text-sm leading-6 text-cream/75">
              {shopLinks.map((link) => <li key={link.href}><Link href={link.href} className="transition-colors hover:text-white">{link.label}</Link></li>)}
            </ul>
          </nav>

          <nav aria-label="Help footer links">
            <h2 className="mb-5 text-sm font-semibold text-cream">Good to know</h2>
            <ul className="space-y-3 text-sm leading-6 text-cream/75">
              {helpLinks.map((link) => <li key={link.href}><Link href={link.href} className="transition-colors hover:text-white">{link.label}</Link></li>)}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-1">
            <h2 className="mb-5 text-sm font-semibold text-cream">Here to help</h2>
            <p className="max-w-xs text-sm leading-6 text-cream/75">Questions about an order or choosing a product? Get in touch.</p>
            <div className="mt-4 space-y-2 text-sm leading-6">
              <a href={`tel:+${siteConfig.contact.phoneRaw}`} className="block w-fit text-cream/85 transition-colors hover:text-white">{siteConfig.contact.phoneInternational}</a>
              <a href={`mailto:${siteConfig.contact.email}`} className="block w-fit text-cream/85 transition-colors hover:text-white">{siteConfig.contact.email}</a>
              <a href={siteConfig.contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block pt-1 text-cream underline decoration-cream/40 underline-offset-4 transition-colors hover:decoration-cream">Chat on WhatsApp<span className="sr-only"> (opens in a new tab)</span></a>
            </div>
            <p className="mt-4 text-xs leading-6 text-cream/60">{siteConfig.contact.hours}</p>
          </div>
        </div>

        <div className="space-y-5 border-t border-cream/15 pt-7 text-xs leading-6 text-cream/60">
          <div className="flex flex-col justify-between gap-4 lg:flex-row">
            <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/privacy" className="transition-colors hover:text-white">Privacy policy</Link>
              <Link href="/terms" className="transition-colors hover:text-white">Terms of service</Link>
              <Link href="/product-disclaimer" className="transition-colors hover:text-white">Product disclaimer</Link>
            </nav>
            <p>JazzCash &nbsp;/&nbsp; Easypaisa &nbsp;/&nbsp; Bank transfer &nbsp;/&nbsp; Cash on delivery</p>
          </div>
          <p>&copy; {new Date().getFullYear()} Seedly Naturals Pakistan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
