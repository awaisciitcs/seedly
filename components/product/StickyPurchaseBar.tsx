'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { formatPKR } from '../../lib/utils';
import { Loader2, Plus, Bell } from 'lucide-react';

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
        // Show only when target button has scrolled above the viewport
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: 0,
        rootMargin: '0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [targetRef]);

  const handleAdd = () => {
    if (!inStock) {
      if (onNotifyMe) onNotifyMe();
      return;
    }
    if (btnState !== 'idle') return;

    setBtnState('pending');
    setTimeout(() => {
      onAddToCart();
      setBtnState('added');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setBtnState('idle');
      }, 1500);
    }, 150);
  };

  return (
    <aside
      aria-label="Quick purchase actions"
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-border-gray bg-cream/95 backdrop-blur-md px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-transform duration-200 ease-out lg:hidden motion-reduce:transition-none ${
        isVisible ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border-gray bg-white">
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
            <p className="truncate text-xs font-semibold text-charcoal">{name}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-bold text-seedly-dark">{formatPKR(priceMinor)}</span>
              {variantLabel && (
                <span className="text-[10px] text-muted-gray truncate">&middot; {variantLabel}</span>
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
              className={`motion-button flex h-11 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-semibold shadow-sm transition-[background-color,border-color,color,transform] duration-150 motion-safe:active:scale-[0.97] ${
                btnState === 'added'
                  ? 'bg-seedly-forest text-white'
                  : 'bg-seedly-dark text-white hover:bg-seedly-forest'
              }`}
            >
              {btnState === 'pending' ? (
                <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
              ) : btnState === 'added' ? (
                <svg
                  className="h-3.5 w-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" className="motion-draw-check" />
                </svg>
              ) : (
                <Plus aria-hidden="true" className="h-3.5 w-3.5" />
              )}
              <span aria-live="polite">
                {btnState === 'pending' ? 'Adding...' : btnState === 'added' ? 'Added' : 'Add to basket'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onNotifyMe}
              className="motion-button flex h-11 items-center justify-center gap-1.5 rounded-full border border-border-gray bg-white px-4 text-xs font-semibold text-charcoal shadow-sm hover:border-charcoal"
            >
              <Bell aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Notify me</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
