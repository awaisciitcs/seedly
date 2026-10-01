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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 bg-paper text-ink">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="rounded-full border-2 border-ink bg-seed-lime px-3 py-1 text-xs font-black uppercase tracking-wider text-ink shadow-brutal-sm inline-block mb-3">
            ✦ Lahore Pantry Basket
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-ink">
            Your Basket
          </h1>
          <p className="text-xs sm:text-sm text-muted-gray font-medium mt-1">
            Review your selected raw pantry seeds, seed routine kits, and mountain teas.
          </p>
        </div>
        <Link
          href="/shop"
          className="btn-brutal bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-ink hover:bg-seed-lime shadow-brutal-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {recentlyRemoved && (
        <div className="mb-6 p-4 rounded-[20px] border-2 border-ink bg-white flex items-center justify-between text-xs shadow-brutal-sm animate-fadeIn">
          <span className="text-ink font-medium">
            Removed <strong>{recentlyRemoved.name}</strong> from your basket.
          </span>
          <button
            type="button"
            onClick={handleUndoRemove}
            className="btn-brutal px-3 py-1 bg-seed-lime text-ink font-black text-xs uppercase tracking-wider shadow-brutal-sm flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {!isLoaded ? (
        <div className="card-brutal p-16 text-center max-w-2xl mx-auto flex flex-col items-center justify-center bg-white shadow-brutal">
          <Loader2 className="w-8 h-8 animate-spin text-ink mb-3" />
          <p className="text-xs font-bold text-muted-gray">Syncing live prices with catalog...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="card-brutal p-12 text-center max-w-2xl mx-auto bg-white shadow-brutal">
          <div className="w-16 h-16 rounded-full border-2 border-ink bg-seed-lime flex items-center justify-center text-ink mx-auto mb-4 shadow-brutal-sm">
            <ShoppingBag className="w-8 h-8 stroke-[2]" />
          </div>
          <h2 className="font-heading font-black text-2xl text-ink">Your basket is currently empty</h2>
          <p className="text-xs sm:text-sm text-muted-gray mt-2 max-w-sm mx-auto font-medium">
            Discover our cold-milled seeds, whole flower chamomile, and 14-day & 28-day routine kits.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/shop"
              className="btn-brutal bg-seed-lime text-ink px-6 py-3 text-xs font-black uppercase tracking-wider shadow-brutal"
            >
              Shop All Products
            </Link>
            <Link
              href="/find-your-seed"
              className="btn-brutal bg-white text-ink px-6 py-3 text-xs font-black uppercase tracking-wider shadow-brutal hover:bg-paper"
            >
              Find Your Routine
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Items Table */}
          <div className="lg:col-span-8 card-brutal bg-white p-6 sm:p-8 shadow-brutal divide-y-2 divide-ink/10">
            {items.map((item) => {
              const itemHref = item.product_type === 'kit'
                ? `/kits/${item.slug}`
                : `/${item.product_type === 'tea' ? 'teas' : 'seeds'}/${item.slug}`;

              return (
                <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <Link
                    href={itemHref}
                    className="w-20 h-20 relative rounded-[16px] border-2 border-ink overflow-hidden bg-paper shrink-0 hover:opacity-85 transition-opacity shadow-brutal-sm"
                  >
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={itemHref} className="hover:text-seed-lime transition-colors">
                      <h3 className="font-heading font-black text-base text-ink line-clamp-1 leading-snug">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-gray font-medium mt-0.5">
                      {item.variant_label || (item.product_type === 'kit' ? 'Curated Routine Box' : '250g Pouch')}
                    </p>
                    <p className="font-heading font-black text-sm text-ink mt-1 tabular-nums">
                      {formatPKR(item.price_minor)}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="flex items-center rounded-full border-2 border-ink bg-paper px-2 py-1 shadow-brutal-sm">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-ink hover:bg-white rounded-full transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <span className="w-8 text-center font-black text-xs text-ink">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-ink hover:bg-white rounded-full transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>

                    <span className="font-heading font-black text-base text-ink min-w-[90px] text-right tabular-nums">
                      {formatPKR(item.price_minor * item.quantity)}
                    </span>

                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="btn-brutal h-8 w-8 bg-white text-muted-gray hover:text-kit-coral hover:bg-kit-coral/10 p-0 shadow-brutal-sm"
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
                className="font-black text-ink hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Add more items</span>
              </Link>
              <span className="text-muted-gray font-medium">
                Flat Rs. 200 delivery, FREE on orders of Rs. 2,500+
              </span>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 card-brutal bg-white p-6 sm:p-8 shadow-brutal space-y-6">
            <h2 className="font-heading font-black text-xl text-ink">Order Summary</h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-muted-gray">
                <span>Subtotal</span>
                <span className="font-heading font-extrabold text-ink tabular-nums">{formatPKR(subtotalMinor)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-gray">
                <span>Nationwide Shipping</span>
                <span className="font-heading font-extrabold text-ink">
                  {isFreeShipping ? (
                    <span className="text-ink bg-seed-lime px-2 py-0.5 rounded-full border border-ink font-black text-xs">FREE</span>
                  ) : (
                    formatPKR(shippingFee)
                  )}
                </span>
              </div>

              <div className={`p-3.5 rounded-[16px] border-2 border-ink transition-colors duration-300 ${
                isFreeShipping ? 'bg-seed-lime/30' : 'bg-paper'
              }`}>
                {isFreeShipping ? (
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-ink">
                    <CheckCircle2 className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
                    <span>Free Nationwide Delivery Unlocked!</span>
                  </div>
                ) : (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-ink font-bold">
                      <span>Add {formatPKR(freeShippingThreshold - subtotalMinor)} for Free Delivery</span>
                    </div>
                    <div className="w-full bg-white h-2.5 rounded-full border border-ink overflow-hidden p-0.5">
                      <div
                        className="bg-seed-lime h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.round((subtotalMinor / freeShippingThreshold) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-ink/10 pt-3 flex items-center justify-between">
                <span className="font-black text-base text-ink uppercase tracking-wider">Estimated Total</span>
                <span className="font-heading font-black text-2xl text-ink tabular-nums">
                  {formatPKR(totalMinor)}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/checkout"
                className="btn-brutal w-full py-4 bg-seed-lime text-ink font-black uppercase tracking-wider text-xs sm:text-sm shadow-brutal hover:bg-seed-lime/80 flex items-center justify-center gap-2"
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
                className="btn-brutal w-full py-2.5 bg-white text-ink text-xs font-black uppercase tracking-wider hover:bg-paper flex items-center justify-center gap-1.5 shadow-brutal-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp Helpline</span>
              </a>
            </div>

            <div className="space-y-2 pt-2 border-t-2 border-ink/10 text-[11px] text-muted-gray font-medium">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-ink shrink-0" />
                <span>Dispatched within 24h from Lahore</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-ink shrink-0" />
                <span>Cash on Delivery, JazzCash & EasyPaisa accepted</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
