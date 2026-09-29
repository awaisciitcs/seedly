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
  Calendar,
  CheckCircle2,
  Box,
  PenLine,
  X,
  AlertCircle,
  Bell,
  MessageCircle,
  Info,
  PackageCheck,
} from 'lucide-react';
import { NotifyMeModal } from './NotifyMeModal';
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
          'Thank you. Your review has been submitted for moderation and will appear once verified.'
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
      <nav className="flex items-center gap-2 text-xs text-muted-gray mb-8">
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
              <span className="absolute top-4 left-4 px-3 py-1 bg-seedly-dark text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-subtle">
                {kit.badge}
              </span>
            )}
          </div>

          {/* Contextual WhatsApp Consultation */}
          <div className="p-4 rounded-2xl bg-white border border-border-gray flex items-center justify-between gap-4 shadow-subtle">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-charcoal">Questions about how this routine works?</p>
              <p className="text-[11px] text-muted-gray">Chat with our team on WhatsApp for ingredients, preparation and storage guidance.</p>
            </div>
            <a
              href={`${siteConfig.contact.whatsappUrl}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-subtle"
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
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
                Curated Routine Box
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
                <span className="text-xs text-muted-gray font-medium">Seedly Box Set</span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal leading-tight">
              {kit.name}
            </h1>

            {/* Short descriptor */}
            <p className="text-sm sm:text-base text-muted-gray leading-relaxed">
              {kit.short_description}
            </p>

            {/* Price & Inventory State */}
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
                isLowStock ? (
                  <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium">
                    Low stock — only {currentStock} kits left
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

            {/* Dynamic Unit Price & Lasts About Indicator */}
            <div className="text-xs text-muted-gray pt-0.5">
              <span>
                {kit.slug === 'complete-cycle-kit'
                  ? '1,000g Net (4x 250g) · Rs. 285/100g · Lasts 2 full 28-day cycles (approx. 56 days)'
                  : kit.slug === 'follicular-blend'
                  ? '500g Net (2x 250g) · Rs. 310/100g · Lasts 2 follicular phases (approx. 28–35 servings)'
                  : '500g Net (2x 250g) · Rs. 258/100g · Lasts 2 luteal phases (approx. 28–35 servings)'}
              </span>
            </div>

            {/* Included Items in this Box */}
            <div className="p-5 bg-white rounded-2xl border border-border-gray shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-seedly-primary" />
                  <span>What's Included in This Box</span>
                </h4>
                <span className="text-[11px] text-muted-gray font-medium">
                  {kit.package_size}
                </span>
              </div>

              <div className="divide-y divide-border-gray/50 text-xs">
                {kit.items.map((item, idx) => (
                  <div key={item.id || idx} className="py-2.5 flex items-center justify-between">
                    <span className="font-medium text-charcoal">
                      {item.quantity}x {item.product_name}
                      {item.variant_name ? ` (${item.variant_name})` : ''}
                    </span>
                    <span className="text-muted-gray text-[11px]">
                      250g barrier pouch
                    </span>
                  </div>
                ))}
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-medium text-charcoal">
                    1x Engraved Wooden Measuring Scoop (1 tbsp)
                  </span>
                  <span className="text-muted-gray text-[11px]">
                    1 tbsp portion tool
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-medium text-charcoal">
                    1x 28-Day Cycle Tracking Calendar
                  </span>
                  <span className="text-muted-gray text-[11px]">
                    Printed guide
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border-gray/40 flex justify-between text-[11px] text-muted-gray">
                <span>Net seed weight:</span>
                <strong className="text-charcoal font-semibold">
                  {kit.slug === 'complete-cycle-kit' ? '1,000g (4x 250g)' : '500g (2x 250g)'}
                </strong>
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
                  className="w-full py-3.5 rounded-xl bg-seedly-light text-seedly-dark hover:bg-seedly-primary/20 border border-seedly-primary/30 font-semibold text-sm transition-all shadow-subtle flex items-center justify-center gap-2"
                >
                  <span>Buy now</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-amber-700" />
                    <span>Kit currently out of stock</span>
                  </p>
                  <p className="text-amber-800">
                    Fresh batches of the component seeds are being prepared. Leave your email to receive an alert when this kit is assembled again.
                  </p>
                </div>

                <button
                  onClick={() => setIsNotifyModalOpen(true)}
                  className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm bg-seedly-dark hover:bg-seedly-forest text-white transition-all shadow-card flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Notify Me When Kit Returns</span>
                </button>
              </div>
            )}

            {/* Consolidated Purchasing & Routine Briefing */}
            <div className="rounded-2xl border border-border-gray bg-cream/40 p-4 space-y-3 text-xs">
              <div className="flex items-start gap-2.5 text-charcoal">
                <Truck className="w-4 h-4 text-seedly-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Nationwide Delivery: </span>
                  <span className="text-muted-gray">
                    {kit.price_minor >= 250000 ? (
                      'FREE courier delivery included on this kit (TCS / Leopards).'
                    ) : (
                      <>
                        Rs. 200 flat delivery via TCS / Leopards (FREE on orders of Rs. 2,500 or more).{' '}
                        <span className="text-seedly-dark font-medium block mt-0.5">
                          Add Rs. {Math.round((250000 - kit.price_minor) / 100).toLocaleString()} more to your basket to unlock FREE delivery.
                        </span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-charcoal pt-2.5 border-t border-border-gray/60">
                <PackageCheck className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Packaging &amp; Freshness: </span>
                  <span className="text-muted-gray">
                    Dispatched fresh from our central Lahore hub. Each seed portion is individually sealed in an airtight, moisture-resistant kraft barrier pouch with a tamper-evident tear notch. 9-month pantry shelf life.
                  </span>
                </div>
              </div>

              {(kit.slug === 'luteal-blend' || kit.slug === 'complete-cycle-kit') && (
                <div className="flex items-start gap-2.5 text-amber-950 pt-2.5 border-t border-border-gray/60">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Allergen Notice: </span>
                    <span className="text-amber-900/90">
                      Contains Sesame Seeds. Packaged in a facility handling edible seeds and tree nuts.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5 text-charcoal pt-2.5 border-t border-border-gray/60">
                <CheckCircle2 className="w-4 h-4 text-seedly-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Daily Routine &amp; Storage: </span>
                  <span className="text-muted-gray">
                    {kit.slug === 'luteal-blend'
                      ? 'Take 1 tbsp sunflower + 1 tbsp sesame daily on Days 15–28. Keep sealed in a dry pantry.'
                      : kit.slug === 'follicular-blend'
                      ? 'Take 1 tbsp pumpkin + 1 tbsp golden flax daily on Days 1–14. Keep sealed in a cool, dark cupboard.'
                      : 'Eat 2 tbsp daily according to your phase calendar. Dispatched fresh from our Lahore hub.'}
                  </span>
                </div>
              </div>

              {/* Cycle Timing Note for irregular cycles */}
              <div className="flex items-start gap-2.5 text-charcoal pt-2.5 border-t border-border-gray/60">
                <Calendar className="w-4 h-4 text-muted-gray shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Cycle Timing &amp; Irregular Cycles: </span>
                  <span className="text-muted-gray">
                    Designed for standard 28-day rhythms. If your cycle is shorter, longer, or irregular, align your rotation with the lunar phases (New Moon to Full Moon for Follicular; Full Moon to New Moon for Luteal), or shift phases when ovulation occurs.
                  </span>
                </div>
              </div>
            </div>

            {/* Standard Dietary Disclaimer Box */}
            <div className="p-3.5 bg-warm-white rounded-xl border border-border-gray/70 text-[11px] text-muted-gray leading-relaxed flex items-start gap-2.5">
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
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            How this seed routine works
          </h2>
          <p className="text-sm sm:text-base text-muted-gray leading-relaxed">
            {kit.description}
          </p>
        </div>

        {/* 2-Step Routine Visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-border-gray shadow-subtle space-y-3">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full inline-block">
              Daily Usage
            </span>
            <h3 className="font-serif font-bold text-lg text-charcoal">
              Simple Preparation
            </h3>
            <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
              {kit.usage_instructions}
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-border-gray shadow-subtle space-y-3">
            <span className="text-xs uppercase font-bold tracking-wider text-seedly-dark bg-seedly-light px-2.5 py-1 rounded-full inline-block">
              Proper Storage
            </span>
            <h3 className="font-serif font-bold text-lg text-charcoal">
              Protecting Freshness
            </h3>
            <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
              {kit.storage_instructions}
            </p>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="pt-8 border-t border-border-gray space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border-gray">
            <div>
              <h3 className="font-serif font-bold text-xl text-charcoal">Verified Customer Reviews</h3>
              <p className="text-xs text-muted-gray">
                {reviews.length > 0
                  ? `${reviews.length} verified purchase${reviews.length > 1 ? 's' : ''}`
                  : 'Be the first to leave a review for this kit.'}
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

          {/* Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="p-5 bg-white rounded-2xl border border-border-gray space-y-4 shadow-subtle">
              <h5 className="font-serif font-bold text-sm text-charcoal">Review this kit</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="kit-review-name" className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
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
                    className="w-full px-3 py-2 bg-cream/40 border border-border-gray rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-seedly-primary"
                  />
                </div>
                <div>
                  <label htmlFor="kit-review-rating" className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                    Rating
                  </label>
                  <select
                    id="kit-review-rating"
                    name="reviewRating"
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
                <label htmlFor="kit-review-title" className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  id="kit-review-title"
                  name="reviewTitle"
                  type="text"
                  placeholder="e.g. Beautiful packaging and easy to follow"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-cream/40 border border-border-gray rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-seedly-primary"
                />
              </div>
              <div>
                <label htmlFor="kit-review-body" className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
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
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          {/* List */}
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 bg-white rounded-2xl border border-border-gray space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal">{rev.customer_name}</span>
                    {rev.verified_purchase && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                        Verified Purchase
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
