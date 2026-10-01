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
        className={`absolute inset-0 bg-ink/50 backdrop-blur-xs transition-opacity ${
          isClosing ? 'motion-backdrop-exit' : 'motion-backdrop'
        }`}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div
          className={`w-screen max-w-md bg-paper border-l-2 border-ink shadow-brutal-xl flex flex-col ${
            isClosing ? 'motion-drawer-exit' : 'motion-drawer'
          }`}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b-2 border-ink flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full border-2 border-ink bg-seed-lime flex items-center justify-center shadow-brutal-sm">
                <ShoppingBag className="w-4 h-4 text-ink" />
              </div>
              <h2 className="font-heading font-black text-lg text-ink">Your Basket</h2>
              <span className="rounded-full border-2 border-ink bg-tea-butter px-2.5 py-0.5 text-[11px] font-black text-ink shadow-brutal-sm">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              ref={closeBtnRef}
              onClick={handleClose}
              className="btn-brutal h-9 w-9 bg-white text-ink hover:bg-seed-lime shadow-brutal-sm"
              aria-label="Close basket"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Neo-Brutalist Free Shipping Progress Meter */}
          <div className={`px-5 py-3.5 border-b-2 border-ink transition-colors duration-300 ${
            freeShippingDelta === 0 ? 'bg-seed-lime/30' : 'bg-white'
          }`}>
            {freeShippingDelta === 0 ? (
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-ink">
                <CheckCircle2 className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
                <span>✦ Free nationwide delivery unlocked!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-ink">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-kit-coral" />
                    <span>Add <strong>{formatPKR(freeShippingDelta)}</strong> for Free Delivery</span>
                  </span>
                  <span className="font-extrabold">{freeShippingPercent}%</span>
                </div>
                <div className="w-full bg-paper h-3.5 rounded-full border-2 border-ink overflow-hidden p-0.5 shadow-brutal-sm">
                  <div
                    className="bg-seed-lime h-full rounded-full transition-all duration-300"
                    style={{ width: `${freeShippingPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Undo Removal Banner */}
          {recentlyRemoved && (
            <div className="mx-5 mt-3 p-3 rounded-[16px] border-2 border-ink bg-white flex items-center justify-between text-xs shadow-brutal-sm animate-fadeIn">
              <span className="text-ink truncate max-w-[200px] font-medium">
                Removed <strong>{recentlyRemoved.name}</strong>
              </span>
              <button
                type="button"
                onClick={handleUndoRemove}
                className="btn-brutal px-2.5 py-1 text-[11px] font-bold bg-seed-lime text-ink flex items-center gap-1 shadow-brutal-sm"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Undo</span>
              </button>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {!isLoaded ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-ink mb-2" />
                <p className="text-xs font-bold text-muted-gray">Syncing live catalog prices...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full border-2 border-ink bg-seed-lime flex items-center justify-center text-ink mb-4 shadow-brutal">
                  <ShoppingBag className="w-8 h-8 stroke-[2]" />
                </div>
                <h3 className="font-heading font-black text-xl text-ink mb-1">Your basket is empty</h3>
                <p className="text-xs text-muted-gray max-w-xs mb-6 font-medium">
                  Add raw seeds, high-altitude herbal teas, or 14-day seed routine kits to get started.
                </p>
                <Link
                  href="/shop"
                  onClick={handleClose}
                  className="btn-brutal bg-seed-lime text-ink px-6 py-3 text-xs uppercase tracking-wider font-extrabold shadow-brutal"
                >
                  Explore Catalog →
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
                    className="card-brutal bg-white p-3.5 shadow-brutal-sm flex gap-3.5 items-center"
                  >
                    <Link
                      href={itemHref}
                      onClick={handleClose}
                      className="w-16 h-16 relative rounded-[14px] border-2 border-ink overflow-hidden bg-paper shrink-0 hover:opacity-85 transition-opacity"
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
                        className="hover:text-seed-lime transition-colors block"
                      >
                        <h4 className="font-heading font-extrabold text-xs sm:text-sm text-ink line-clamp-1 leading-snug">
                          {item.name}
                        </h4>
                      </Link>

                      <p className="text-[11px] text-muted-gray font-medium">
                        {item.variant_label || (item.product_type === 'kit' ? 'Curated Kit' : '250g Pouch')}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <p className="font-heading font-black text-sm text-ink tabular-nums">
                          {formatPKR(item.price_minor)}
                        </p>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center rounded-full border-2 border-ink bg-paper p-0.5 shadow-brutal-sm">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-6 w-6 rounded-full flex items-center justify-center text-ink hover:bg-white transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3 stroke-[2.5]" />
                            </button>
                            <span className="w-6 text-center text-xs font-black text-ink">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-6 w-6 rounded-full flex items-center justify-center text-ink hover:bg-white transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item)}
                            className="btn-brutal h-7 w-7 bg-white text-muted-gray hover:text-kit-coral hover:bg-kit-coral/10 p-0 shadow-brutal-sm"
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
            <div className="border-t-2 border-ink p-5 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-gray">Estimated Subtotal</span>
                <span className="font-heading font-black text-xl text-ink tabular-nums">
                  {formatPKR(subtotalMinor)}
                </span>
              </div>

              <div className="rounded-[14px] border border-ink/30 bg-paper p-2.5 text-[11px] font-medium text-ink flex items-center justify-between">
                <span>Nationwide Shipping:</span>
                <span className="font-bold">
                  {freeShippingDelta === 0 ? 'FREE' : 'Rs. 200 (Flat COD)'}
                </span>
              </div>

              <div className="space-y-2.5">
                <Link
                  href="/checkout"
                  onClick={handleImmediateClose}
                  className="btn-brutal w-full py-3.5 bg-seed-lime text-ink font-black uppercase tracking-wider text-xs sm:text-sm shadow-brutal hover:bg-seed-lime/80 flex items-center justify-center gap-2"
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
                  className="btn-brutal w-full py-2.5 bg-white text-ink text-xs font-bold uppercase tracking-wider hover:bg-paper flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order via WhatsApp Helpline</span>
                </a>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <Link
                    href="/cart"
                    onClick={handleImmediateClose}
                    className="font-bold text-ink hover:underline text-[11px]"
                  >
                    View Full Cart Page
                  </Link>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="font-bold text-muted-gray hover:text-ink text-[11px]"
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
