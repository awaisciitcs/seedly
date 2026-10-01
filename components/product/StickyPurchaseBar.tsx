'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { formatPKR } from '../../lib/utils';
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
      className={`fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink bg-paper px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-brutal-xl transition-transform duration-200 ease-out lg:hidden ${
        isVisible ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[10px] border-2 border-ink bg-white shadow-brutal-sm">
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
            <p className="truncate text-xs font-black text-ink">{name}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-extrabold text-ink tabular-nums">{formatPKR(priceMinor)}</span>
              {variantLabel && (
                <span className="text-[11px] font-bold text-muted-gray truncate">&middot; {variantLabel}</span>
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
              className="btn-brutal h-10 px-4 text-xs font-black uppercase tracking-wider bg-seed-lime text-ink shadow-brutal-sm hover:bg-seed-lime/80"
            >
              {btnState === 'pending' ? (
                <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
              ) : btnState === 'added' ? (
                <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 stroke-[3]" /> Added</span>
              ) : (
                <span className="flex items-center gap-1"><Plus className="h-3.5 w-3.5 stroke-[2.5]" /> Add</span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNotifyMe}
              className="btn-brutal h-10 px-4 text-xs font-bold uppercase tracking-wider border-2 border-ink bg-white text-ink shadow-brutal-sm hover:bg-paper"
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
