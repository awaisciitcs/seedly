'use client';
import { Check, LoaderCircle } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
export type OrderProcessingStage = 'prices' | 'receipt' | 'order' | 'complete';
const messages: Record<OrderProcessingStage, string> = {
  prices: 'Checking your total and availability',
  receipt: 'Uploading your payment receipt',
  order: 'Confirming your order details',
  complete: 'Opening your order confirmation',
};
export function OrderProcessingOverlay({ open, stage }: { open: boolean; stage: OrderProcessingStage }) {
  const complete = stage === 'complete';
  return <Dialog open={open} onClose={() => {}} title={complete ? 'Order received' : 'Confirming your order'} className="order-processing-dialog">
    <div data-autofocus tabIndex={-1} role="status" aria-live="polite" aria-atomic="true" className="px-7 py-10 text-center outline-none sm:px-10 sm:py-12">
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-seedly-light text-seedly-dark">{complete ? <Check size={34} strokeWidth={1.6} aria-hidden="true" /> : <LoaderCircle size={34} strokeWidth={1.6} className="order-spinner" aria-hidden="true" />}</span>
      <p className="eyebrow mt-6">Seedly checkout</p>
      <h2 className="mt-3 text-3xl">{complete ? 'Order received' : 'One moment, please.'}</h2>
      <p className="mt-4 text-base font-medium">{messages[stage]}</p>
      <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-gray">Please keep this page open. Your confirmation will appear as soon as it is ready.</p>
    </div>
  </Dialog>;
}
