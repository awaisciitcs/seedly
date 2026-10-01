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
    <div className="space-y-3 pt-4">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        {/* Stepper */}
        <div
          className="col-span-2 sm:col-span-1 flex h-14 w-fit items-center rounded-full border-2 border-ink bg-white px-2 shadow-brutal-sm"
          role="group"
          aria-label="Quantity"
        >
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-paper transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
          </button>
          <span className="w-8 text-center text-sm font-black tabular-nums text-ink" aria-live="polite" aria-atomic="true">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
            disabled={quantity >= maxQuantity}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-paper transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
          </button>
        </div>

        {/* Primary Add to Basket Button */}
        <button
          type="button"
          onClick={handleAddClick}
          disabled={btnState === 'pending'}
          aria-busy={btnState === 'pending'}
          className="btn-brutal order-3 sm:order-none col-span-3 sm:col-span-1 flex min-h-14 items-center justify-center gap-2.5 bg-seed-lime text-ink px-6 text-xs sm:text-sm font-black uppercase tracking-wider shadow-brutal hover:bg-seed-lime/80"
        >
          {btnState === 'pending' ? (
            <Loader2 className="h-4 w-4 animate-spin text-ink" aria-hidden="true" />
          ) : btnState === 'added' ? (
            <Check className="h-4 w-4 text-ink stroke-[3]" />
          ) : (
            <ShoppingBag className="h-4 w-4 text-ink" aria-hidden="true" />
          )}
          <span aria-live="polite">
            {btnState === 'pending' ? 'Adding...' : btnState === 'added' ? 'Added to Basket' : 'Add to Basket'}
          </span>
        </button>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={onWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={wishlisted}
          className={`btn-brutal order-2 sm:order-none flex h-14 w-14 items-center justify-center shadow-brutal-sm transition-colors ${
            wishlisted ? 'bg-paper' : 'bg-white hover:bg-seed-lime'
          }`}
        >
          <Heart
            className={`h-5 w-5 ${wishlisted ? 'fill-kit-coral text-kit-coral stroke-[2]' : 'text-ink'}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Buy Now Button */}
      <button
        type="button"
        onClick={onBuy}
        className="btn-brutal group flex min-h-14 w-full items-center justify-center gap-3 bg-white text-ink px-6 text-xs sm:text-sm font-black uppercase tracking-wider shadow-brutal hover:bg-paper"
      >
        <span>Direct Checkout</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </button>
    </div>
  );
}

export default PurchaseActions;
