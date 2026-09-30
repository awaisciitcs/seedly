'use client';

import { ArrowRight, Check, Heart, Minus, Plus, ShoppingBag } from 'lucide-react';

interface PurchaseActionsProps {
  quantity: number;
  maxQuantity: number;
  added: boolean;
  wishlisted: boolean;
  onQuantityChange: (quantity: number) => void;
  onAdd: () => void;
  onBuy: () => void;
  onWishlist: () => void;
}

export function PurchaseActions({ quantity, maxQuantity, added, wishlisted, onQuantityChange, onAdd, onBuy, onWishlist }: PurchaseActionsProps) {
  return (
    <div className="space-y-3 pt-4">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <div className="col-span-2 flex h-14 w-fit items-center rounded-full border border-border-gray bg-white px-1.5 sm:col-span-1" role="group" aria-label="Quantity">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="motion-icon flex h-11 w-11 items-center justify-center rounded-full text-seedly-dark transition-colors hover:bg-seedly-light disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="w-8 text-center text-sm font-medium tabular-nums" aria-live="polite" aria-atomic="true"><span key={quantity} className="motion-count inline-block">{quantity}</span></span>
          <button
            type="button"
            onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
            disabled={quantity >= maxQuantity}
            className="motion-icon flex h-11 w-11 items-center justify-center rounded-full text-seedly-dark transition-colors hover:bg-seedly-light disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="motion-button order-3 col-span-3 flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-seedly-dark px-5 py-3 text-sm font-medium text-white shadow-[0_4px_12px_rgba(31,56,43,0.1)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-seedly-forest hover:shadow-[0_6px_18px_rgba(31,56,43,0.16)] motion-safe:active:scale-[0.98] sm:order-none sm:col-span-1"
        >
          {added ? <Check className="motion-pop h-[18px] w-[18px]" aria-hidden="true" /> : <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />}
          <span aria-live="polite">{added ? 'Added' : 'Add to basket'}</span>
        </button>

        <button
          type="button"
          onClick={onWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={wishlisted}
          className={`motion-button order-2 flex h-14 w-14 items-center justify-center rounded-full border transition-[background-color,border-color,transform] duration-200 motion-safe:active:scale-95 sm:order-none ${wishlisted ? 'border-seedly-primary bg-seedly-light text-seedly-dark' : 'border-border-gray bg-white text-seedly-dark hover:border-seedly-primary hover:bg-seedly-light/50'}`}
        >
          <Heart key={String(wishlisted)} className={`${wishlisted ? 'motion-pop' : ''} h-5 w-5 ${wishlisted ? 'fill-seedly-dark' : ''}`} aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={onBuy}
        className="motion-button group flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-seedly-dark/30 bg-transparent px-6 py-3 text-sm font-medium text-seedly-dark transition-[background-color,border-color,transform] duration-200 hover:border-seedly-dark hover:bg-seedly-light/50 motion-safe:active:scale-[0.99]"
      >
        Buy now <ArrowRight className="h-4 w-4 transition-transform duration-200 motion-safe:group-hover:translate-x-1" aria-hidden="true" />
      </button>
    </div>
  );
}
