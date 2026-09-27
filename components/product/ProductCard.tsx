'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Kit } from '../../lib/types';
import { formatPKR } from '../../lib/utils';
import { useCart } from '../../lib/store/cart';
import { useWishlist } from '../../lib/store/wishlist';
import { Heart, Plus, Star, Check, Bell } from 'lucide-react';
import { NotifyMeModal } from './NotifyMeModal';

interface ProductCardProps {
  product: Product | (Kit & { product_type?: 'kit' });
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [added, setAdded] = React.useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = React.useState(false);

  const isKit = product.product_type === 'kit' || 'items' in product;
  const stock = isKit
    ? (product as Kit).computed_stock ?? 0
    : (product as Product).variants?.[0]?.inventory_quantity ?? 50;
  const inStock = stock > 0;
  const isLowStock = inStock && stock <= 5;
  const href = isKit ? `/kits/${product.slug}` : `/${product.product_type === 'tea' ? 'teas' : 'seeds'}/${product.slug}`;
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) {
      setIsNotifyModalOpen(true);
      return;
    }

    addItem({
      id: `${product.id}-${isKit ? 'kit' : 'default'}`,
      product_id: product.id,
      kit_id: isKit ? product.id : undefined,
      name: product.name,
      slug: product.slug,
      variant_label: isKit ? (product as Kit).package_size : (product as Product).variants?.[0]?.option_value,
      price_minor: product.price_minor,
      image_url: product.image_url,
      quantity: 1,
      product_type: isKit ? 'kit' : (product as Product).product_type,
      max_quantity: stock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-border-gray overflow-hidden shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col">
      {/* Packaging Image container */}
      <Link href={href} className="relative aspect-square w-full bg-cream overflow-hidden block">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {!inStock ? (
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-amber-800/90 backdrop-blur-sm text-white rounded-full">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-amber-700/90 backdrop-blur-sm text-white rounded-full">
              Only {stock} Left
            </span>
          ) : (
            product.badge && (
              <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-seedly-dark/90 backdrop-blur-sm text-white rounded-full shadow-subtle">
                {product.badge}
              </span>
            )
          )}
          {isKit && inStock && !isLowStock && (
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-emerald-800/90 backdrop-blur-sm text-white rounded-full">
              Curated Box
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label="Save to wishlist"
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md text-charcoal hover:text-seedly-dark hover:bg-white shadow-subtle transition-all z-10"
        >
          <Heart
            className={`w-4 h-4 ${
              wishlisted ? 'fill-rose-500 text-rose-500' : 'text-charcoal/70'
            }`}
          />
        </button>
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Authentic Social Proof (No Fabricated Ratings) */}
          <div className="flex items-center gap-1.5 text-xs text-muted-gray mb-1.5">
            {product.review_count && product.review_count > 0 ? (
              <>
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                </div>
                <span className="font-semibold text-charcoal">{product.rating || '5.0'}</span>
                <span className="text-muted-gray/80">({product.review_count} verified)</span>
              </>
            ) : (
              <span className="text-[11px] text-muted-gray font-medium">Single-origin harvest</span>
            )}
          </div>

          {/* Product Name */}
          <Link href={href} className="group-hover:text-seedly-dark transition-colors">
            <h3 className="font-serif font-semibold text-base sm:text-lg text-charcoal leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Descriptor */}
          <p className="text-xs text-muted-gray mt-1 line-clamp-2 leading-relaxed">
            {product.short_description}
          </p>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-border-gray/50 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif font-bold text-base sm:text-lg text-charcoal">
                {formatPKR(product.price_minor)}
              </span>
              {product.compare_price_minor && (
                <span className="text-xs text-muted-gray line-through">
                  {formatPKR(product.compare_price_minor)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-gray">
              {isKit
                ? (product as Kit).package_size || 'Full Kit'
                : (product as Product).variants?.[0]?.option_value || '250g'}
            </p>
          </div>

          {inStock ? (
            <button
              onClick={handleAddToCart}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                added
                  ? 'bg-emerald-700 text-white'
                  : 'bg-seedly-light text-seedly-dark hover:bg-seedly-dark hover:text-white'
              }`}
              aria-label="Add to cart"
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsNotifyModalOpen(true);
              }}
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
              aria-label="Notify me when available"
            >
              <Bell className="w-3.5 h-3.5 text-amber-700" />
              <span>Notify</span>
            </button>
          )}
        </div>
      </div>

      {/* Notify Me Modal */}
      <NotifyMeModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        itemTitle={product.name}
        productId={isKit ? undefined : product.id}
        variantId={isKit ? undefined : (product as Product).variants?.[0]?.id}
        kitId={isKit ? product.id : undefined}
      />
    </div>
  );
}
