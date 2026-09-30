'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Kit } from '../../lib/types';
import { formatPKR } from '../../lib/utils';
import { useCart } from '../../lib/store/cart';
import { useWishlist } from '../../lib/store/wishlist';
import { Heart, Plus, Star, Bell, Loader2 } from 'lucide-react';
import { NotifyMeModal } from './NotifyMeModal';
import { Reveal } from '../ui/Reveal';

interface ProductCardProps {
  product: Product | (Kit & { product_type?: 'kit' });
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [btnState, setBtnState] = React.useState<'idle' | 'pending' | 'added'>('idle');
  const [isNotifyModalOpen, setIsNotifyModalOpen] = React.useState(false);
  const addedTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (addedTimeout.current) clearTimeout(addedTimeout.current);
  }, []);

  const isKit = product.product_type === 'kit' || 'items' in product;
  const seedProduct = !isKit ? (product as Product) : null;
  const activeVariants = seedProduct?.variants?.filter((variant) => variant.status === 'ACTIVE') || [];
  const defaultVariant = activeVariants.find((variant) => variant.weight_grams === seedProduct?.weight_grams)
    || activeVariants[0]
    || null;

  const displayPriceMinor = defaultVariant?.price_minor ?? product.price_minor;
  const displayComparePriceMinor = defaultVariant?.compare_price_minor ?? product.compare_price_minor;
  const weightGrams = defaultVariant?.weight_grams ?? seedProduct?.weight_grams;
  const displayWeight = defaultVariant?.option_value || (weightGrams ? `${weightGrams}g` : '');
  const packageLabel = isKit ? (product as Kit).package_size : displayWeight;
  const stock = isKit ? (product as Kit).computed_stock ?? 0 : defaultVariant?.inventory_quantity ?? 0;
  const inStock = stock > 0;
  const isLowStock = inStock && stock <= 5;
  const href = isKit ? `/kits/${product.slug}` : `/${product.product_type === 'tea' ? 'teas' : 'seeds'}/${product.slug}`;
  const wishlisted = isInWishlist(product.id);
  const hasReviews = (product.review_count ?? 0) > 0 && typeof product.rating === 'number';

  const handleAddToCart = () => {
    if (!inStock) {
      setIsNotifyModalOpen(true);
      return;
    }
    if (btnState !== 'idle') return;

    setBtnState('pending');
    setTimeout(() => {
      addItem({
        id: `${product.id}-${defaultVariant?.id || (isKit ? 'kit' : 'default')}`,
        product_id: product.id,
        kit_id: isKit ? product.id : undefined,
        variant_id: defaultVariant?.id,
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
    }, 150);
  };

  return (
    <Reveal as="article" stagger className="group card-active-press relative flex h-full flex-col">
      <div className="relative">
        <Link href={href} className="card-image-wrap relative block aspect-square overflow-hidden rounded-sm bg-cream">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        </Link>

        {(!inStock || isLowStock) && (
          <span className="pointer-events-none absolute left-2 top-2 bg-white px-2.5 py-1.5 text-xs font-medium text-charcoal sm:left-3 sm:top-3">
            {!inStock ? 'Sold out' : `${stock} left`}
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={`${wishlisted ? 'Remove' : 'Save'} ${product.name} ${wishlisted ? 'from' : 'to'} wishlist`}
          aria-pressed={wishlisted}
          className="motion-icon absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-charcoal transition-colors hover:bg-white hover:text-seedly-dark sm:right-3 sm:top-3"
        >
          <Heart key={String(wishlisted)} aria-hidden="true" className={`${wishlisted ? 'motion-pop' : ''} h-[18px] w-[18px] ${wishlisted ? 'fill-seedly-dark text-seedly-dark' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <Link href={href} className="transition-colors hover:text-seedly-dark">
          <h3 className="min-h-[2.75rem] font-serif text-base font-semibold leading-snug text-charcoal line-clamp-2 sm:text-xl">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-gray line-clamp-2">
          {product.short_description}
        </p>

        {hasReviews && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-gray" aria-label={`${product.rating} out of 5 from ${product.review_count} reviews`}>
            <Star aria-hidden="true" className="h-3.5 w-3.5 fill-seedly-dark text-seedly-dark" />
            <span className="font-medium text-charcoal">{product.rating?.toFixed(1)}</span>
            <span>({product.review_count})</span>
          </div>
        )}

        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-base font-semibold tabular-nums text-charcoal sm:text-lg">
              {formatPKR(displayPriceMinor)}
            </span>
            {displayComparePriceMinor != null && displayComparePriceMinor > displayPriceMinor && (
              <span className="text-sm text-muted-gray line-through">
                {formatPKR(displayComparePriceMinor)}
              </span>
            )}
          </div>
          <p className="mt-1 min-h-5 text-xs leading-5 text-muted-gray sm:text-sm">{packageLabel}</p>

          {inStock ? (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={btnState === 'pending'}
              aria-busy={btnState === 'pending'}
              className={`motion-button mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border px-3 py-2.5 text-sm font-medium transition-[background-color,border-color,color,transform] duration-150 motion-safe:active:scale-[0.98] ${
                btnState === 'added'
                  ? 'border-seedly-dark bg-seedly-dark text-white'
                  : 'border-seedly-dark/25 text-seedly-dark hover:border-seedly-dark hover:bg-seedly-dark hover:text-white'
              }`}
              aria-label={`Add ${product.name}${packageLabel ? `, ${packageLabel}` : ''} to basket`}
            >
              {btnState === 'pending' ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : btnState === 'added' ? (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" className="motion-draw-check" />
                </svg>
              ) : (
                <Plus aria-hidden="true" className="h-4 w-4" />
              )}
              <span aria-live="polite">
                {btnState === 'pending' ? 'Adding...' : btnState === 'added' ? 'Added' : 'Add to basket'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsNotifyModalOpen(true)}
              className="motion-button mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border border-border-gray px-3 py-2.5 text-sm font-medium text-charcoal transition-colors hover:border-charcoal hover:bg-cream"
              aria-label={`Notify me when ${product.name} is available`}
            >
              <Bell aria-hidden="true" className="h-4 w-4" />
              <span>Notify me</span>
            </button>
          )}
        </div>
      </div>

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
