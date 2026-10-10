'use client';
import Link from 'next/link';
import { SeedlyLogo } from '@/components/ui/SeedlyLogo';
import { useSiteContent } from './SiteContentProvider';
import type { SiteContent } from '@/lib/cms/storefront-types';
import { useCart } from '@/lib/store/cart';
import { formatPKR } from '@/lib/utils';
export function Footer(_props: { hideTrustStrip?: boolean } = {}) {
 const {config,footer,features,brand,delivery}=useSiteContent<SiteContent>('site');
 const {settings}=useCart();
 return <footer className="bg-cream border-t border-border-gray pt-12 pb-24 lg:pb-8"><div className="store-container">
 <div className="grid sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr] gap-8 lg:gap-12 pb-10">
 <div><SeedlyLogo brandName={config.name} logoUrl={brand.logoUrl} logoAlt={brand.logoAlt} size="lg"/><p className="text-sm leading-relaxed text-muted-gray mt-4 max-w-xs">{footer.intro}</p><Link href="/about" className="inline-block text-sm underline mt-4">{footer.storyLabel}</Link></div>
 {footer.groups.map(group=><nav key={group.title} aria-label={group.title+' footer links'}><h2 className="font-semibold text-base mb-3">{group.title}</h2><ul>{group.links.filter(link=>features.routine||link.href!=='/find-your-seed').map(link=><li key={link.href}><Link href={link.href} className="inline-block py-2 text-sm text-muted-gray hover:text-seedly-dark">{link.label}</Link></li>)}</ul></nav>)}
 <div><h2 className="font-semibold mb-4">{footer.helpTitle}</h2>{features.whatsapp&&config.contact.whatsappUrl&&<a className="button-secondary" href={config.contact.whatsappUrl} target="_blank" rel="noopener noreferrer">{footer.whatsappLabel}</a>}<p className="text-sm text-muted-gray mt-3">{config.contact.hours}</p>{settings&&<p className="text-sm text-muted-gray mt-4">{delivery.template.replace('{fee}',formatPKR(settings.delivery_fee_minor)).replace('{threshold}',formatPKR(settings.free_delivery_threshold_minor))}</p>}<p className="text-sm mt-3"><Link href="/product-disclaimer" className="underline">{footer.guidanceLabel}</Link></p></div>
 </div>
 <p className="text-sm leading-relaxed text-muted-gray border-y border-border-gray py-5">{footer.foodNotice} {config.disclaimer.facility}</p>
 <div className="flex flex-wrap justify-between items-center gap-4 pt-6 text-sm text-muted-gray"><span>? {new Date().getFullYear()} {config.name}, {footer.copyrightLocation}</span><div className="flex gap-5"><Link href="/privacy">{footer.privacyLabel}</Link><Link href="/terms">{footer.termsLabel}</Link>{config.social.instagram&&<a href={config.social.instagram} target="_blank" rel="noopener noreferrer">{footer.instagramLabel}</a>}</div></div>
 </div></footer>;
}
export default Footer;
