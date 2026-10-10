'use client';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useSiteContent } from './SiteContentProvider';
import type { SiteContent } from '@/lib/cms/storefront-types';
export function FloatingWhatsApp() { const path=usePathname(); const {config:siteConfig,features}=useSiteContent<SiteContent>('site'); if(!features.whatsapp||!siteConfig.contact.whatsappUrl)return null; if(/^\/(checkout|cart|order|admin)(\/|$)/.test(path)||/^\/(seeds|teas|kits)\/.+/.test(path))return null; return <a className="whatsapp-float fixed right-4 lg:right-6 z-30 w-12 h-12 rounded-full bg-seedly-dark text-white shadow-md inline-flex items-center justify-center transition-colors hover:bg-seedly-forest" href={siteConfig.contact.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat with Seedly on WhatsApp"><MessageCircle size={23}/></a>; }
export default FloatingWhatsApp;
