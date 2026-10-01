import Link from 'next/link';
import { SeedlyLogo } from '../ui/SeedlyLogo';
import { siteConfig } from '../../lib/config';
import { MessageCircle, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

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
    <footer className="border-t-2 border-ink bg-paper pt-14 pb-24 lg:pb-12 text-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12 border-b-2 border-ink/10">
          <div className="rounded-[20px] border-2 border-ink bg-white p-4 shadow-brutal-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-ink bg-seed-lime flex items-center justify-center shrink-0">
              <Truck className="h-5 w-5 text-ink" />
            </div>
            <div>
              <p className="font-heading font-extrabold text-xs uppercase tracking-wider text-ink">Dispatched in 24h</p>
              <p className="text-[11px] text-muted-gray">Freshly packed in Lahore</p>
            </div>
          </div>

          <div className="rounded-[20px] border-2 border-ink bg-white p-4 shadow-brutal-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-ink bg-tea-butter flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-ink" />
            </div>
            <div>
              <p className="font-heading font-extrabold text-xs uppercase tracking-wider text-ink">100% Pure & Raw</p>
              <p className="text-[11px] text-muted-gray">No additives or fillers</p>
            </div>
          </div>

          <div className="rounded-[20px] border-2 border-ink bg-white p-4 shadow-brutal-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-ink bg-pistachio-sage flex items-center justify-center shrink-0">
              <RefreshCw className="h-5 w-5 text-ink" />
            </div>
            <div>
              <p className="font-heading font-extrabold text-xs uppercase tracking-wider text-ink">Free Delivery 2,500+</p>
              <p className="text-[11px] text-muted-gray">Nationwide COD across Pakistan</p>
            </div>
          </div>

          <div className="rounded-[20px] border-2 border-ink bg-white p-4 shadow-brutal-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-ink bg-kit-coral flex items-center justify-center shrink-0">
              <MessageCircle className="h-5 w-5 text-ink" />
            </div>
            <div>
              <p className="font-heading font-extrabold text-xs uppercase tracking-wider text-ink">Helpline WhatsApp</p>
              <p className="text-[11px] text-muted-gray">0371 9055758</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b-2 border-ink/10">
          <div className="col-span-2 md:col-span-1">
            <SeedlyLogo size="lg" />
            <p className="mt-4 max-w-xs text-xs sm:text-sm leading-relaxed text-muted-gray">
              Clean raw pantry seeds and high-altitude whole blossom teas, packed fresh in Lahore and dispatched nationwide across Pakistan.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-seed-lime px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-brutal-sm">
              <span>✦ Lahore, Pakistan</span>
            </div>
          </div>

          <nav aria-label="Shop footer links">
            <h3 className="mb-4 font-heading font-extrabold text-xs uppercase tracking-wider text-ink">
              The Pantry
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ink/80 transition-colors hover:text-ink hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help footer links">
            <h3 className="mb-4 font-heading font-extrabold text-xs uppercase tracking-wider text-ink">
              Good To Know
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ink/80 transition-colors hover:text-ink hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-4 font-heading font-extrabold text-xs uppercase tracking-wider text-ink">
              Direct Contact
            </h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <a
                href={siteConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brutal w-full justify-center gap-2 bg-seed-lime py-2 text-xs font-bold text-ink"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp 0371 9055758</span>
              </a>
              <p className="text-[11px] text-muted-gray pt-1">{siteConfig.contact.hours}</p>
            </div>
          </div>
        </div>

        {/* Mandatory Dietary & Allergen Warning (Verbatim) */}
        <div className="my-8 rounded-[20px] border-2 border-ink bg-white p-4 text-[11px] text-muted-gray leading-relaxed">
          <p className="font-bold text-ink mb-1">Dietary Food Notice & Allergen Advisory:</p>
          <p>
            All products sold by Seedly are raw agricultural food staples and mountain botanicals for dietary consumption and culinary brewing only. They are not intended to diagnose, treat, cure, or prevent any medical condition. Packed in a facility that also handles tree nuts, sesame seeds, and cereal grains. If you have severe seed or nut allergies or are pregnant, consult your physician before dietary changes.
          </p>
        </div>

        {/* Bottom Legal & Payment Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs text-muted-gray">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-ink">Accepted Payments:</span>
            <span className="rounded-full border border-ink/40 bg-white px-2.5 py-0.5 text-[10px] font-bold text-ink">Cash on Delivery</span>
            <span className="rounded-full border border-ink/40 bg-white px-2.5 py-0.5 text-[10px] font-bold text-ink">JazzCash</span>
            <span className="rounded-full border border-ink/40 bg-white px-2.5 py-0.5 text-[10px] font-bold text-ink">EasyPaisa</span>
            <span className="rounded-full border border-ink/40 bg-white px-2.5 py-0.5 text-[10px] font-bold text-ink">Bank Transfer</span>
          </div>
          <p className="text-[11px]">
            &copy; {new Date().getFullYear()} Seedly Naturals Pakistan. Dispatched from Lahore.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
