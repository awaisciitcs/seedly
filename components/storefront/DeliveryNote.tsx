'use client';
import Link from 'next/link';
import {useCart} from '@/lib/store/cart';
import {formatPKR} from '@/lib/utils';
import {useSiteContent} from './SiteContentProvider';
import type {SiteContent} from '@/lib/cms/storefront-types';
export function DeliveryNote(){
 const {settings}=useCart(),{delivery}=useSiteContent<SiteContent>('site');
 return <p className="text-sm text-muted-gray">{settings?delivery.template.replace('{fee}',formatPKR(settings.delivery_fee_minor)).replace('{threshold}',formatPKR(settings.free_delivery_threshold_minor)):delivery.fallback}{' '}<Link href="/shipping" className="underline underline-offset-4">{delivery.linkLabel}</Link></p>;
}
