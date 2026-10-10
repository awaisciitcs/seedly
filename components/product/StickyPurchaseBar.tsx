'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { formatPrice } from '../../lib/utils';
import { Loader2, Plus, Bell, Check } from 'lucide-react';

interface StickyPurchaseBarProps {
  name: string;
  priceMinor: number;
  imageUrl: string;
  variantLabel?: string;
  inStock: boolean;
  targetRef: React.RefObject<HTMLElement | null>;
  onAddToCart: () => void;
  onNotifyMe?: () => void;
}

export function StickyPurchaseBar({
  name,
  priceMinor,
  imageUrl,
  variantLabel,
  inStock,
  targetRef,
  onAddToCart,
  onNotifyMe,
}: StickyPurchaseBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [btnState, setBtnState] = useState<'idle' | 'pending' | 'added'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setIsVisible(true);
          document.body.dataset.stickyBarActive = 'true';
        } else {
          setIsVisible(false);
          delete document.body.dataset.stickyBarActive;
        }
      },
      {
        threshold: 0,
        rootMargin: '0px',
      }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      delete document.body.dataset.stickyBarActive;
    };
  }, [targetRef]);

  const handleAdd = () => {
    if (!inStock) {
      if (onNotifyMe) onNotifyMe();
      return;
    }
    if (btnState !== 'idle') return;

    onAddToCart();
    setBtnState('added');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setBtnState('idle');
    }, 1500);
  };

  return (
    <aside
      aria-label="Quick purchase actions"
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur-md px-5 py-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg transition-transform duration-200 ease-out lg:hidden ${
        isVisible ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2.5 min-w-0 text-start">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-[#FBFBFA]">
            <Image
              src={imageUrl}
              alt=""
              aria-hidden="true"
              fill
              className="object-cover"
              sizes="44px"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-neutral-900">{name}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-semibold text-neutral-900 tabular-nums">{formatPrice(priceMinor)}</span>
              {variantLabel && (
                <span className="text-[11px] text-stone-600 font-normal truncate">&middot; {variantLabel}</span>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          {inStock ? (
            <button
              type="button"
              onClick={handleAdd}
              disabled={btnState === 'pending'}
              aria-busy={btnState === 'pending'}
              className="h-10 px-5 rounded-full text-xs font-semibold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {btnState === 'pending' ? (
                <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
              ) : btnState === 'added' ? (
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400 stroke-[2.5]" /> Added</span>
              ) : (
                <span className="flex items-center gap-1.5"><Plus className="h-3.5 w-3.5 stroke-[2]" /> Add to cart</span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNotifyMe}
              className="h-10 px-4 rounded-full text-xs font-semibold uppercase tracking-wider border border-stone-200 bg-white text-neutral-900 hover:bg-neutral-50 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Bell aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Notify</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export default StickyPurchaseBar;
