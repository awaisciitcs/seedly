'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Kit } from '../../lib/types';
import { formatPKR } from '../../lib/utils';
import { useCart } from '../../lib/store/cart';
import { useWishlist } from '../../lib/store/wishlist';
import { Heart, Plus, Eye, Bell, Check, Loader2 } from 'lucide-react';
import { NotifyMeModal } from './NotifyMeModal';
import { QuickViewModal } from './QuickViewModal';
import { Reveal } from '../ui/Reveal';

interface ProductCardProps {
  product: Product | (Kit & { product_type?: 'kit' });
}

export function ProductCard({ product }: ProductCardProps) {
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
  const defaultVariant = activeVariants.find((v) => v.weight_grams === seedProduct?.weight_grams)
    || activeVariants[0]
    || null;

  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);

  useEffect(() => {
    setSelectedVariant(defaultVariant);
  }, [product.id, defaultVariant?.id]);

  const activeVariant = selectedVariant || defaultVariant;
  const displayPriceMinor = activeVariant?.price_minor ?? product.price_minor;
  const displayComparePriceMinor = activeVariant?.compare_price_minor ?? product.compare_price_minor;
  const weightGrams = activeVariant?.weight_grams ?? seedProduct?.weight_grams;
  const displayWeight = activeVariant?.option_value || (weightGrams ? `${weightGrams}g` : '');
  const packageLabel = isKit ? (product as Kit).package_size : displayWeight;
  const stock = isKit ? (product as Kit).computed_stock ?? 0 : activeVariant?.inventory_quantity ?? 0;
  const inStock = stock > 0;
  const isLowStock = inStock && stock <= 5;
  const href = isKit ? `/kits/${product.slug}` : `/${isTea ? 'teas' : 'seeds'}/${product.slug}`;
  const wishlisted = isInWishlist(product.id);

  // Category Header Color Mapping strictly aligned with Canva
  const headerBgColor = isKit
    ? 'bg-kit-coral'
    : isTea
    ? 'bg-tea-butter'
    : 'bg-seed-lime';

  const categoryLabel = isKit
    ? 'Routine Kit'
    : isTea
    ? 'Mountain Tea'
    : 'Raw Seed';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) {
      setIsNotifyModalOpen(true);
      return;
    }
    if (btnState !== 'idle') return;

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

  return (
    <Reveal as="article" stagger className="group relative flex h-full flex-col">
      <div className="card-brutal-interactive flex flex-col h-full bg-white">
        
        {/* Category-Colored Header Banner */}
        <div className={`relative px-4 py-3 border-b-2 border-ink flex items-center justify-between gap-2 ${headerBgColor}`}>
          <span className="rounded-full border-2 border-ink bg-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink shadow-brutal-sm">
            {categoryLabel}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Quick View Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsQuickViewOpen(true);
              }}
              title="Quick view"
              className="btn-brutal h-8 w-8 bg-white text-ink hover:bg-seed-lime shadow-brutal-sm"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="sr-only">Quick view {product.name}</span>
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product.id);
              }}
              title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="btn-brutal h-8 w-8 bg-white text-ink hover:bg-seed-lime shadow-brutal-sm"
            >
              <Heart
                className={`h-3.5 w-3.5 ${wishlisted ? 'fill-kit-coral text-kit-coral' : ''}`}
              />
              <span className="sr-only">Save {product.name} to wishlist</span>
            </button>
          </div>
        </div>

        {/* Product Image Stage */}
        <Link href={href} className="relative block aspect-square overflow-hidden bg-paper/60 p-4 border-b-2 border-ink group-hover:bg-paper transition-colors">
          <div className="relative w-full h-full">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Stock Badges */}
          {(!inStock || isLowStock) && (
            <span className="absolute bottom-3 left-3 rounded-full border-2 border-ink bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink shadow-brutal-sm">
              {!inStock ? 'Sold Out' : `${stock} Left in Pantry`}
            </span>
          )}
        </Link>

        {/* Card Body */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <Link href={href} className="transition-colors hover:text-seed-lime">
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-ink leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 text-xs text-muted-gray leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {product.short_description || product.description}
          </p>

          <div className="mt-auto pt-3">
            {/* Interactive Pack Size / Gram Selector if product has multiple variants */}
            {activeVariants.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                {activeVariants.map((v) => {
                  const isSelected = activeVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedVariant(v);
                      }}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-2 border-ink bg-seed-lime text-ink shadow-brutal-sm'
                          : 'border border-ink/40 bg-white text-ink/75 hover:border-ink hover:bg-paper'
                      }`}
                      aria-pressed={isSelected}
                    >
                      {v.option_value || `${v.weight_grams}g`}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Price & Pack Size */}
            <div className="flex items-baseline justify-between gap-2 mb-3">
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-base sm:text-lg text-ink tabular-nums">
                  {formatPKR(displayPriceMinor)}
                </span>
                {displayComparePriceMinor != null && displayComparePriceMinor > displayPriceMinor && (
                  <span className="text-xs text-muted-gray line-through tabular-nums">
                    {formatPKR(displayComparePriceMinor)}
                  </span>
                )}
              </div>

              {packageLabel && (
                <span className="rounded-full border border-ink/40 bg-paper px-2.5 py-0.5 text-[10px] font-bold text-ink">
                  {packageLabel}
                </span>
              )}
            </div>

            {/* CTA Button */}
            {inStock ? (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={btnState === 'pending'}
                className="btn-brutal w-full py-2.5 bg-seed-lime text-ink text-xs uppercase tracking-wider shadow-brutal-sm hover:bg-seed-lime/80"
              >
                {btnState === 'pending' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : btnState === 'added' ? (
                  <span className="inline-flex items-center gap-1.5 font-extrabold">
                    <Check className="h-4 w-4" /> Added
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-extrabold">
                    <Plus className="h-4 w-4" /> Add to Basket
                  </span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsNotifyModalOpen(true);
                }}
                className="btn-brutal w-full py-2.5 bg-white text-ink text-xs uppercase tracking-wider shadow-brutal-sm hover:bg-paper"
              >
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Bell className="h-3.5 w-3.5" /> Notify Me
                </span>
              </button>
            )}
          </div>
        </div>
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
    </Reveal>
  );
}

export default ProductCard;
