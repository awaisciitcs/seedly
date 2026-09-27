'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Kit, Review } from '../../lib/types';
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
  Calendar,
  CheckCircle2,
  Box,
  PenLine,
  X,
  AlertCircle,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { NotifyMeModal } from './NotifyMeModal';

interface KitDetailViewProps {
  kit: Kit;
}

export function KitDetailView({ kit }: KitDetailViewProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

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
        const res = await fetch(`/api/reviews?productId=${kit.id}`);
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
  }, [kit.id]);

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
          product_id: kit.id,
          product_name: kit.name,
          customer_name: customerName,
          rating: reviewRating,
          title: reviewTitle || 'Verified Kit Feedback',
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

  const wishlisted = isInWishlist(kit.id);
  const inStock = (kit.computed_stock ?? 0) > 0;
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);

  const handleAddToCart = () => {
    if (!inStock) {
      setIsNotifyModalOpen(true);
      return;
    }
    addItem({
      id: `${kit.id}-kit`,
      product_id: kit.id,
      kit_id: kit.id,
      name: kit.name,
      slug: kit.slug,
      variant_label: kit.package_size,
      price_minor: kit.price_minor,
      image_url: kit.image_url,
      quantity,
      product_type: 'kit',
      max_quantity: kit.computed_stock ?? 0,
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
        <Link href="/kits" className="hover:text-charcoal">Seed Kits</Link>
        <span>/</span>
        <span className="text-charcoal font-medium truncate">{kit.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Left Column: Kit Imagery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-cream border border-border-gray shadow-card">
            <Image
              src={kit.image_url}
              alt={kit.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {kit.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-subtle">
                {kit.badge}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Controls & Info */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Header / Rating */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
                Curated Botanical Protocol
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="font-semibold text-charcoal">{kit.rating}</span>
                <span className="text-muted-gray">({kit.review_count} verified reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal leading-tight">
              {kit.name}
            </h1>

            {/* Short descriptor */}
            <p className="text-sm sm:text-base text-muted-gray leading-relaxed">
              {kit.short_description}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="font-serif text-3xl font-bold text-charcoal">
                {formatPKR(kit.price_minor)}
              </span>
              {kit.compare_price_minor && (
                <span className="text-base text-muted-gray line-through">
                  {formatPKR(kit.compare_price_minor)}
                </span>
              )}
              {inStock ? (
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
                  {kit.computed_stock > 10 ? 'In Stock' : `Low Stock: ${kit.computed_stock} kits left`}
                </span>
              ) : (
                <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Bell className="w-3 h-3 text-amber-600" />
                  <span>Temporarily Out of Stock</span>
                </span>
              )}
            </div>

            {/* Included Products in this Kit */}
            <div className="p-4 bg-white rounded-2xl border border-border-gray shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-seedly-primary" />
                  <span>Included in This Kit</span>
                </h4>
                <span className="text-[11px] text-muted-gray font-medium">
                  {kit.package_size}
                </span>
              </div>

              <div className="divide-y divide-border-gray/50 text-xs">
                {kit.items.map((item, idx) => (
                  <div key={item.id || idx} className="py-2 flex items-center justify-between">
                    <span className="font-medium text-charcoal">
                      {item.quantity}x {item.product_name}
                      {item.variant_name ? ` (${item.variant_name})` : ''}
                    </span>
                    <span className="text-emerald-700 font-semibold text-[11px]">
                      {item.available_stock} in stock
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* In Stock vs Out of Stock Action Controls */}
            {inStock ? (
              <div className="space-y-3 pt-2">
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
                      onClick={() => setQuantity(Math.min(kit.computed_stock, quantity + 1))}
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
                    <span>{added ? 'Kit Added to Basket!' : 'Add Kit to Basket'}</span>
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={() => toggleWishlist(kit.id)}
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
                  <span>Instant Checkout with Delivery Details</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                    <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>This ritual kit is currently sold out</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Constituent seed components are being prepared. Leave your email to receive an instant automated restock alert as soon as this protocol kit is available.
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
                      onClick={() => toggleWishlist(kit.id)}
                      aria-label="Save to wishlist"
                      className="p-3.5 rounded-xl border border-border-gray bg-white hover:bg-cream text-charcoal transition-all shadow-subtle"
                    >
                      <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Trust Perks */}
            <div className="pt-4 border-t border-border-gray/70 space-y-2 text-xs text-muted-gray">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-seedly-primary shrink-0" />
                <span>
                  <strong>Free Nationwide Express Delivery:</strong> Dispatched via courier across all Pakistan.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Freshness Guaranteed:</strong> Whole, unroasted seeds ready for high bioavailability.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kit Detailed Guide */}
      <div className="mt-16 sm:mt-24 pt-10 border-t border-border-gray max-w-3xl space-y-8">
        <div>
          <h3 className="font-serif text-2xl font-bold text-charcoal mb-3">Protocol Overview</h3>
          <p className="text-sm leading-relaxed text-charcoal">{kit.description}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-gray space-y-3">
          <h4 className="font-serif font-bold text-base text-charcoal flex items-center gap-2">
            <Calendar className="w-4 h-4 text-seedly-primary" />
            <span>How to Practice This Daily Ritual</span>
          </h4>
          <p className="text-sm text-charcoal leading-relaxed">{kit.usage_instructions}</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-serif font-bold text-base text-charcoal">Storage Advice</h4>
          <p className="text-sm text-muted-gray">{kit.storage_instructions}</p>
        </div>

        {/* Customer Reviews & Feedback */}
        <div className="pt-8 border-t border-border-gray space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-border-gray shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(kit.rating || 5)
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-border-gray fill-transparent'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-base text-charcoal">{kit.rating || 5.0} / 5.0</span>
              </div>
              <p className="text-xs text-muted-gray">
                Verified Customer Reviews ({reviews.length > 0 ? reviews.length : kit.review_count || 0})
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

          {/* Review Form */}
          {showReviewForm && (
            <form
              onSubmit={handleReviewSubmit}
              className="bg-white p-6 rounded-3xl border border-seedly-primary/30 shadow-card space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border-gray/60">
                <h4 className="font-serif font-bold text-base text-charcoal">Share Your Kit Experience</h4>
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
                  placeholder="e.g. Fatima K. (Karachi)"
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
                  placeholder="e.g. Beautiful presentation and effortless routine"
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
                  placeholder="Share details on freshness, ritual routine, packaging, or delivery in Pakistan..."
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-gray text-xs focus:outline-none focus:border-seedly-primary focus:ring-1 focus:ring-seedly-primary bg-cream/20 leading-relaxed"
                />
              </div>

              <p className="text-[11px] text-muted-gray">
                Note: All customer reviews are moderated by our curation team before appearing publicly.
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
                  Be the first to share your experience with this botanical protocol kit.
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
      </div>

      {/* Restock Notification Modal */}
      <NotifyMeModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        kitId={kit.id}
        sellableTitle={kit.name}
      />
    </div>
  );
}
