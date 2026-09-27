'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../lib/store/cart';
import { formatPKR } from '../../lib/utils';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, CheckCircle2 } from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    subtotalMinor,
    freeShippingThreshold,
  } = useCart();

  if (!isCartOpen) return null;

  const freeShippingDelta = Math.max(0, freeShippingThreshold - subtotalMinor);
  const freeShippingPercent = Math.min(100, Math.round((subtotalMinor / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-fadeIn">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border-gray flex items-center justify-between bg-cream/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-seedly-dark" />
              <h2 className="text-lg font-serif font-semibold text-charcoal">Your Wellness Basket</h2>
              <span className="text-xs bg-seedly-light text-seedly-dark px-2 py-0.5 rounded-full font-medium">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-muted-gray hover:text-charcoal rounded-full hover:bg-cream"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3 bg-seedly-light/60 border-b border-seedly-primary/20">
            {freeShippingDelta === 0 ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-seedly-forest">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>You unlocked <strong>FREE Nationwide Delivery</strong>!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-charcoal">
                  <span className="flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Add <strong>{formatPKR(freeShippingDelta)}</strong> for Free Delivery
                  </span>
                  <span className="font-semibold text-seedly-dark">{freeShippingPercent}%</span>
                </div>
                <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-seedly-primary/20">
                  <div
                    className="bg-seedly-primary h-full transition-all duration-500 rounded-full"
                    style={{ width: `${freeShippingPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-border-gray/50">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center text-muted-gray mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-1 text-seedly-primary" />
                </div>
                <h3 className="font-serif text-lg font-medium text-charcoal mb-1">Your basket is empty</h3>
                <p className="text-sm text-muted-gray max-w-xs mb-6">
                  Explore our cold-milled seeds, whole flower teas, and hormone-friendly cycle kits.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-seedly-dark text-white rounded-full text-sm font-medium hover:bg-seedly-forest transition-colors shadow-subtle"
                >
                  Explore Catalog
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-center">
                  <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-cream shrink-0 border border-border-gray/70">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-charcoal truncate">{item.name}</h4>
                    {item.variant_label && (
                      <p className="text-xs text-muted-gray">{item.variant_label}</p>
                    )}
                    <p className="text-sm font-semibold text-seedly-dark mt-1">
                      {formatPKR(item.price_minor)}
                    </p>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-border-gray rounded-lg bg-cream/40">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:text-seedly-dark"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:text-seedly-dark"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-gray hover:text-red-500 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Checkout */}
          {items.length > 0 && (
            <div className="border-t border-border-gray p-6 bg-cream/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-gray">Subtotal</span>
                <span className="text-lg font-serif font-bold text-charcoal">{formatPKR(subtotalMinor)}</span>
              </div>
              <p className="text-xs text-muted-gray">
                Taxes included. Delivery calculated at checkout (free over Rs. 2,500).
              </p>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-seedly-dark text-white rounded-xl font-medium hover:bg-seedly-forest transition-colors shadow-card text-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center py-2 text-xs font-medium text-seedly-dark hover:underline"
                >
                  View Full Basket Details
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
