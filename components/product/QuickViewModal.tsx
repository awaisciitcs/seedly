'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, Kit } from '../../lib/types';
import { formatPKR } from '../../lib/utils';
import { useCart } from '../../lib/store/cart';
import { X, Check, ShoppingBag, ArrowRight } from 'lucide-react';

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | (Kit & { product_type?: 'kit' });
}

export function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
  const { addItem } = useCart();
  const isKit = product.product_type === 'kit' || 'items' in product;
  const seedProduct = !isKit ? (product as Product) : null;
  const activeVariants = seedProduct?.variants?.filter((v) => v.status === 'ACTIVE') || [];
  
  const [selectedVariant, setSelectedVariant] = useState(
    activeVariants.find((v) => v.weight_grams === seedProduct?.weight_grams) || activeVariants[0] || null
  );
  const [added, setAdded] = useState(false);

  if (!isOpen) return null;

  const priceMinor = selectedVariant?.price_minor ?? product.price_minor;
  const comparePriceMinor = selectedVariant?.compare_price_minor ?? product.compare_price_minor;
  const stock = isKit ? (product as Kit).computed_stock ?? 0 : selectedVariant?.inventory_quantity ?? 0;
  const inStock = stock > 0;
  const packageLabel = isKit ? (product as Kit).package_size : selectedVariant?.option_value || `${selectedVariant?.weight_grams || ''}g`;
  const href = isKit ? `/kits/${product.slug}` : `/${product.product_type === 'tea' ? 'teas' : 'seeds'}/${product.slug}`;

  const handleAdd = () => {
    if (!inStock) return;
    addItem({
      id: `${product.id}-${selectedVariant?.id || (isKit ? 'kit' : 'default')}`,
      product_id: product.id,
      kit_id: isKit ? product.id : undefined,
      variant_id: selectedVariant?.id,
      name: product.name,
      slug: product.slug,
      variant_label: packageLabel,
      price_minor: priceMinor,
      image_url: product.image_url,
      quantity: 1,
      product_type: isKit ? 'kit' : (product as Product).product_type,
      max_quantity: stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-8 animate-fadeIn relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 h-8 w-8 rounded-full border border-gray-200 hover:bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          aria-label="Close quick view"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid sm:grid-cols-2 gap-6 items-start">
          <div className="relative aspect-square rounded-2xl border border-gray-200/80 overflow-hidden bg-[#FBFBFA] shadow-xs">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col">
            <span className="inline-block rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-700 w-fit mb-2">
              {isKit ? 'Seed Routine Kit' : product.product_type === 'tea' ? 'Mountain Tea' : 'Raw Seeds'}
            </span>

            <h2 className="font-heading font-medium text-xl sm:text-2xl text-neutral-900 leading-tight">
              {product.name}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              {product.short_description || product.description}
            </p>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-heading font-semibold text-2xl text-neutral-900 tabular-nums">
                {formatPKR(priceMinor)}
              </span>
              {comparePriceMinor != null && comparePriceMinor > priceMinor && (
                <span className="text-sm text-stone-400 line-through tabular-nums font-normal">
                  {formatPKR(comparePriceMinor)}
                </span>
              )}
            </div>

            {/* Variant selector if multiple */}
            {activeVariants.length > 1 && (
              <div className="mt-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-700 block mb-2">
                  Select Pack Size:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeVariants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                        selectedVariant?.id === v.id
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                          : 'border-gray-200 bg-white text-neutral-800 hover:border-neutral-400'
                      }`}
                    >
                      {v.option_value || `${v.weight_grams}g`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleAdd}
                disabled={!inStock}
                className="w-full py-3 rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-40"
              >
                {added ? (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                    <Check className="h-4 w-4" /> Added to Basket!
                  </span>
                ) : inStock ? (
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <ShoppingBag className="h-4 w-4" /> Add to Basket — {formatPKR(priceMinor)}
                  </span>
                ) : (
                  'Out of Stock'
                )}
              </button>

              <Link
                href={href}
                onClick={onClose}
                className="w-full py-2.5 rounded-full border border-gray-200 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold uppercase tracking-wider text-center transition-colors cursor-pointer"
              >
                <span className="inline-flex items-center gap-1">
                  View Full Product Details <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;
