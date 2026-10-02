'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Kit } from '../../lib/types';
import { formatPrice, toSentenceCase } from '../../lib/utils';
import { useCart } from '../../lib/store/cart';
import { useWishlist } from '../../lib/store/wishlist';
import { Heart, Check, Loader2 } from 'lucide-react';
import { NotifyMeModal } from './NotifyMeModal';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product | (Kit & { product_type?: 'kit' });
  buttonVariant?: 'primary' | 'secondary';
}

export function ProductCard({ product, buttonVariant = 'primary' }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [btnState, setBtnState] = useState<'idle' | 'pending' | 'added'>('idle');
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const addedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (addedTimeout.current) clearTimeout(addedTimeout.current);
  }, []);

  const isKit = product.product_type === 'kit' || 'items' in product;
  const isTea = !isKit && (product as Product).product_type === 'tea';
  const seedProduct = !isKit ? (product as Product) : null;
  const activeVariants = seedProduct?.variants?.filter((v) => v.status === 'ACTIVE') || [];
  const defaultVariant =
    activeVariants.find((v) => v.weight_grams === seedProduct?.weight_grams) ||
    activeVariants[0] ||
    null;

  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);

  useEffect(() => {
    setSelectedVariant(defaultVariant);
  }, [product.id, defaultVariant?.id]);

  const activeVariant = selectedVariant || defaultVariant;
  const displayPriceMinor = activeVariant?.price_minor ?? product.price_minor;
  const weightGrams = activeVariant?.weight_grams ?? seedProduct?.weight_grams;
  const displayWeight = activeVariant?.option_value || (weightGrams ? `${weightGrams}g` : '');
  const packageLabel = isKit ? (product as Kit).package_size : displayWeight;
  const stock = isKit
    ? (product as Kit).computed_stock ?? 0
    : activeVariant?.inventory_quantity ?? 0;
  const inStock = stock > 0;
  const href = isKit ? `/kits/${product.slug}` : `/${isTea ? 'teas' : 'seeds'}/${product.slug}`;
  const wishlisted = isInWishlist(product.id);

  // Optional cycle phase ('follicular' | 'luteal' | null)
  const phase = (product as Product).phase || (
    product.slug === 'pumpkin-seeds' || product.slug === 'flax-seeds' || product.slug === 'golden-flaxseed'
      ? 'follicular'
      : product.slug === 'sunflower-seeds' || product.slug === 'sesame-seeds' || product.slug === 'white-sesame'
      ? 'luteal'
      : null
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) {
      setIsNotifyModalOpen(true);
      return;
    }
    if (btnState !== 'idle') return;

    setBtnState('pending');
    addItem({
      id: `${product.id}-${activeVariant?.id || (isKit ? 'kit' : 'default')}`,
      product_id: product.id,
      kit_id: isKit ? product.id : undefined,
      variant_id: activeVariant?.id,
      name: product.name,
      slug: product.slug,
      variant_label: packageLabel,
      price_minor: displayPriceMinor,
      image_url: product.image_url,
      quantity: 1,
      product_type: isKit ? 'kit' : (product as Product).product_type,
      max_quantity: stock,
    });

    setBtnState('added');
    if (addedTimeout.current) clearTimeout(addedTimeout.current);
    addedTimeout.current = setTimeout(() => setBtnState('idle'), 1500);
  };

  const displayName = toSentenceCase(product.name);
  const displaySize = packageLabel || (weightGrams ? `${weightGrams}g` : '250g');
  const priceFormatted = formatPrice(displayPriceMinor);

  return (
    <article className="group relative flex flex-col bg-white">
      {/* Image tile: relative aspect-square rounded-xl overflow-hidden bg-stone-100 */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80">
        <Link href={href} className="block relative w-full h-full">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Optional phase chip top-start (Follicular / Luteal) */}
        {phase && (
          <span className="absolute top-2.5 start-2.5 z-10 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-medium text-neutral-800 shadow-xs capitalize">
            {phase}
          </span>
        )}

        {/* Wishlist heart top-end */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2.5 end-2.5 z-10 h-8 w-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-neutral-700 hover:text-black hover:bg-white transition-all shadow-xs cursor-pointer"
        >
          <Heart
            className={`h-4 w-4 ${wishlisted ? 'fill-neutral-900 text-neutral-900' : ''}`}
          />
          <span className="sr-only">Wishlist</span>
        </button>

        {/* Out of stock badge if unavailable */}
        {!inStock && (
          <span className="absolute bottom-2.5 start-2.5 rounded-full bg-neutral-900/90 backdrop-blur-xs px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
            Sold out
          </span>
        )}
      </div>

      {/* Below the tile: name (sentence case, text-[15px] font-medium), size (text-sm text-stone-600), price (font-semibold), full-width Add button */}
      <div className="pt-3 pb-2 flex flex-col text-start">
        <Link href={href} className="hover:underline underline-offset-2">
          <h3 className="font-heading font-medium text-[15px] text-neutral-900 leading-snug line-clamp-1">
            {displayName}
          </h3>
        </Link>

        <p className="mt-0.5 text-sm text-stone-600 font-normal">
          {displaySize}
        </p>

        <p className="mt-1 font-semibold text-neutral-900 tabular-nums">
          {priceFormatted}
        </p>

        {/* Full-width Add to cart button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={btnState === 'pending' || !inStock}
          className={`mt-3 w-full h-11 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            buttonVariant === 'secondary'
              ? 'border border-black bg-transparent text-black hover:bg-black hover:text-white'
              : 'bg-black text-white hover:bg-neutral-800'
          }`}
        >
          {btnState === 'pending' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : btnState === 'added' ? (
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" /> Added to cart
            </span>
          ) : !inStock ? (
            'Sold out'
          ) : (
            'Add to cart'
          )}
        </button>
      </div>

      {/* Modals */}
      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={product}
      />

      <NotifyMeModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        itemTitle={product.name}
        productId={isKit ? undefined : product.id}
        variantId={isKit ? undefined : defaultVariant?.id}
        kitId={isKit ? product.id : undefined}
      />
    </article>
  );
}

export default ProductCard;
