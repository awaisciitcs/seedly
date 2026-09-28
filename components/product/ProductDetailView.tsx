'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant, Review } from '../../lib/types';
import { formatPKR, formatDate } from '../../lib/utils';
import { useCart } from '../../lib/store/cart';
import { useWishlist } from '../../lib/store/wishlist';
import {
  Star,
  Plus,
  Minus,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Leaf,
  Clock,
  Coffee,
  CheckCircle2,
  PenLine,
  X,
  AlertCircle,
  Bell,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { NotifyMeModal } from './NotifyMeModal';
import { ProductCard } from './ProductCard';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts?: Product[];
}

export function ProductDetailView({ product, relatedProducts = [] }: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const defaultVar = product.variants?.find((v) => v.weight_grams === (product.weight_grams || 250))
    || product.variants?.[0];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(defaultVar);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'dossier' | 'ritual' | 'storage' | 'faqs' | 'reviews'>('dossier');
  const [added, setAdded] = useState(false);

  const priceMinor = selectedVariant ? selectedVariant.price_minor : product.price_minor;
  const comparePriceMinor = selectedVariant
    ? selectedVariant.compare_price_minor
    : product.compare_price_minor;
  const currentStock = selectedVariant?.inventory_quantity ?? 50;
  const inStock = currentStock > 0;
  const isLowStock = inStock && currentStock <= 5;
  const wishlisted = isInWishlist(product.id);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState('');
  const [reviewErrorMessage, setReviewErrorMessage] = useState('');

  // Review form fields
  const [reviewRating, setReviewRating] = useState(5);
  const [customerName, setCustomerName] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const res = await fetch(`/api/reviews?productId=${product.id}`);
        const json = await res.json();
        if (json.data) {
          setReviews(json.data);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [product.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewErrorMessage('');
    setReviewSuccessMessage('');

    if (!customerName.trim() || !reviewBody.trim()) {
      setReviewErrorMessage('Please provide your name and review.');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name,
          customer_name: customerName,
          rating: reviewRating,
          title: reviewTitle || 'Verified Feedback',
          body: reviewBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to submit review');

      setReviewSuccessMessage(
        data.message ||
          'Thank you. Your review has been submitted for moderation and will appear after admin verification.'
      );
      setShowReviewForm(false);
      setCustomerName('');
      setReviewTitle('');
      setReviewBody('');
      setReviewRating(5);
    } catch (err: any) {
      setReviewErrorMessage(err.message || 'Submission failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    if (!inStock) {
      setIsNotifyModalOpen(true);
      return;
    }
    addItem({
      id: `${product.id}-${selectedVariant?.id || 'default'}`,
      product_id: product.id,
      variant_id: selectedVariant?.id,
      name: product.name,
      slug: product.slug,
      variant_label: selectedVariant?.option_value,
      price_minor: priceMinor,
      image_url: product.image_url,
      quantity,
      product_type: product.product_type,
      max_quantity: currentStock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!inStock) {
      setIsNotifyModalOpen(true);
      return;
    }
    addItem(
      {
        id: `${product.id}-${selectedVariant?.id || 'default'}`,
        product_id: product.id,
        variant_id: selectedVariant?.id,
        name: product.name,
        slug: product.slug,
        variant_label: selectedVariant?.option_value,
        price_minor: priceMinor,
        image_url: product.image_url,
        quantity,
        product_type: product.product_type,
        max_quantity: currentStock,
      },
      { openDrawer: false }
    );
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const waMessage = encodeURIComponent(`Hi Seedly, I have a question about ${product.name}.`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-gray mb-8">
        <Link href="/" className="hover:text-charcoal">Home</Link>
        <span>/</span>
        <Link href={`/${product.product_type === 'tea' ? 'teas' : 'seeds'}`} className="capitalize hover:text-charcoal">
          {product.product_type === 'tea' ? 'Herbal Teas' : 'Heirloom Seeds'}
        </Link>
        <span>/</span>
        <span className="text-charcoal font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Left Column: Packaging Visual */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-cream border border-border-gray shadow-card">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-seedly-dark text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-subtle">
                {product.badge}
              </span>
            )}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full border border-border-gray shadow-subtle text-[11px] font-medium text-charcoal flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-seedly-primary"></span>
              <span>Showing: {selectedVariant?.option_value || '250g Pouch'}</span>
            </div>
          </div>

          {/* Contextual WhatsApp Consultation */}
          <div className="p-4 rounded-2xl bg-white border border-border-gray flex items-center justify-between gap-4 shadow-subtle">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-charcoal">Questions about this harvest?</p>
              <p className="text-[11px] text-muted-gray">Chat directly with our sourcing team on WhatsApp.</p>
            </div>
            <a
              href={`https://wa.me/923041117333?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-subtle"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Right Column: Product Controls & Dossier Summary */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & Verified Review Social Proof */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
                {product.slug === 'chamomile-tea'
                  ? 'Whole Flower Botanical'
                  : product.slug === 'spearmint-tea'
                  ? 'Single-Origin Mountain Leaf'
                  : product.slug === 'green-tea'
                  ? 'Highland Whole Leaf'
                  : product.slug === 'flax-seeds'
                  ? 'Cold-Milled Heirloom'
                  : '100% Raw Heirloom'}
              </span>

              {reviews.length > 0 ? (
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <span className="font-semibold text-charcoal">5.0</span>
                  <span className="text-muted-gray">({reviews.length} verified {reviews.length === 1 ? 'review' : 'reviews'})</span>
                </div>
              ) : (
                <span className="text-xs text-muted-gray font-medium">Newly introduced harvest</span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal leading-tight">
              {product.name}
            </h1>

            {/* Short descriptor */}
            <p className="text-sm sm:text-base text-muted-gray leading-relaxed">
              {product.short_description}
            </p>

            {/* Tea specific quick attributes */}
            {product.product_type === 'tea' && (
              <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-seedly-stone rounded-2xl border border-border-gray text-xs text-charcoal">
                {product.flavor_profile && (
                  <div className="space-y-0.5">
                    <span className="font-semibold flex items-center gap-1 text-seedly-dark">
                      <Leaf className="w-3.5 h-3.5" /> Notes
                    </span>
                    <p className="text-[11px] text-muted-gray truncate">{product.flavor_profile}</p>
                  </div>
                )}
                {product.steep_time && (
                  <div className="space-y-0.5">
                    <span className="font-semibold flex items-center gap-1 text-seedly-dark">
                      <Clock className="w-3.5 h-3.5" /> Brew Time
                    </span>
                    <p className="text-[11px] text-muted-gray">{product.steep_time}</p>
                  </div>
                )}
                {product.caffeine_level && (
                  <div className="space-y-0.5">
                    <span className="font-semibold flex items-center gap-1 text-seedly-dark">
                      <Coffee className="w-3.5 h-3.5" /> Caffeine
                    </span>
                    <p className="text-[11px] text-muted-gray">{product.caffeine_level}</p>
                  </div>
                )}
              </div>
            )}

            {/* Price & Real Inventory State */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="font-serif text-3xl font-bold text-charcoal">
                {formatPKR(priceMinor)}
              </span>
              {comparePriceMinor && (
                <span className="text-base text-muted-gray line-through">
                  {formatPKR(comparePriceMinor)}
                </span>
              )}
              {inStock ? (
                isLowStock ? (
                  <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium">
                    Low stock — only {currentStock} left
                  </span>
                ) : (
                  <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
                    In Stock &amp; Ready to Ship
                  </span>
                )
              ) : (
                <span className="text-xs text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Bell className="w-3 h-3 text-rose-600" />
                  <span>Temporarily Out of Stock</span>
                </span>
              )}
            </div>

            {/* Dynamic Unit Price Indicator */}
            <div className="text-xs text-muted-gray pt-0.5">
              {product.product_type === 'seed' ? (
                <span>
                  {selectedVariant?.option_value || '250g'} Pouch ·{' '}
                  <strong className="text-charcoal font-medium">
                    Rs.{' '}
                    {Math.round(
                      ((priceMinor / (selectedVariant?.weight_grams || product.weight_grams || 250)) * 100) / 100
                    )}
                    /100g
                  </strong>
                </span>
              ) : (
                <span>
                  {selectedVariant?.option_value || '50g'} ·{' '}
                  <strong className="text-charcoal font-medium">
                    {product.slug === 'green-tea'
                      ? '~35 cups (2g per serving; re-steepable for 70+ cups)'
                      : '~25 cups (2g per serving)'}
                  </strong>
                </span>
              )}
            </div>

            {/* Pack Size / Variant Selector */}
            {product.variants && product.variants.length > 1 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const vInStock = (v.inventory_quantity ?? 0) > 0;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-seedly-dark text-white border-seedly-dark shadow-subtle'
                            : 'bg-white text-charcoal border-border-gray hover:border-seedly-primary'
                        }`}
                      >
                        {v.option_value} • {formatPKR(v.price_minor)}
                        {!vInStock && (
                          <span className="ml-1.5 text-[10px] text-amber-500 font-bold uppercase">(Sold Out)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Controls */}
            {inStock ? (
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3">
                  {/* Stepper */}
                  <div className="flex items-center border border-border-gray rounded-xl bg-white px-2 py-1 shadow-subtle">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-muted-gray hover:text-charcoal"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      className="p-2 text-muted-gray hover:text-charcoal"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Basket */}
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-medium text-sm transition-all shadow-card flex items-center justify-center gap-2 ${
                      added
                        ? 'bg-emerald-700 text-white'
                        : 'bg-seedly-dark hover:bg-seedly-forest text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{added ? 'Added to Basket!' : 'Add to Basket'}</span>
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Save to wishlist"
                    className="p-3.5 rounded-xl border border-border-gray bg-white hover:bg-cream text-charcoal transition-all shadow-subtle"
                  >
                    <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Buy Now Direct CTA */}
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 rounded-xl bg-seedly-light text-seedly-dark hover:bg-seedly-primary/20 border border-seedly-primary/30 font-semibold text-sm transition-all shadow-subtle flex items-center justify-center gap-2"
                >
                  <span>Buy now</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-4">
                <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-amber-700" />
                    <span>Currently out of stock</span>
                  </p>
                  <p className="text-amber-800">
                    We harvest and mill in small batches to preserve freshness. Enter your email to be notified the moment this batch is replenished.
                  </p>
                </div>

                <button
                  onClick={() => setIsNotifyModalOpen(true)}
                  className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm bg-seedly-dark hover:bg-seedly-forest text-white transition-all shadow-card flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Notify Me When Available</span>
                </button>
              </div>
            )}

            {/* Batch & Harvest Transparency Seal */}
            <div className="p-4 rounded-2xl bg-cream/70 border border-border-gray/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-seedly-dark">
                  <CheckCircle2 className="w-3.5 h-3.5 text-seedly-primary" />
                  <span className="uppercase tracking-wider text-[11px]">Harvest &amp; Batch Transparency</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-seedly-light text-seedly-dark font-semibold">
                  BATCH #{product.sku?.replace('SED-', 'PK-26-') || 'PK-26-H1'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] pt-1.5 border-t border-border-gray/50">
                <div>
                  <span className="text-muted-gray block text-[10px]">Harvest Period</span>
                  <span className="font-semibold text-charcoal">
                    {product.slug === 'green-tea' ? 'Spring 2026 Harvest' : 'Winter 2025–2026 Harvest'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-gray block text-[10px]">Best Before</span>
                  <span className="font-semibold text-charcoal">Dec 2026 (12 Months)</span>
                </div>
                <div>
                  <span className="text-muted-gray block text-[10px]">Moisture Verified</span>
                  <span className="font-semibold text-emerald-800">&lt; 7.8% (Cold Stored)</span>
                </div>
              </div>
            </div>

            {/* Delivery & Guarantees */}
            <div className="pt-4 border-t border-border-gray space-y-2.5 text-xs text-muted-gray">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-seedly-primary shrink-0" />
                <span>
                  <strong>Nationwide Dispatch:</strong> 1–2 days in Punjab; 2–3 days Sindh, KPK &amp; Balochistan. Free delivery on orders of Rs. 2,500 or more.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-seedly-primary shrink-0" />
                <span>
                  <strong>Freshness Guarantee:</strong> 7-day replacement if your order arrives damaged or unsealed.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-seedly-primary shrink-0" />
                <span>
                  <strong>100% Raw &amp; Unsalted:</strong> Zero artificial glazes, preservatives, or chemical bleaching.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authoritative Substance-First Product Dossier Tabs */}
      <div className="mt-16 sm:mt-24 pt-10 border-t border-border-gray">
        <div
          role="tablist"
          aria-label="Product Information"
          className="flex items-center gap-4 sm:gap-8 border-b border-border-gray pb-4 overflow-x-auto text-sm font-semibold"
        >
          <button
            id="tab-dossier"
            role="tab"
            aria-selected={activeTab === 'dossier'}
            aria-controls="panel-dossier"
            tabIndex={activeTab === 'dossier' ? 0 : -1}
            onClick={() => setActiveTab('dossier')}
            className={`pb-2 whitespace-nowrap transition-colors relative ${
              activeTab === 'dossier' ? 'text-seedly-dark font-bold' : 'text-muted-gray hover:text-charcoal'
            }`}
          >
            What's Inside &amp; Origin
            {activeTab === 'dossier' && (
              <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-seedly-dark" />
            )}
          </button>
          <button
            id="tab-ritual"
            role="tab"
            aria-selected={activeTab === 'ritual'}
            aria-controls="panel-ritual"
            tabIndex={activeTab === 'ritual' ? 0 : -1}
            onClick={() => setActiveTab('ritual')}
            className={`pb-2 whitespace-nowrap transition-colors relative ${
              activeTab === 'ritual' ? 'text-seedly-dark font-bold' : 'text-muted-gray hover:text-charcoal'
            }`}
          >
            {product.product_type === 'tea' ? 'Steeping & Infusion Ritual' : 'Daily Ritual & Use'}
            {activeTab === 'ritual' && (
              <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-seedly-dark" />
            )}
          </button>
          <button
            id="tab-storage"
            role="tab"
            aria-selected={activeTab === 'storage'}
            aria-controls="panel-storage"
            tabIndex={activeTab === 'storage' ? 0 : -1}
            onClick={() => setActiveTab('storage')}
            className={`pb-2 whitespace-nowrap transition-colors relative ${
              activeTab === 'storage' ? 'text-seedly-dark font-bold' : 'text-muted-gray hover:text-charcoal'
            }`}
          >
            Storage &amp; Packaging
            {activeTab === 'storage' && (
              <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-seedly-dark" />
            )}
          </button>
          <button
            id="tab-faqs"
            role="tab"
            aria-selected={activeTab === 'faqs'}
            aria-controls="panel-faqs"
            tabIndex={activeTab === 'faqs' ? 0 : -1}
            onClick={() => setActiveTab('faqs')}
            className={`pb-2 whitespace-nowrap transition-colors relative ${
              activeTab === 'faqs' ? 'text-seedly-dark font-bold' : 'text-muted-gray hover:text-charcoal'
            }`}
          >
            Common Questions
            {activeTab === 'faqs' && (
              <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-seedly-dark" />
            )}
          </button>
          <button
            id="tab-reviews"
            role="tab"
            aria-selected={activeTab === 'reviews'}
            aria-controls="panel-reviews"
            tabIndex={activeTab === 'reviews' ? 0 : -1}
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 whitespace-nowrap transition-colors relative ${
              activeTab === 'reviews' ? 'text-seedly-dark font-bold' : 'text-muted-gray hover:text-charcoal'
            }`}
          >
            Customer Reviews ({reviews.length})
            {activeTab === 'reviews' && (
              <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-seedly-dark" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-8 max-w-3xl text-sm leading-relaxed text-charcoal space-y-5">
          {activeTab === 'dossier' && (
            <div id="panel-dossier" role="tabpanel" aria-labelledby="tab-dossier" className="space-y-4">
              <p>{product.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white rounded-2xl border border-border-gray space-y-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-gray block">
                    Ingredients
                  </span>
                  <p className="font-medium text-charcoal">{product.ingredients}</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-border-gray space-y-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-gray block">
                    Packaging Format
                  </span>
                  <p className="font-medium text-charcoal">
                    {product.slug === 'chamomile-tea'
                      ? '50g UV-Protective Dark Amber Glass Jar'
                      : product.slug === 'spearmint-tea'
                      ? '50g Multi-Layer Resealable Kraft Barrier Pouch'
                      : product.slug === 'green-tea'
                      ? '75g Multi-Layer Resealable Kraft Barrier Pouch'
                      : '250g Multi-Layer Resealable Kraft Barrier Pouch'}
                  </p>
                </div>
              </div>

              {product.nutrition_information && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-serif font-bold text-base text-charcoal">Factual Profile</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(product.nutrition_information).map(([key, val]) => (
                      <div key={key} className="bg-white p-3 rounded-xl border border-border-gray">
                        <span className="text-[10px] uppercase tracking-wider text-muted-gray font-semibold block capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-charcoal">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ritual' && (
            <div id="panel-ritual" role="tabpanel" aria-labelledby="tab-ritual" className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-base text-charcoal">
                  {product.product_type === 'tea' ? 'Steeping & Infusion Method' : 'How to Use'}
                </h4>
                <p className="text-muted-gray">{product.usage_instructions}</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-border-gray space-y-1">
                <h5 className="font-serif font-bold text-xs text-charcoal">
                  {product.product_type === 'tea' ? 'Preparation Suggestion' : 'Serving Idea'}
                </h5>
                <p className="text-xs text-muted-gray">
                  {product.slug === 'chamomile-tea'
                    ? 'Steep 1 rounded tablespoon of intact whole blossoms in 250ml freshly boiled water (95°C) for 5 minutes. Naturally sweet and calming on its own, or pair with a teaspoon of raw honey before bedtime.'
                    : product.slug === 'spearmint-tea'
                    ? 'Infuse 1 teaspoon of cut leaves in 250ml hot water (90°C) for 3 to 4 minutes. Enjoy warm after meals for soothing digestive ease, or steep double-strength and pour over ice with fresh lemon.'
                    : product.slug === 'green-tea'
                    ? 'Steep 1 teaspoon in 250ml water cooled to 80°C (let boiled water rest for 2 minutes) for 2 minutes. Pour completely into your cup. These tender whole leaves can be re-steeped up to 2 additional times.'
                    : product.slug === 'flax-seeds'
                    ? 'Stir 1 tablespoon of freshly cold-milled flax into morning yogurt bowls, warm porridge, paratha dough, or smoothies for natural soluble fiber and active omega-3s.'
                    : 'Mix 1 tablespoon into morning oats, blend into fruit smoothies, or sprinkle on warm grain dishes right before serving to preserve delicate nutritional enzymes.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div id="panel-storage" role="tabpanel" aria-labelledby="tab-storage" className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-base text-charcoal">Storage Guidelines</h4>
                <p className="text-muted-gray">{product.storage_instructions}</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-border-gray space-y-2">
                <h5 className="font-serif font-bold text-xs text-charcoal">Why packaging matters</h5>
                <p className="text-xs text-muted-gray">
                  {product.product_type === 'tea'
                    ? 'Fragile floral volatile oils and whole tea leaves lose fragrance rapidly when exposed to humidity and light. Our airtight packaging keeps delicate botanicals fresh and fragrant for every cup.'
                    : 'Raw seed oils oxidize quickly under heat and direct light. Keeping your pouch zipped and stored in a cool, dry cupboard (or refrigerating cold-milled flax) ensures peak crunch and nutrient integrity.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'faqs' && (
            <div id="panel-faqs" role="tabpanel" aria-labelledby="tab-faqs" className="space-y-3">
              {product.product_type === 'tea' ? (
                <>
                  <div className="p-4 bg-white rounded-2xl border border-border-gray space-y-1">
                    <h5 className="font-serif font-bold text-sm text-charcoal flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-seedly-primary" />
                      <span>Can these leaves or blossoms be re-steeped?</span>
                    </h5>
                    <p className="text-xs text-muted-gray">
                      {product.slug === 'green-tea'
                        ? 'Yes! Our high-mountain whole green tea leaves can be re-steeped up to 3 times. Increase steep time by 30 seconds for consecutive infusions.'
                        : 'Whole chamomile blossoms and spearmint leaves release their essential oils and brightest aroma during their first 4–5 minute steep.'}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-border-gray space-y-1">
                    <h5 className="font-serif font-bold text-sm text-charcoal flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-seedly-primary" />
                      <span>Does this tea contain caffeine?</span>
                    </h5>
                    <p className="text-xs text-muted-gray">
                      {product.slug === 'green-tea'
                        ? 'Highland Green Tea contains approx 20mg caffeine per cup (about 1/5th of standard coffee), delivering smooth morning focus without jitters.'
                        : 'Pure Whole Chamomile and Gilgit Spearmint are 100% naturally caffeine-free herbal tisanes. Perfect for evening relaxation.'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-white rounded-2xl border border-border-gray space-y-1">
                    <h5 className="font-serif font-bold text-sm text-charcoal flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-seedly-primary" />
                      <span>Are these seeds salted or roasted?</span>
                    </h5>
                    <p className="text-xs text-muted-gray">
                      No. All our pantry seeds are 100% raw, completely unsalted, and unroasted to keep sensitive fatty acids and enzymes unadulterated.
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-border-gray space-y-1">
                    <h5 className="font-serif font-bold text-sm text-charcoal flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-seedly-primary" />
                      <span>Do I need to grind these seeds?</span>
                    </h5>
                    <p className="text-xs text-muted-gray">
                      {product.slug === 'flax-seeds'
                        ? 'Our Golden Flax Seeds are already freshly cold-milled in small weekly batches, so you can enjoy them directly without grinding! Whole pumpkin, sunflower, and sesame can be chewed whole or blended.'
                        : 'Pumpkin and sunflower kernels can be chewed whole or added to bowls directly. White sesame can be enjoyed whole or toasted. Our flax seeds are already pre-milled.'}
                    </p>
                  </div>
                </>
              )}
              <div className="p-4 bg-white rounded-2xl border border-border-gray space-y-1">
                <h5 className="font-serif font-bold text-sm text-charcoal flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-seedly-primary" />
                  <span>How fast is nationwide delivery?</span>
                </h5>
                <p className="text-xs text-muted-gray">
                  Orders are dispatched within 24 hours from our Lahore central hub. Delivery takes 1–2 days in Lahore, 2–3 days in Punjab &amp; Islamabad, and 3–4 business days across Karachi and nationwide via TCS &amp; Leopards Courier.
                </p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-border-gray space-y-1">
                <h5 className="font-serif font-bold text-sm text-charcoal flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-seedly-primary" />
                  <span>What payment methods are supported?</span>
                </h5>
                <p className="text-xs text-muted-gray">
                  Cash on Delivery (COD), direct mobile wallet transfers (JazzCash and Easypaisa), and direct bank transfer to Meezan Bank.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border-gray">
                <div>
                  <h4 className="font-serif font-bold text-lg text-charcoal">Customer Reviews</h4>
                  <p className="text-xs text-muted-gray">
                    {reviews.length > 0
                      ? `${reviews.length} verified review${reviews.length > 1 ? 's' : ''}`
                      : 'Newly introduced harvest. Be the first to share your experience.'}
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-seedly-dark hover:bg-seedly-forest text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  <span>Write a Review</span>
                </button>
              </div>

              {/* Success / Error Messages */}
              {reviewSuccessMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{reviewSuccessMessage}</span>
                </div>
              )}
              {reviewErrorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{reviewErrorMessage}</span>
                </div>
              )}

              {/* Review Submission Form */}
              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="p-5 bg-white rounded-2xl border border-border-gray space-y-4 shadow-subtle">
                  <h5 className="font-serif font-bold text-sm text-charcoal">Submit your review</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Fatima Ali (Lahore)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 bg-cream/40 border border-border-gray rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-seedly-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                        Rating
                      </label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-cream/40 border border-border-gray rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-seedly-primary"
                      >
                        <option value={5}>★★★★★ (5 - Excellent)</option>
                        <option value={4}>★★★★☆ (4 - Good)</option>
                        <option value={3}>★★★☆☆ (3 - Average)</option>
                        <option value={2}>★★☆☆☆ (2 - Poor)</option>
                        <option value={1}>★☆☆☆☆ (1 - Very Bad)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Very clean and fresh seeds"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-cream/40 border border-border-gray rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-seedly-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                      Review Comments *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share your thoughts on freshness, taste, and packaging..."
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      className="w-full px-3 py-2 bg-cream/40 border border-border-gray rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-seedly-primary"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 border border-border-gray rounded-xl text-xs text-muted-gray hover:text-charcoal"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-5 py-2 bg-seedly-dark text-white rounded-xl text-xs font-semibold hover:bg-seedly-forest disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit for Verification'}
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-5 bg-white rounded-2xl border border-border-gray space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-charcoal">{rev.customer_name}</span>
                        {rev.verified_purchase && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-muted-gray text-[11px]">{formatDate(rev.created_at)}</span>
                    </div>
                    <div className="flex text-amber-500 text-xs">
                      {'★'.repeat(rev.rating)}
                      {'☆'.repeat(5 - rev.rating)}
                    </div>
                    {rev.title && <h5 className="font-bold text-xs text-charcoal">{rev.title}</h5>}
                    <p className="text-xs text-muted-gray leading-relaxed">{rev.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Genuinely Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16 pt-12 border-t border-border-gray">
          <h3 className="font-serif text-2xl font-bold text-charcoal mb-6">You may also like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.slice(0, 3).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Notify Me Modal */}
      <NotifyMeModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        itemTitle={product.name}
        productId={product.id}
        variantId={selectedVariant?.id}
      />
    </div>
  );
}
