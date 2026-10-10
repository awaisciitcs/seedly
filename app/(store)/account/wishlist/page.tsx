'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '../../../../lib/store/wishlist';
import { useCart } from '../../../../lib/store/cart';
import { formatPKR } from '../../../../lib/utils';
import { Heart, ShoppingBag, ArrowRight, Trash2, Plus, Check } from 'lucide-react';

interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  price_minor: number;
  image_url: string;
  product_type?: 'seed' | 'tea' | 'kit';
  package_size?: string;
  weight_grams?: number;
  variants?: Array<{ id: string; option_value: string; price_minor: number; inventory_quantity: number }>;
}

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const [products, setProducts] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadWishlistItems() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/products?ids=${wishlistIds.join(',')}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error('Failed to load wishlist products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWishlistItems();
  }, [wishlistIds]);

  const handleAddToCart = (item: WishlistItem) => {
    const isKit = !item.product_type || item.product_type === 'kit' || 'package_size' in item;
    const defaultVariant = item.variants?.[0];
    const displayWeight = defaultVariant?.option_value || (isKit ? item.package_size : '250g Pouch');
    const priceMinor = defaultVariant ? defaultVariant.price_minor : item.price_minor;

    addItem({
      id: `${item.id}-${defaultVariant?.id || (isKit ? 'kit' : 'default')}`,
      product_id: item.id,
      kit_id: isKit ? item.id : undefined,
      variant_id: defaultVariant?.id,
      name: item.name,
      slug: item.slug,
      variant_label: displayWeight,
      price_minor: priceMinor,
      image_url: item.image_url,
      quantity: 1,
      product_type: isKit ? 'kit' : (item.product_type as any),
      max_quantity: defaultVariant?.inventory_quantity ?? 50,
    });

    setAddedIds((prev) => [...prev, item.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== item.id));
    }, 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
          Saved Botanical Goods
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-1">
          Your Wishlist ({wishlistIds.length})
        </h1>
        <p className="text-sm text-muted-gray mt-1">
          Save your favourite raw pantry seeds, cycle kits, and loose-leaf teas for future daily rituals.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl p-5 border border-border-gray shadow-subtle animate-pulse space-y-4"
            >
              <div className="aspect-square bg-cream rounded-2xl" />
              <div className="h-4 bg-cream rounded w-3/4" />
              <div className="h-4 bg-cream rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : wishlistIds.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-border-gray shadow-card max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center text-muted-gray mx-auto mb-4">
            <Heart className="w-8 h-8 text-seedly-primary stroke-1" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">Your wishlist is empty</h2>
          <p className="text-sm text-muted-gray mt-2 mb-6">
            Tap the heart icon on any seed, kit, or tea to save it here for later.
          </p>
          <Link
            href="/shop"
            className="px-6 py-3 bg-seedly-dark text-white rounded-full text-xs font-semibold hover:bg-seedly-forest transition-colors shadow-subtle inline-flex items-center gap-2"
          >
            <span>Explore the Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((item) => {
              const isKit = !item.product_type || item.product_type === 'kit' || 'package_size' in item;
              const productHref = isKit
                ? `/kits/${item.slug}`
                : `/${item.product_type === 'tea' ? 'teas' : 'seeds'}/${item.slug}`;
              const isAdded = addedIds.includes(item.id);
              const defaultVariant = item.variants?.[0];
              const displayWeight = defaultVariant?.option_value || (isKit ? item.package_size : '250g Pouch');
              const displayPriceMinor = defaultVariant ? defaultVariant.price_minor : item.price_minor;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-border-gray overflow-hidden shadow-card hover:shadow-hover transition-all flex flex-col justify-between group"
                >
                  <div className="p-5 space-y-4">
                    {/* Image */}
                    <Link
                      href={productHref}
                      className="relative aspect-square w-full rounded-2xl overflow-hidden bg-cream block border border-border-gray/50"
                    >
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(item.id);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-rose-600 hover:bg-rose-50 transition-colors shadow-subtle"
                        title="Remove from wishlist"
                        aria-label={`Remove ${item.name} from wishlist`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Link>

                    {/* Information */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-seedly-primary">
                        {isKit ? 'Curated Routine Box' : item.product_type === 'tea' ? 'Loose Mountain Tea' : 'Raw Pantry Seed'}
                      </span>
                      <Link href={productHref} className="block group-hover:text-seedly-dark transition-colors">
                        <h3 className="font-serif font-bold text-base text-charcoal leading-snug">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-gray">{displayWeight}</p>
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="p-5 pt-0 border-t border-border-gray/60 flex items-center justify-between gap-4 mt-2">
                    <div>
                      <span className="font-serif font-bold text-lg text-charcoal block">
                        {formatPKR(displayPriceMinor)}
                      </span>
                      <span className="text-[10px] text-muted-gray">Standard Size</span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-subtle ${
                        isAdded
                          ? 'bg-emerald-700 text-white'
                          : 'bg-seedly-dark hover:bg-seedly-forest text-white'
                      }`}
                      aria-label={`Add ${item.name} to basket`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Basket</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-border-gray flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/shop"
              className="text-xs font-semibold text-seedly-dark hover:underline flex items-center gap-1"
            >
              <span>← Continue browsing the catalog</span>
            </Link>
            <span className="text-xs text-muted-gray">
              Items saved in your wishlist remain available during your browsing session.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
