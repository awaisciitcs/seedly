'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Check, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../lib/store/cart';

export function CartToast() {
  const { toastItem, dismissToast, setIsCartOpen } = useCart();

  useEffect(() => {
    if (!toastItem) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toastItem, dismissToast]);

  if (!toastItem) return null;

  return (
    <aside
      aria-label="Basket update notification"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-3 text-white shadow-2xl transition-all animate-slideUp md:hidden"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-800 border border-neutral-700">
          {toastItem.image_url ? (
            <Image
              src={toastItem.image_url}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white">
              <Check className="h-5 w-5 text-emerald-400 motion-draw-check" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <Check className="h-3.5 w-3.5 motion-draw-check stroke-[2.5]" />
            <span>Added to basket</span>
          </p>
          <p className="truncate text-xs font-medium text-neutral-200">{toastItem.name}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            dismissToast();
            setIsCartOpen(true);
          }}
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 active:scale-95 cursor-pointer shadow-xs"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>View</span>
        </button>

        <button
          type="button"
          onClick={dismissToast}
          aria-label="Dismiss notification"
          className="ml-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}

export default CartToast;
