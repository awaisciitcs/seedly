'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '../../../../lib/store/wishlist';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="mb-10 text-center sm:text-left">
        <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
          Saved Botanical Goods
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-1">
          Your Wishlist ({wishlistIds.length})
        </h1>
        <p className="text-sm text-muted-gray mt-1">
          Save your favorite heirloom seeds, cycle kits, and loose-leaf teas for future rituals.
        </p>
      </div>

      {wishlistIds.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-border-gray shadow-card max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center text-muted-gray mx-auto mb-4">
            <Heart className="w-8 h-8 text-seedly-primary stroke-1" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">Your wishlist is empty</h2>
          <p className="text-sm text-muted-gray mt-2 mb-6">
            Tap the heart icon on any seed, kit, or tea to save it here.
          </p>
          <Link
            href="/shop"
            className="px-6 py-3 bg-seedly-dark text-white rounded-full text-xs font-semibold hover:bg-seedly-forest transition-colors shadow-subtle"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card">
          <p className="text-sm text-charcoal font-medium mb-6">
            You have {wishlistIds.length} item{wishlistIds.length === 1 ? '' : 's'} saved in your current session.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="px-6 py-3 bg-seedly-dark text-white rounded-full text-xs font-semibold hover:bg-seedly-forest transition-colors inline-flex items-center gap-2"
            >
              <span>Browse & Add More to Basket</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
