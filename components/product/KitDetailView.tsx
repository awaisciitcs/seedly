'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Kit, Review } from '../../lib/types';
import { formatPKR, formatDate } from '../../lib/utils';
import { useCart } from '../../lib/store/cart';
import { useWishlist } from '../../lib/store/wishlist';
import { Star, PenLine, Bell, MessageCircle, Info, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { NotifyMeModal } from './NotifyMeModal';
import { PurchaseActions } from './PurchaseActions';
import { StickyPurchaseBar } from './StickyPurchaseBar';
import { KitContentsExplorer } from './KitContentsExplorer';
import { siteConfig } from '../../lib/config';

interface KitDetailViewProps {
  kit: Kit;
}

export function KitDetailView({ kit }: KitDetailViewProps) {
  const router = useRouter();
  const { addItem, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const mainActionsRef = React.useRef<HTMLDivElement>(null);

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
      setReviewErrorMessage('Please provide your name and review details.');
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
          title: reviewTitle || 'Verified Feedback',
          body: reviewBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to submit review');

      setReviewSuccessMessage(
        data.message ||
          'Thank you. Your review has been submitted for moderation and will appear once approved.'
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
  const currentStock = kit.computed_stock ?? 0;
  const inStock = currentStock > 0;
  const isLowStock = inStock && currentStock <= 5;
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
        max_quantity: currentStock,
      },
      { openDrawer: false }
    );
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const waMessage = encodeURIComponent(`Hi Seedly, I have a question about the ${kit.name}.`);

  return (
    <div className="max-w-7xl mx-auto w-full px-5 md:px-8 py-8 sm:py-12 bg-white text-neutral-900">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-stone-400 mb-8">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <Link href="/kits" className="capitalize hover:text-black transition-colors">Curated Seed Kits</Link>
        <span>/</span>
        <span className="text-neutral-900 truncate font-semibold">{kit.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Left Column: Kit Imagery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FBFBFA] border border-gray-200/90 shadow-xs">
            <Image
              src={kit.image_url}
              alt={kit.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Top-Right Badge */}
            <div className="absolute top-4 right-4 z-10 rounded-full border border-gray-200/90 bg-white/95 backdrop-blur-xs px-3 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-800 shadow-xs">
              PACKED IN LAHORE ✦ DISPATCHED IN 24H
            </div>

            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs px-3.5 py-1 rounded-full border border-gray-200/90 text-xs font-medium text-neutral-800 shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
              <span>{kit.package_size || 'Complete Curated Box'}</span>
            </div>
          </div>

          {/* Contextual WhatsApp Consultation */}
          <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-gray-200/90 shadow-xs flex flex-col items-start sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-900">Questions about how this routine works?</p>
              <p className="text-xs text-stone-500 font-normal">Chat with our team on WhatsApp for ingredients, preparation and storage guidance.</p>
            </div>
            <a
              href={`${siteConfig.contact.whatsappUrl}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-white border border-gray-200 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold uppercase tracking-wider shadow-xs shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-neutral-700" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Right Column: Controls & Info */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Header / Social Proof */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-stone-100 text-stone-700 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                ✦ 14 &amp; 28-Day Routine Kit
              </span>

              {reviews.length > 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-800">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500 stroke-1" />
                  </div>
                  <span className="font-semibold text-neutral-900">{(reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)}</span>
                  <span className="text-stone-400">({reviews.length} reviews)</span>
                </div>
              ) : null}
            </div>

            {/* Title */}
            <h1 className="font-heading font-medium text-3xl sm:text-4xl lg:text-5xl text-neutral-900 leading-tight tracking-tight">
              {kit.name}
            </h1>

            {/* Short descriptor */}
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              {kit.short_description}
            </p>

            {/* Price & Inventory State */}
            <div className="flex flex-wrap items-baseline gap-3 pt-1">
              <span className="font-heading font-semibold text-3xl sm:text-4xl text-neutral-900 tabular-nums">
                {formatPKR(kit.price_minor)}
              </span>
              {kit.compare_price_minor && (
                <span className="text-base text-stone-400 line-through tabular-nums font-normal">
                  {formatPKR(kit.compare_price_minor)}
                </span>
              )}
              {inStock ? (
                isLowStock ? (
                  <span className="text-[11px] font-medium uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full">
                    Low stock — {currentStock} kits left
                  </span>
                ) : (
                  <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                    In Stock in Lahore
                  </span>
                )
              ) : (
                <span className="text-[11px] font-medium uppercase tracking-wider text-rose-800 bg-rose-50 border border-rose-200 px-3 py-0.5 rounded-full flex items-center gap-1">
                  <Bell className="w-3 h-3 text-rose-700" />
                  <span>Out of stock</span>
                </span>
              )}
            </div>

            <KitContentsExplorer items={kit.items} kitSlug={kit.slug} />

            {/* In Stock vs Out of Stock Action Controls */}
            <div ref={mainActionsRef} className="space-y-3 pt-1">
              <div className="flex items-center gap-2 py-2.5 px-4 bg-[#FBFBFA] border border-gray-200/90 rounded-full text-xs font-normal text-stone-600 shadow-xs">
                <Truck className="h-4 w-4 text-neutral-700" aria-hidden="true" />
                <span>
                  <strong className="text-neutral-900 font-semibold">Flat Rs. 200 delivery</strong> · <strong className="text-neutral-900 font-semibold">FREE</strong> over Rs. 2,500 · Dispatched in 24h from Lahore
                </span>
              </div>
              {inStock ? (
                <PurchaseActions
                  quantity={quantity}
                  maxQuantity={currentStock}
                  added={added}
                  wishlisted={wishlisted}
                  onQuantityChange={setQuantity}
                  onAdd={handleAddToCart}
                  onBuy={handleBuyNow}
                  onWishlist={() => toggleWishlist(kit.id)}
                />
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-1">
                    <p className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-amber-700" />
                      <span>Kit currently out of stock</span>
                    </p>
                    <p className="text-stone-600 font-normal">
                      Leave your email and we will let you know when this kit is available.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsNotifyModalOpen(true)}
                    className="h-12 sm:h-13 w-full rounded-full font-semibold text-xs sm:text-sm uppercase tracking-wider bg-neutral-900 hover:bg-black text-white shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Notify Me When Kit Returns</span>
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-2 text-xs font-normal leading-5 text-stone-500">
              <p>Delivery across Pakistan. <Link href="/shipping" className="underline underline-offset-4 text-neutral-800 hover:text-black">See delivery times and charges</Link>.</p>
              <p>Check each pack for storage instructions and its best-before date.</p>
              {(kit.slug === 'luteal-blend' || kit.slug === 'complete-cycle-kit') && (
                <p className="text-amber-900">{siteConfig.disclaimer.sesame}</p>
              )}
            </div>

            {/* Standard Dietary Disclaimer Box */}
            <div className="p-4 bg-[#FBFBFA] rounded-2xl border border-gray-200/90 text-xs text-stone-500 leading-relaxed flex items-start gap-2.5 shadow-xs">
              <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 font-semibold uppercase tracking-wider block mb-1">Dietary Food Notice: </strong>
                {siteConfig.disclaimer.standard}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Routine Dossier Breakdown */}
      <div className="mt-16 sm:mt-24 pt-10 border-t border-gray-200 space-y-10">
        <div className="max-w-3xl space-y-3">
          <h2 className="font-heading font-medium text-2xl sm:text-3xl text-neutral-900">
            How this seed routine works
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
            {kit.description}
          </p>
        </div>

        {/* 2-Step Routine Visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-[#FBFBFA] rounded-2xl border border-gray-200/90 space-y-3 shadow-xs">
            <span className="text-[11px] uppercase font-semibold tracking-wider text-neutral-800 bg-stone-200/80 px-2.5 py-0.5 rounded-full inline-block">
              Daily Usage
            </span>
            <h3 className="font-heading font-medium text-lg text-neutral-900">
              Simple Preparation
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              {kit.usage_instructions}
            </p>
          </div>

          <div className="p-6 bg-[#FBFBFA] rounded-2xl border border-gray-200/90 space-y-3 shadow-xs">
            <span className="text-[11px] uppercase font-semibold tracking-wider text-neutral-800 bg-stone-200/80 px-2.5 py-0.5 rounded-full inline-block">
              Proper Storage
            </span>
            <h3 className="font-heading font-medium text-lg text-neutral-900">
              Protecting Freshness
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              {kit.storage_instructions}
            </p>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="pt-8 border-t border-gray-200 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <h3 className="font-heading font-medium text-xl text-neutral-900">Customer reviews</h3>
              <p className="text-xs sm:text-sm text-stone-500 font-normal mt-0.5">
                {reviews.length > 0
                  ? `${reviews.length} review${reviews.length > 1 ? 's' : ''}`
                  : 'Be the first to leave a review for this kit.'}
              </p>
            </div>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="p-6 bg-[#FBFBFA] rounded-2xl border border-gray-200 space-y-4">
              <h5 className="font-heading font-medium text-sm text-neutral-900">Review this kit</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="kit-review-name" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    id="kit-review-name"
                    name="customerName"
                    type="text"
                    required
                    placeholder="e.g. Zainab M. (Karachi)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label htmlFor="kit-review-rating" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Rating
                  </label>
                  <select
                    id="kit-review-rating"
                    name="reviewRating"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
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
                <label htmlFor="kit-review-title" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  id="kit-review-title"
                  name="reviewTitle"
                  type="text"
                  placeholder="e.g. Beautiful packaging and easy to follow"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>
              <div>
                <label htmlFor="kit-review-body" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Review Details *
                </label>
                <textarea
                  id="kit-review-body"
                  name="reviewBody"
                  required
                  rows={3}
                  placeholder="How was the experience, taste, and daily convenience?"
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-gray-200 bg-white hover:bg-neutral-50 rounded-full text-xs font-semibold uppercase tracking-wider text-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2 bg-neutral-900 hover:bg-black text-white rounded-full text-xs font-semibold uppercase tracking-wider disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          {/* List */}
          <div className="space-y-3.5">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 bg-white rounded-2xl border border-gray-200/90 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">{rev.customer_name}</span>
                    {rev.verified_purchase && (
                      <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-stone-400 text-xs">{formatDate(rev.created_at)}</span>
                </div>
                <div className="flex text-amber-500 text-sm">
                  {'★'.repeat(rev.rating)}
                  {'☆'.repeat(5 - rev.rating)}
                </div>
                {rev.title && <h5 className="font-semibold text-sm text-neutral-900">{rev.title}</h5>}
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">{rev.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notify Me Modal */}
      <NotifyMeModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        itemTitle={kit.name}
        kitId={kit.id}
      />

      {/* Sticky Mobile Purchase Bar */}
      <StickyPurchaseBar
        name={kit.name}
        priceMinor={kit.price_minor}
        imageUrl={kit.image_url}
        variantLabel={kit.package_size}
        inStock={inStock}
        targetRef={mainActionsRef}
        onAddToCart={handleAddToCart}
        onNotifyMe={() => setIsNotifyModalOpen(true)}
      />
    </div>
  );
}

export default KitDetailView;
