'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { isKit, getDefaultVariant, toCartItem, type CatalogItem } from '@/lib/catalog';
import { useCart } from '@/lib/store/cart';
import { formatPKR } from '@/lib/utils';
export function QuickViewModal({ isOpen,onClose,product }: { isOpen:boolean;onClose:()=>void;product:CatalogItem }) {
  const kit = isKit(product); const variants = kit ? [] : product.variants?.filter(v=>v.status === 'ACTIVE') || [];
  const [selected,setSelected] = useState(kit ? undefined : getDefaultVariant(product)); const [added,setAdded] = useState(false); const { addItem } = useCart();
  useEffect(()=>{setSelected(isKit(product) ? undefined : getDefaultVariant(product));setAdded(false);},[product,isOpen]);
  const stock = kit ? product.computed_stock : selected?.inventory_quantity || 0;
  const price = selected?.price_minor ?? product.price_minor;
  const href = '/' + (kit ? 'kits' : product.product_type === 'tea' ? 'teas' : 'seeds') + '/' + product.slug;
  return <Dialog open={isOpen} onClose={onClose} title={'Quick view: ' + product.name} className="max-w-3xl"><div className="p-6 sm:p-8"><div className="flex justify-end mb-4"><button className="icon-button" type="button" aria-label="Close quick view" onClick={onClose}><X size={20}/></button></div><div className="grid sm:grid-cols-2 gap-6"><div className="relative aspect-square rounded-xl overflow-hidden"><Image src={product.image_url} alt={product.name} fill sizes="(max-width:639px) 85vw, 320px" className="object-cover" /></div><div><h2 className="text-2xl">{product.name}</h2><p className="text-muted-gray text-sm leading-relaxed mt-3">{product.short_description}</p><p className="text-2xl font-semibold mt-5">{formatPKR(price)}</p>{variants.length > 1 && <fieldset className="mt-5"><legend className="field-label">Pack size</legend><div className="flex flex-wrap gap-2">{variants.map(v=><button type="button" key={v.id} aria-pressed={selected?.id === v.id} onClick={()=>{setSelected(v);setAdded(false);}} className={'variant-choice ' + (selected?.id === v.id ? 'selected' : '')}>{v.option_value}</button>)}</div></fieldset>}<button type="button" className="button-primary w-full mt-6" disabled={stock <= 0 || added} onClick={()=>{if(addItem(toCartItem(product,1,selected),{openDrawer:false}))setAdded(true);}}>{stock <= 0 ? 'Selected pack sold out' : added ? 'Added to basket' : 'Add to basket'}</button><Link className="button-secondary w-full mt-3" href={href} onClick={onClose}>View full details</Link></div></div></div></Dialog>;
}
export default QuickViewModal;
