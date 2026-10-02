'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../lib/store/cart';
import { formatPKR } from '../../lib/utils';
import { CartItem } from '../../lib/types';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Loader2,
  MessageCircle,
} from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    subtotalMinor,
    freeShippingThreshold,
    isLoaded,
  } = useCart();

  const [recentlyRemoved, setRecentlyRemoved] = useState<CartItem | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(isCartOpen);
  const closeTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  // Sync open state with rendering
  useEffect(() => {
    if (isCartOpen) {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setIsClosing(false);
      setShouldRender(true);
    } else if (shouldRender && !isClosing) {
      setShouldRender(false);
    }
  }, [isCartOpen, shouldRender, isClosing]);

  const handleClose = React.useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimeout.current = setTimeout(() => {
      setIsCartOpen(false);
      setShouldRender(false);
      setIsClosing(false);
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus({ preventScroll: true });
      }
    }, 240);
  }, [isClosing, setIsCartOpen]);

  const handleImmediateClose = React.useCallback(() => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setIsCartOpen(false);
    setShouldRender(false);
    setIsClosing(false);
  }, [setIsCartOpen]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!shouldRender) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, [shouldRender, handleClose]);

  if (!shouldRender) return null;

  const freeShippingDelta = Math.max(0, freeShippingThreshold - subtotalMinor);
  const freeShippingPercent = Math.min(100, Math.round((subtotalMinor / freeShippingThreshold) * 100));

  const handleRemoveItem = (item: CartItem) => {
    setRecentlyRemoved(item);
    removeItem(item.id);
  };

  const handleUndoRemove = () => {
    if (recentlyRemoved) {
      addItem(recentlyRemoved, { openDrawer: false });
      setRecentlyRemoved(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Basket"
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity ${
          isClosing ? 'motion-backdrop-exit' : 'motion-backdrop'
        }`}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div
          className={`w-screen max-w-md bg-white border-l border-gray-200/90 shadow-2xl flex flex-col ${
            isClosing ? 'motion-drawer-exit' : 'motion-drawer'
          }`}
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-neutral-800">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="font-heading font-medium text-base sm:text-lg text-neutral-900 tracking-tight">
                Your Basket
              </h2>
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-700">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              ref={closeBtnRef}
              onClick={handleClose}
              className="h-8 w-8 rounded-full border border-gray-200 hover:bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
              aria-label="Close basket"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Clean Free Shipping Progress Meter */}
          <div className={`px-5 sm:px-6 py-3 border-b transition-colors duration-200 ${
            freeShippingDelta === 0
              ? 'bg-emerald-50/70 border-emerald-100'
              : 'bg-[#FBFBFA] border-gray-100'
          }`}>
            {freeShippingDelta === 0 ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Free nationwide delivery unlocked!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-neutral-700">
                  <span className="flex items-center gap-1.5 font-normal">
                    <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Add <strong className="font-semibold text-neutral-900">{formatPKR(freeShippingDelta)}</strong> for Free Delivery</span>
                  </span>
                  <span className="font-semibold text-neutral-900">{freeShippingPercent}%</span>
                </div>
                <div className="w-full bg-stone-200/70 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-neutral-900 h-full rounded-full transition-all duration-300"
                    style={{ width: `${freeShippingPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Undo Removal Banner */}
          {recentlyRemoved && (
            <div className="mx-5 sm:mx-6 mt-3 p-3 rounded-xl border border-gray-200 bg-[#FBFBFA] flex items-center justify-between text-xs shadow-xs animate-fadeIn">
              <span className="text-neutral-700 truncate max-w-[200px] font-normal">
                Removed <strong className="font-medium text-neutral-900">{recentlyRemoved.name}</strong>
              </span>
              <button
                type="button"
                onClick={handleUndoRemove}
                className="px-2.5 py-1 text-[11px] font-semibold text-neutral-900 bg-white border border-gray-200 hover:bg-neutral-100 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Undo</span>
              </button>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-3">
            {!isLoaded ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-800 mb-2" />
                <p className="text-xs text-stone-500 font-medium">Syncing live catalog prices...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-neutral-700 mb-4">
                  <ShoppingBag className="w-6 h-6 stroke-[1.75]" />
                </div>
                <h3 className="font-heading font-medium text-lg text-neutral-900 mb-1">
                  Your basket is empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mb-6 font-normal leading-relaxed">
                  Explore raw pantry seeds, whole botanical teas, or curated monthly seed routine kits.
                </p>
                <Link
                  href="/shop"
                  onClick={handleClose}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 hover:bg-black text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const itemHref = item.product_type === 'kit'
                  ? `/kits/${item.slug}`
                  : `/${item.product_type === 'tea' ? 'teas' : 'seeds'}/${item.slug}`;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-gray-200/90 bg-white p-3.5 shadow-xs flex gap-3.5 items-center hover:border-neutral-300 transition-colors"
                  >
                    <Link
                      href={itemHref}
                      onClick={handleClose}
                      className="w-16 h-16 relative rounded-xl border border-gray-100 overflow-hidden bg-[#FBFBFA] shrink-0 hover:opacity-85 transition-opacity"
                    >
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={itemHref}
                        onClick={handleClose}
                        className="hover:text-stone-600 transition-colors block"
                      >
                        <h4 className="font-heading font-medium text-xs sm:text-sm text-neutral-900 line-clamp-1 leading-snug">
                          {item.name}
                        </h4>
                      </Link>

                      <p className="text-[11px] text-stone-500 font-normal mt-0.5">
                        {item.variant_label || (item.product_type === 'kit' ? 'Curated Kit' : '250g Pouch')}
                      </p>

                      <div className="flex items-center justify-between mt-2.5">
                        <p className="font-semibold text-xs sm:text-sm text-neutral-900 tabular-nums">
                          {formatPKR(item.price_minor)}
                        </p>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center rounded-full border border-gray-200 bg-[#FBFBFA] p-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-6 w-6 rounded-full flex items-center justify-center text-neutral-700 hover:bg-white hover:text-black transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3 stroke-[2]" />
                            </button>
                            <span className="w-6 text-center text-xs font-semibold text-neutral-900">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-6 w-6 rounded-full flex items-center justify-center text-neutral-700 hover:bg-white hover:text-black transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3 stroke-[2]" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item)}
                            className="h-7 w-7 rounded-full flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer / Checkout */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 p-5 sm:p-6 bg-white space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Estimated Subtotal</span>
                <span className="font-heading font-semibold text-lg sm:text-xl text-neutral-900 tabular-nums">
                  {formatPKR(subtotalMinor)}
                </span>
              </div>

              <div className="rounded-xl border border-gray-100 bg-[#FBFBFA] px-3.5 py-2 text-xs text-stone-600 flex items-center justify-between font-normal">
                <span>Nationwide Shipping:</span>
                <span className="font-semibold text-neutral-900">
                  {freeShippingDelta === 0 ? 'FREE' : 'Rs. 200 (Flat COD)'}
                </span>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={handleImmediateClose}
                  className="w-full py-3.5 rounded-full bg-neutral-900 hover:bg-black text-white font-medium uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/923719055758?text=${encodeURIComponent(
                    `Hi Seedly, I'd like to place an order for ${items.length} item(s) totalling ${formatPKR(subtotalMinor)}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-full border border-gray-200 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Order via WhatsApp Helpline</span>
                </a>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <Link
                    href="/cart"
                    onClick={handleImmediateClose}
                    className="font-medium text-neutral-700 hover:text-black underline underline-offset-4 text-[11px]"
                  >
                    View Full Cart Page
                  </Link>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="font-medium text-stone-500 hover:text-neutral-900 text-[11px] cursor-pointer"
                  >
                    Keep Browsing
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
