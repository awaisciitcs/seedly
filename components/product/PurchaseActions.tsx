'use client';

import { useState } from 'react';
import { ArrowRight, Heart, Loader2, Minus, Plus, ShoppingBag, Check } from 'lucide-react';

interface PurchaseActionsProps {
  quantity: number;
  maxQuantity: number;
  added?: boolean;
  wishlisted: boolean;
  onQuantityChange: (quantity: number) => void;
  onAdd: () => void;
  onBuy: () => void;
  onWishlist: () => void;
}

export function PurchaseActions({
  quantity,
  maxQuantity,
  wishlisted,
  onQuantityChange,
  onAdd,
  onBuy,
  onWishlist,
}: PurchaseActionsProps) {
  const [btnState, setBtnState] = useState<'idle' | 'pending' | 'added'>('idle');

  const handleAddClick = () => {
    if (btnState !== 'idle') return;
    onAdd();
    setBtnState('added');
    setTimeout(() => {
      setBtnState('idle');
    }, 1500);
  };

  return (
    <div className="space-y-3">
      {/* CTA Row: Stepper, Add to cart (flex-1), Wishlist; all h-12 */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Stepper */}
        <div
          className="flex h-12 w-fit items-center rounded-full border border-stone-200 bg-[#FBFBFA] px-1.5 shadow-xs shrink-0"
          role="group"
          aria-label="Quantity"
        >
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5 stroke-[2]" aria-hidden="true" />
          </button>
          <span className="w-8 text-center text-sm font-semibold tabular-nums text-neutral-900" aria-live="polite" aria-atomic="true">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
            disabled={quantity >= maxQuantity}
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2]" aria-hidden="true" />
          </button>
        </div>

        {/* Primary Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddClick}
          disabled={btnState === 'pending'}
          aria-busy={btnState === 'pending'}
          className="flex-1 flex h-12 items-center justify-center gap-2 rounded-full bg-black hover:bg-neutral-800 text-white px-4 sm:px-6 text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-xs hover:shadow-md transition-all cursor-pointer min-w-0"
        >
          {btnState === 'pending' ? (
            <Loader2 className="h-4 w-4 animate-spin text-white shrink-0" aria-hidden="true" />
          ) : btnState === 'added' ? (
            <Check className="h-4 w-4 text-emerald-400 stroke-[2.5] shrink-0" />
          ) : (
            <ShoppingBag className="h-4 w-4 text-white shrink-0" aria-hidden="true" />
          )}
          <span className="truncate" aria-live="polite">
            {btnState === 'pending' ? 'Adding...' : btnState === 'added' ? 'Added to cart' : 'Add to cart'}
          </span>
        </button>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={onWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={wishlisted}
          className={`flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 transition-colors shadow-xs shrink-0 cursor-pointer ${
            wishlisted ? 'bg-rose-50 border-rose-200' : 'bg-white hover:bg-[#FBFBFA]'
          }`}
        >
          <Heart
            className={`h-4.5 w-4.5 ${wishlisted ? 'fill-rose-500 text-rose-500 stroke-[2]' : 'text-neutral-700'}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Buy Now Button (full width, h-12) */}
      <button
        type="button"
        onClick={onBuy}
        className="group flex h-12 w-full items-center justify-center gap-2 rounded-full border border-black bg-white text-black hover:bg-black hover:text-white px-6 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
      >
        <span>Buy now</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" aria-hidden="true" />
      </button>
    </div>
  );
}

export default PurchaseActions;
