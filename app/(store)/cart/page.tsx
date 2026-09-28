'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../../lib/store/cart';
import { formatPKR } from '../../../lib/utils';
import { CartItem } from '../../../lib/types';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
  Banknote,
  Loader2,
} from 'lucide-react';

export default function CartPage() {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    subtotalMinor,
    freeShippingThreshold,
    isLoaded,
  } = useCart();

  const [recentlyRemoved, setRecentlyRemoved] = useState<CartItem | null>(null);

  const isFreeShipping = subtotalMinor >= freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : 20000;
  const totalMinor = subtotalMinor + shippingFee;

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Your Wellness Basket
          </h1>
          <p className="text-sm text-muted-gray mt-1">
            Review your chosen heirloom seeds, cycle kits, and loose-leaf herbal teas.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-seedly-dark hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {recentlyRemoved && (
        <div className="mb-6 p-4 bg-cream rounded-2xl border border-border-gray flex items-center justify-between text-xs shadow-subtle animate-fadeIn">
          <span className="text-charcoal">
            Removed <strong>{recentlyRemoved.name}</strong> from your basket.
          </span>
          <button
            type="button"
            onClick={handleUndoRemove}
            className="text-seedly-dark font-bold hover:underline flex items-center gap-1.5 ml-4"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo Removal</span>
          </button>
        </div>
      )}

      {!isLoaded ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-border-gray shadow-card max-w-2xl mx-auto flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-seedly-primary mb-3" />
          <p className="text-sm text-muted-gray">Loading your wellness basket...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-border-gray shadow-card max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center text-muted-gray mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-seedly-primary stroke-1" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">Your basket is currently empty</h2>
          <p className="text-sm text-muted-gray mt-2 max-w-sm mx-auto">
            Discover our cold-milled seeds, whole flower chamomile, and 28-day cycle ritual kits.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/shop"
              className="px-6 py-3 bg-seedly-dark text-white rounded-full text-xs font-semibold hover:bg-seedly-forest transition-colors shadow-subtle"
            >
              Shop All Products
            </Link>
            <Link
              href="/find-your-seed"
              className="px-6 py-3 bg-seedly-light text-seedly-dark rounded-full text-xs font-semibold hover:bg-seedly-primary/20 transition-colors"
            >
              Take the Wellness Quiz
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Items Table */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card divide-y divide-border-gray/60">
            {items.map((item) => {
              const itemHref = item.product_type === 'kit'
                ? `/kits/${item.slug}`
                : `/${item.product_type === 'tea' ? 'teas' : 'seeds'}/${item.slug}`;

              return (
                <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <Link
                    href={itemHref}
                    className="w-20 h-20 relative rounded-2xl overflow-hidden bg-cream shrink-0 border border-border-gray hover:opacity-85 transition-opacity"
                  >
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={itemHref} className="hover:text-seedly-dark transition-colors">
                      <h3 className="font-serif font-bold text-base text-charcoal hover:underline">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-gray mt-0.5">
                      {item.variant_label || (item.product_type === 'kit' ? 'Curated Box Set' : '250g Pouch')}
                    </p>
                    <p className="text-sm font-semibold text-seedly-dark mt-1">
                      {formatPKR(item.price_minor)}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="flex items-center border border-border-gray rounded-xl bg-white px-2 py-1 shadow-subtle">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-muted-gray hover:text-charcoal"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-semibold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-muted-gray hover:text-charcoal"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-serif font-bold text-base text-charcoal min-w-[80px] text-right">
                      {formatPKR(item.price_minor * item.quantity)}
                    </span>

                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="p-2 text-muted-gray hover:text-rose-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-4 flex justify-between items-center text-xs">
              <Link
                href="/shop"
                className="text-seedly-dark font-semibold hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Add more items</span>
              </Link>
              <span className="text-muted-gray">
                Rs. 200 flat nationwide delivery, FREE on orders of Rs. 2,500 or more
              </span>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-6">
            <h2 className="font-serif text-xl font-bold text-charcoal">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-muted-gray">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal">{formatPKR(subtotalMinor)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-gray">
                <span>Nationwide Delivery</span>
                <span className="font-semibold text-charcoal">
                  {isFreeShipping ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatPKR(shippingFee)
                  )}
                </span>
              </div>

              {!isFreeShipping && (
                <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed">
                  Add <strong>{formatPKR(freeShippingThreshold - subtotalMinor)}</strong> more to qualify for Free Delivery across Pakistan!
                </p>
              )}

              <div className="border-t border-border-gray pt-4 flex items-center justify-between">
                <span className="font-serif font-bold text-lg text-charcoal">Estimated Total</span>
                <span className="font-serif font-bold text-2xl text-seedly-dark">
                  {formatPKR(totalMinor)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 bg-seedly-dark hover:bg-seedly-forest text-white rounded-full font-medium text-sm transition-all shadow-card flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="pt-2 border-t border-border-gray/60 space-y-2.5 text-xs text-muted-gray">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-seedly-primary shrink-0" />
                <span>Fast dispatch in 2–4 business days via TCS / Leopards</span>
              </div>
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-seedly-primary shrink-0" />
                <span>Cash on Delivery (COD) &amp; Digital Wallets accepted</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-seedly-primary shrink-0" />
                <span>256-bit SSL Encrypted Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
