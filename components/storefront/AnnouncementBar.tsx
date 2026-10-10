'use client';
import Link from 'next/link';
import { Truck } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatPKR } from '@/lib/utils';
import { useSiteContent } from './SiteContentProvider';
import type { SiteContent } from '@/lib/cms/storefront-types';
export function AnnouncementBar(){
 const {settings}=useCart(),{announcement,features}=useSiteContent<SiteContent>('site');
 if(!features.announcements)return null;
 return <aside className="site-announcement"><div className="store-container site-announcement-inner"><Link href="/shipping" className="site-announcement-delivery"><Truck size={14} strokeWidth={1.6} aria-hidden="true"/><span>{settings?announcement.deliveryTemplate.replace('{amount}',formatPKR(settings.free_delivery_threshold_minor)):announcement.deliveryFallback}</span></Link><span className="site-announcement-payment">{announcement.paymentLabel}</span></div></aside>;
}
export default AnnouncementBar;
