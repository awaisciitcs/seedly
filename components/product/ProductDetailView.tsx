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
  Sparkles,
  ChevronDown,
  ChevronUp,
  Leaf,
  Clock,
  Thermometer,
  Coffee,
  MessageSquare,
  CheckCircle2,
  PenLine,
  X,
  AlertCircle,
  Bell,
} from 'lucide-react';
import { NotifyMeModal } from './NotifyMeModal';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts?: Product[];
}

export function ProductDetailView({ product, relatedProducts = [] }: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'usage' | 'specs' | 'reviews'>('desc');
  const [added, setAdded] = useState(false);

  const priceMinor = selectedVariant ? selectedVariant.price_minor : product.price_minor;
  const comparePriceMinor = selectedVariant?.compare_price_minor || product.compare_price_minor;
  const inStock = (selectedVariant?.inventory_quantity ?? 0) > 0;
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
      setReviewErrorMessage('Please enter your name and review details.');
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
          title: reviewTitle || 'Verified Botanical Feedback',
          body: reviewBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to submit review');

      setReviewSuccessMessage(
        data.message ||
          'Thank you! Your review has been submitted for moderation and will appear once approved by our curation team.'
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
      max_quantity: selectedVariant?.inventory_quantity ?? 0,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

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
        {/* Left Column: Image Gallery */}
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
          </div>
        </div>

        {/* Right Column: Product Controls & Info */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Rating & Category */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
                {product.product_type === 'tea' ? 'Whole Flower Infusion' : '100% Raw Heirloom'}
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="font-semibold text-charcoal">{product.rating}</span>
                <span className="text-muted-gray">({product.review_count} verified reviews)</span>
              </div>
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
              <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-seedly-light/60 rounded-2xl border border-seedly-primary/20 text-xs text-seedly-dark">
                {product.flavor_profile && (
                  <div className="space-y-0.5">
                    <span className="font-semibold flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5" /> Notes
                    </span>
                    <p className="text-[11px] text-muted-gray truncate">{product.flavor_profile}</p>
                  </div>
                )}
                {product.steep_time && (
                  <div className="space-y-0.5">
                    <span className="font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Brew Time
                    </span>
                    <p className="text-[11px] text-muted-gray">{product.steep_time}</p>
                  </div>
                )}
                {product.caffeine_level && (
                  <div className="space-y-0.5">
                    <span className="font-semibold flex items-center gap-1">
                      <Coffee className="w-3.5 h-3.5" /> Caffeine
                    </span>
                    <p className="text-[11px] text-muted-gray">{product.caffeine_level}</p>
                  </div>
                )}
              </div>
            )}

            {/* Price Display */}
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
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
                  In Stock & Ready to Ship
                </span>
              ) : (
                <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Bell className="w-3 h-3 text-amber-600" />
                  <span>Temporarily Out of Stock</span>
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

            {/* In Stock vs Out of Stock Action Controls */}
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
                      onClick={() => setQuantity(Math.min(selectedVariant?.inventory_quantity ?? 50, quantity + 1))}
                      className="p-2 text-muted-gray hover:text-charcoal"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart */}
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
                  className="w-full py-3.5 rounded-xl bg-seedly-light text-seedly-dark hover:bg-seedly-primary/30 border border-seedly-primary/30 font-semibold text-sm transition-all shadow-subtle flex items-center justify-center gap-2"
                >
                  <span>Buy Now with 1-Click Checkout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-4">
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                    <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>This harvest selection is currently sold out</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Batches are cold-packed weekly in Lahore. Leave your email to receive an automated notification as soon as fresh harvest is back in stock.
                  </p>
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsNotifyModalOpen(true)}
                      className="flex-1 py-3.5 px-5 rounded-xl bg-seedly-dark hover:bg-seedly-forest text-white text-xs font-semibold transition-all shadow-card flex items-center justify-center gap-2"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Notify Me When Available</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      aria-label="Save to wishlist"
                      className="p-3.5 rounded-xl border border-border-gray bg-white hover:bg-cream text-charcoal transition-all shadow-subtle"
                    >
                      <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery & Trust Perks */}
            <div className="pt-4 border-t border-border-gray/70 space-y-2.5 text-xs text-muted-gray">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-seedly-primary shrink-0" />
                <span>
                  <strong>Fast Delivery:</strong> 1–2 days in Lahore & Karachi; 2–4 days nationwide. Free over Rs. 2,500.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-seedly-primary shrink-0" />
                <span>
                  <strong>7-Day Freshness Guarantee:</strong> Hassle-free replacement if not fully satisfied.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-seedly-primary shrink-0" />
                <span>
                  <strong>Verified Purity:</strong> 100% natural, unbleached, untreated with heat or chemicals.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Specifications & Sourcing Accordion */}
      <div className="mt-16 sm:mt-24 pt-10 border-t border-border-gray">
        <div className="flex items-center gap-4 sm:gap-8 border-b border-border-gray/80 pb-4 overflow-x-auto text-sm font-semibold">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-2 whitespace-nowrap transition-colors relative ${
              activeTab === 'desc' ? 'text-seedly-dark' : 'text-muted-gray hover:text-charcoal'
            }`}
          >
            Description & Sourcing
            {activeTab === 'desc' && (
              <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-seedly-dark" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`pb-2 whitespace-nowrap transition-colors relative ${
              activeTab === 'usage' ? 'text-seedly-dark' : 'text-muted-gray hover:text-charcoal'
            }`}
          >
            How to Use & Brew
            {activeTab === 'usage' && (
              <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-seedly-dark" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2 whitespace-nowrap transition-colors relative ${
              activeTab === 'specs' ? 'text-seedly-dark' : 'text-muted-gray hover:text-charcoal'
            }`}
          >
            Nutritional & Botanical Specs
            {activeTab === 'specs' && (
              <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-seedly-dark" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 whitespace-nowrap transition-colors relative ${
              activeTab === 'reviews' ? 'text-seedly-dark' : 'text-muted-gray hover:text-charcoal'
            }`}
          >
            Verified Reviews ({product.review_count})
            {activeTab === 'reviews' && (
              <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-seedly-dark" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-8 max-w-3xl text-sm leading-relaxed text-charcoal space-y-4">
          {activeTab === 'desc' && (
            <div className="space-y-4">
              <p>{product.description}</p>
              <div className="bg-white p-5 rounded-2xl border border-border-gray space-y-2 mt-4">
                <h4 className="font-serif font-bold text-base text-charcoal">Pure Packaging Promise</h4>
                <p className="text-xs text-muted-gray">
                  Every batch of Seedly seeds and teas is protected in dark UV-resistant packaging or airtight moisture-locked jars to prevent the delicate essential fatty acids and volatile floral aroma oils from degrading.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-base text-charcoal">Recommended Daily Ritual</h4>
                <p>{product.usage_instructions}</p>
              </div>
              <div className="space-y-2 pt-2">
                <h4 className="font-serif font-bold text-base text-charcoal">Storage Recommendations</h4>
                <p className="text-muted-gray">{product.storage_instructions}</p>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-base text-charcoal">Ingredients</h4>
                <p className="font-mono text-xs bg-white p-3 rounded-xl border border-border-gray">
                  {product.ingredients}
                </p>
              </div>
              {product.nutrition_information && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-serif font-bold text-base text-charcoal">Nutritional Profile</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(product.nutrition_information).map(([key, val]) => (
                      <div key={key} className="bg-white p-3 rounded-xl border border-border-gray">
                        <span className="text-[11px] uppercase tracking-wider text-muted-gray font-semibold block capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-bold text-charcoal">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="bg-white p-6 rounded-3xl border border-border-gray shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(product.rating || 5)
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-border-gray fill-transparent'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-base text-charcoal">{product.rating || 5.0} / 5.0</span>
                  </div>
                  <p className="text-xs text-muted-gray">
                    Based on verified customer orders ({reviews.length > 0 ? reviews.length : product.review_count} verified reviews)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-seedly-dark hover:bg-seedly-forest text-white text-xs font-semibold shadow-subtle transition-all self-start sm:self-auto"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  <span>{showReviewForm ? 'Cancel Review' : 'Write a Review'}</span>
                </button>
              </div>

              {/* Success Notification */}
              {reviewSuccessMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Thank You For Your Review!</p>
                    <p className="text-emerald-700 leading-relaxed">{reviewSuccessMessage}</p>
                  </div>
                </div>
              )}

              {/* Review Form Drawer / Box */}
              {showReviewForm && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="bg-white p-6 rounded-3xl border border-seedly-primary/30 shadow-card space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border-gray/60">
                    <h4 className="font-serif font-bold text-base text-charcoal">Share Your Experience</h4>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="p-1 rounded-lg text-muted-gray hover:text-charcoal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {reviewErrorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{reviewErrorMessage}</span>
                    </div>
                  )}

                  {/* Rating Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-charcoal block">Overall Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 text-amber-500 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= reviewRating
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-border-gray fill-transparent'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-medium text-muted-gray ml-2">
                        {reviewRating === 5
                          ? 'Exceptional Pure Quality'
                          : reviewRating === 4
                          ? 'Very Good Experience'
                          : reviewRating === 3
                          ? 'Satisfactory'
                          : reviewRating === 2
                          ? 'Could Be Better'
                          : 'Needs Improvement'}
                      </span>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal block">
                      Your Name & City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fatima K. (Lahore)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border-gray text-xs focus:outline-none focus:border-seedly-primary focus:ring-1 focus:ring-seedly-primary bg-cream/20"
                    />
                  </div>

                  {/* Review Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal block">
                      Review Headline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Incredibly fresh aroma and crisp crunch"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border-gray text-xs focus:outline-none focus:border-seedly-primary focus:ring-1 focus:ring-seedly-primary bg-cream/20"
                    />
                  </div>

                  {/* Review Body */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal block">
                      Your Detailed Experience *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Share details on freshness, fragrance, how you used it, packaging, or delivery in Pakistan..."
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border-gray text-xs focus:outline-none focus:border-seedly-primary focus:ring-1 focus:ring-seedly-primary bg-cream/20 leading-relaxed"
                    />
                  </div>

                  {/* Moderation notice */}
                  <p className="text-[11px] text-muted-gray">
                    Note: To maintain high standards and verified authenticity, all reviews undergo moderation before appearing publicly.
                  </p>

                  {/* Submit CTA */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-5 py-2.5 rounded-xl bg-seedly-dark hover:bg-seedly-forest text-white text-xs font-semibold shadow-card transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {submittingReview ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          <PenLine className="w-3.5 h-3.5" />
                          <span>Submit Review for Verification</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2.5 rounded-xl border border-border-gray text-muted-gray hover:text-charcoal text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {loadingReviews ? (
                  <div className="py-8 text-center text-xs text-muted-gray">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="bg-white p-8 rounded-3xl border border-border-gray text-center space-y-3">
                    <MessageSquare className="w-8 h-8 text-muted-gray/50 mx-auto" />
                    <p className="text-sm font-semibold text-charcoal">No customer reviews yet</p>
                    <p className="text-xs text-muted-gray max-w-md mx-auto">
                      Be the first to share your botanical experience with this harvest. Verified buyers receive gratitude from our organic farming collective.
                    </p>
                    {!showReviewForm && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-seedly-light text-seedly-dark border border-seedly-primary/30 text-xs font-semibold"
                      >
                        <PenLine className="w-3.5 h-3.5" />
                        <span>Write the First Review</span>
                      </button>
                    )}
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white p-5 rounded-2xl border border-border-gray shadow-subtle space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-charcoal">{rev.customer_name}</span>
                          {rev.verified_purchase && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Verified Buyer</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-gray">{formatDate(rev.created_at)}</span>
                      </div>

                      <div className="flex items-center text-amber-500 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-border-gray fill-transparent'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="space-y-1">
                        <h5 className="font-bold text-xs text-charcoal">{rev.title}</h5>
                        <p className="text-xs text-muted-gray leading-relaxed">"{rev.body}"</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 pt-12 border-t border-border-gray">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif text-2xl font-bold text-charcoal">Complete Your Botanical Ritual</h3>
            <Link href="/shop" className="text-xs font-semibold text-seedly-dark hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <div key={p.id} className="scale-95">
                <Link href={`/${p.product_type === 'tea' ? 'teas' : 'seeds'}/${p.slug}`} className="block">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-cream border border-border-gray mb-2">
                    <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                  </div>
                  <h4 className="font-serif text-sm font-semibold text-charcoal truncate">{p.name}</h4>
                  <p className="text-xs font-bold text-seedly-dark mt-1">{formatPKR(p.price_minor)}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restock Notification Modal */}
      <NotifyMeModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        productId={product.id}
        variantId={selectedVariant?.id}
        sellableTitle={`${product.name}${selectedVariant?.option_value ? ` (${selectedVariant.option_value})` : ''}`}
      />
    </div>
  );
}
