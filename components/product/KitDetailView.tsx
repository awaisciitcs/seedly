'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Kit, Review } from '../../lib/types';
import { formatPKR, formatDate } from '../../lib/utils';
import { useCart } from '../../lib/store/cart';
import { useWishlist } from '../../lib/store/wishlist';
import { Star, Box, PenLine, Bell, MessageCircle, Info } from 'lucide-react';
import { NotifyMeModal } from './NotifyMeModal';
import { PurchaseActions } from './PurchaseActions';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-gray mb-8">
        <Link href="/" className="hover:text-charcoal">Home</Link>
        <span>/</span>
        <Link href="/kits" className="hover:text-charcoal">Curated Kits</Link>
        <span>/</span>
        <span className="text-charcoal font-medium truncate">{kit.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Left Column: Kit Imagery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-sm overflow-hidden bg-cream border border-border-gray">
            <Image
              src={kit.image_url}
              alt={kit.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Contextual WhatsApp Consultation */}
          <div className="p-4 rounded-sm bg-white border border-border-gray flex flex-col items-start sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-charcoal">Questions about how this routine works?</p>
              <p className="text-sm text-muted-gray">Chat with our team on WhatsApp for ingredients, preparation and storage guidance.</p>
            </div>
            <a
              href={`${siteConfig.contact.whatsappUrl}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-sm font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Right Column: Controls & Info */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Header / Social Proof */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm uppercase tracking-widest font-semibold text-seedly-primary">
                Seed kit
              </span>

              {reviews.length > 0 ? (
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <span className="font-semibold text-charcoal">{(reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)}</span>
                  <span className="text-muted-gray">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                </div>
              ) : null}
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal leading-tight">
              {kit.name}
            </h1>

            {/* Short descriptor */}
            <p className="text-sm sm:text-base text-muted-gray leading-relaxed">
              {kit.short_description}
            </p>

            {/* Price & Inventory State */}
            <div className="flex flex-wrap items-baseline gap-3 pt-2">
              <span className="font-serif text-3xl font-medium text-charcoal">
                {formatPKR(kit.price_minor)}
              </span>
              {kit.compare_price_minor && (
                <span className="text-base text-muted-gray line-through">
                  {formatPKR(kit.compare_price_minor)}
                </span>
              )}
              {inStock ? (
                isLowStock ? (
                  <span className="text-sm text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium">
                    Low stock — only {currentStock} kits left
                  </span>
                ) : (
                  <span className="text-sm text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
                    In stock
                  </span>
                )
              ) : (
                <span className="text-sm text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Bell className="w-3 h-3 text-rose-600" />
                  <span>Out of stock</span>
                </span>
              )}
            </div>

            <section aria-labelledby="kit-contents" className="border-y border-border-gray py-5 space-y-4">
              <h2 id="kit-contents" className="font-serif text-xl font-normal">In the box</h2>
              <p className="text-sm leading-6 text-muted-gray">{kit.package_size}</p>
              <ul className="divide-y divide-border-gray text-sm">
                {kit.items.map((item) => (
                  <li key={item.id} className="py-3">
                    {item.quantity} &times; {item.product_name}{item.variant_name ? ' (' + item.variant_name + ')' : ''}
                  </li>
                ))}
              </ul>
            </section>

            {/* In Stock vs Out of Stock Action Controls */}
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
                <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-sm text-sm text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-amber-700" />
                    <span>Kit currently out of stock</span>
                  </p>
                  <p className="text-amber-800">
                    Leave your email and we will let you know when this kit is available.
                  </p>
                </div>

                <button
                  onClick={() => setIsNotifyModalOpen(true)}
                  className="min-h-14 w-full py-3.5 px-6 rounded-full font-medium text-sm bg-seedly-dark hover:bg-seedly-forest text-white transition-all flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Notify Me When Kit Returns</span>
                </button>
              </div>
            )}

            <div className="border-t border-border-gray pt-5 space-y-3 text-sm leading-6 text-muted-gray">
              <p>Delivery across Pakistan. <Link href="/shipping" className="underline underline-offset-4 text-seedly-dark">See delivery times and charges</Link>.</p>
              <p>Check each pack for storage instructions and its best-before date.</p>
              {(kit.slug === 'luteal-blend' || kit.slug === 'complete-cycle-kit') && (
                <p className="text-amber-900">{siteConfig.disclaimer.sesame}</p>
              )}
            </div>

            {/* Standard Dietary Disclaimer Box */}
            <div className="p-3.5 bg-warm-white rounded-sm border border-border-gray/70 text-sm text-muted-gray leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-muted-gray shrink-0 mt-0.5" />
              <div>
                <strong className="text-charcoal font-medium">Dietary Food Notice: </strong>
                {siteConfig.disclaimer.standard}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Routine Dossier Breakdown */}
      <div className="mt-16 sm:mt-24 pt-10 border-t border-border-gray space-y-12">
        <div className="max-w-3xl space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
            How this seed routine works
          </h2>
          <p className="text-sm sm:text-base text-muted-gray leading-relaxed">
            {kit.description}
          </p>
        </div>

        {/* 2-Step Routine Visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-sm border border-border-gray space-y-3">
            <span className="text-sm uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full inline-block">
              Daily Usage
            </span>
            <h3 className="font-serif font-medium text-lg text-charcoal">
              Simple Preparation
            </h3>
            <p className="text-sm sm:text-sm text-muted-gray leading-relaxed">
              {kit.usage_instructions}
            </p>
          </div>

          <div className="p-6 bg-white rounded-sm border border-border-gray space-y-3">
            <span className="text-sm uppercase font-bold tracking-wider text-seedly-dark bg-seedly-light px-2.5 py-1 rounded-full inline-block">
              Proper Storage
            </span>
            <h3 className="font-serif font-medium text-lg text-charcoal">
              Protecting Freshness
            </h3>
            <p className="text-sm sm:text-sm text-muted-gray leading-relaxed">
              {kit.storage_instructions}
            </p>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="pt-8 border-t border-border-gray space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border-gray">
            <div>
              <h3 className="font-serif font-medium text-xl text-charcoal">Customer reviews</h3>
              <p className="text-sm text-muted-gray">
                {reviews.length > 0
                  ? `${reviews.length} review${reviews.length > 1 ? 's' : ''}`
                  : 'Be the first to leave a review for this kit.'}
              </p>
            </div>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-seedly-dark hover:bg-seedly-forest text-white rounded-sm text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="p-5 bg-white rounded-sm border border-border-gray space-y-4">
              <h5 className="font-serif font-medium text-sm text-charcoal">Review this kit</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="kit-review-name" className="block text-sm font-semibold text-charcoal uppercase tracking-wider mb-1">
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
                    className="w-full px-3 py-2 bg-cream/40 border border-border-gray rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-seedly-primary"
                  />
                </div>
                <div>
                  <label htmlFor="kit-review-rating" className="block text-sm font-semibold text-charcoal uppercase tracking-wider mb-1">
                    Rating
                  </label>
                  <select
                    id="kit-review-rating"
                    name="reviewRating"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-cream/40 border border-border-gray rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-seedly-primary"
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
                <label htmlFor="kit-review-title" className="block text-sm font-semibold text-charcoal uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  id="kit-review-title"
                  name="reviewTitle"
                  type="text"
                  placeholder="e.g. Beautiful packaging and easy to follow"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-cream/40 border border-border-gray rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-seedly-primary"
                />
              </div>
              <div>
                <label htmlFor="kit-review-body" className="block text-sm font-semibold text-charcoal uppercase tracking-wider mb-1">
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
                  className="w-full px-3 py-2 bg-cream/40 border border-border-gray rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-seedly-primary"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-border-gray rounded-sm text-sm text-muted-gray hover:text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-seedly-dark text-white rounded-sm text-sm font-semibold hover:bg-seedly-forest disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          {/* List */}
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 bg-white rounded-sm border border-border-gray space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal">{rev.customer_name}</span>
                    {rev.verified_purchase && (
                      <span className="text-sm bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-muted-gray text-sm">{formatDate(rev.created_at)}</span>
                </div>
                <div className="flex text-amber-500 text-sm">
                  {'★'.repeat(rev.rating)}
                  {'☆'.repeat(5 - rev.rating)}
                </div>
                {rev.title && <h5 className="font-bold text-sm text-charcoal">{rev.title}</h5>}
                <p className="text-sm text-muted-gray leading-relaxed">{rev.body}</p>
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
    </div>
  );
}
