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
  Loader2,
  CheckCircle2,
  MessageCircle,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 bg-white text-neutral-900">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="rounded-full bg-stone-100 text-stone-700 px-3 py-1 text-xs font-semibold uppercase tracking-wider inline-block mb-3">
            ✦ Lahore Pantry Basket
          </div>
          <h1 className="font-heading font-medium text-3xl sm:text-5xl text-neutral-900 tracking-tight">
            Your Basket
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-normal mt-1">
            Review your selected raw pantry seeds, seed routine kits, and mountain teas.
          </p>
        </div>
        <Link
          href="/shop"
          className="rounded-full border border-gray-200 bg-white hover:bg-neutral-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-800 shadow-xs flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {recentlyRemoved && (
        <div className="mb-6 p-4 rounded-2xl border border-gray-200 bg-[#FBFBFA] flex items-center justify-between text-xs shadow-xs animate-fadeIn">
          <span className="text-neutral-700 font-normal">
            Removed <strong className="font-semibold text-neutral-900">{recentlyRemoved.name}</strong> from your basket.
          </span>
          <button
            type="button"
            onClick={handleUndoRemove}
            className="px-3 py-1 bg-white border border-gray-200 hover:bg-neutral-100 text-neutral-900 rounded-full font-semibold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {!isLoaded ? (
        <div className="rounded-3xl border border-gray-200 p-16 text-center max-w-2xl mx-auto flex flex-col items-center justify-center bg-white shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-700 mb-3" />
          <p className="text-xs text-stone-500 font-medium">Syncing live prices with catalog...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 p-12 text-center max-w-2xl mx-auto bg-[#FBFBFA] shadow-xs">
          <div className="w-14 h-14 rounded-full bg-stone-200/80 flex items-center justify-center text-neutral-700 mx-auto mb-4">
            <ShoppingBag className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h2 className="font-heading font-medium text-2xl text-neutral-900">Your basket is currently empty</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-sm mx-auto font-normal leading-relaxed">
            Discover our cold-milled seeds, whole flower chamomile, and 14-day &amp; 28-day routine kits.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-neutral-900 hover:bg-black text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider shadow-xs transition-colors"
            >
              Shop All Products
            </Link>
            <Link
              href="/find-your-seed"
              className="rounded-full border border-gray-200 bg-white hover:bg-neutral-50 text-neutral-800 px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
            >
              Find Your Routine
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Items Table */}
          <div className="lg:col-span-8 rounded-2xl bg-white border border-gray-200/90 p-6 sm:p-8 shadow-xs divide-y divide-gray-100">
            {items.map((item) => {
              const itemHref = item.product_type === 'kit'
                ? `/kits/${item.slug}`
                : `/${item.product_type === 'tea' ? 'teas' : 'seeds'}/${item.slug}`;

              return (
                <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <Link
                    href={itemHref}
                    className="w-20 h-20 relative rounded-xl border border-gray-200/80 overflow-hidden bg-[#FBFBFA] shrink-0 hover:opacity-85 transition-opacity"
                  >
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={itemHref} className="hover:text-stone-600 transition-colors">
                      <h3 className="font-heading font-medium text-base text-neutral-900 line-clamp-1 leading-snug">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-stone-500 font-normal mt-0.5">
                      {item.variant_label || (item.product_type === 'kit' ? 'Curated Routine Box' : '250g Pouch')}
                    </p>
                    <p className="font-semibold text-sm text-neutral-900 mt-1.5 tabular-nums">
                      {formatPKR(item.price_minor)}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="flex items-center rounded-full border border-gray-200 bg-[#FBFBFA] px-1.5 py-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-7 w-7 flex items-center justify-center text-neutral-700 hover:bg-white rounded-full transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[2]" />
                      </button>
                      <span className="w-7 text-center font-semibold text-xs text-neutral-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-7 w-7 flex items-center justify-center text-neutral-700 hover:bg-white rounded-full transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2]" />
                      </button>
                    </div>

                    <span className="font-heading font-semibold text-base text-neutral-900 min-w-[90px] text-right tabular-nums">
                      {formatPKR(item.price_minor * item.quantity)}
                    </span>

                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="h-8 w-8 rounded-full flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
              <Link
                href="/shop"
                className="font-semibold text-neutral-900 hover:underline flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Add more items</span>
              </Link>
              <span className="text-stone-500 font-normal">
                Flat Rs. 200 delivery, FREE on orders of Rs. 2,500+
              </span>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 rounded-2xl bg-[#FBFBFA] border border-gray-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="font-heading font-medium text-xl text-neutral-900">Order Summary</h2>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-stone-600 font-normal">
                <span>Subtotal</span>
                <span className="font-heading font-semibold text-neutral-900 tabular-nums">{formatPKR(subtotalMinor)}</span>
              </div>
              <div className="flex items-center justify-between text-stone-600 font-normal">
                <span>Nationwide Shipping</span>
                <span className="font-heading font-semibold text-neutral-900">
                  {isFreeShipping ? (
                    <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold text-xs">FREE</span>
                  ) : (
                    formatPKR(shippingFee)
                  )}
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border transition-colors duration-200 ${
                isFreeShipping ? 'bg-emerald-50/70 border-emerald-100' : 'bg-white border-gray-200/80'
              }`}>
                {isFreeShipping ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Free Nationwide Delivery Unlocked!</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-neutral-800 font-normal">
                      <span>Add <strong className="font-semibold text-neutral-900">{formatPKR(freeShippingThreshold - subtotalMinor)}</strong> for Free Delivery</span>
                    </div>
                    <div className="w-full bg-stone-200/70 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-neutral-900 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.round((subtotalMinor / freeShippingThreshold) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200/80 pt-3.5 flex items-center justify-between">
                <span className="font-semibold text-sm sm:text-base text-neutral-900 uppercase tracking-wider">Estimated Total</span>
                <span className="font-heading font-semibold text-2xl text-neutral-900 tabular-nums">
                  {formatPKR(totalMinor)}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <Link
                href="/checkout"
                className="w-full py-3.5 rounded-full bg-neutral-900 hover:bg-black text-white font-medium uppercase tracking-wider text-xs sm:text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={`https://wa.me/923719055758?text=${encodeURIComponent(
                  `Hi Seedly, I have a cart with ${items.length} item(s) totalling ${formatPKR(totalMinor)}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-full border border-gray-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4 text-neutral-700" />
                <span>Order via WhatsApp Helpline</span>
              </a>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-200/80 text-[11px] text-stone-500 font-normal">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-neutral-700 shrink-0" />
                <span>Dispatched within 24h from Lahore</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-neutral-700 shrink-0" />
                <span>Cash on Delivery, JazzCash &amp; EasyPaisa accepted</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
