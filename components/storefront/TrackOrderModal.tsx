'use client';
import { useSiteContent } from './SiteContentProvider';
import type { SiteContent } from '@/lib/cms/storefront-types';
import { X } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { TrackingForm } from './TrackingForm';
export function TrackOrderModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
 const {copy,links,images}=useSiteContent<SiteContent>('site');
 return <Dialog open={isOpen} onClose={onClose} title="Track your order" className="max-w-lg"><div className="p-6 sm:p-8"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl">{copy.text_track_your_order}</h2><button className="icon-button" type="button" onClick={onClose} aria-label="Close order tracking"><X size={20} /></button></div><TrackingForm onNavigate={onClose} /></div></Dialog>; }
