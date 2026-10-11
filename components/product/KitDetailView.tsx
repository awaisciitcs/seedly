'use client';
import { useSiteContent } from '@/components/storefront/SiteContentProvider';
import type { CmsPageContent, SiteContent } from '@/lib/cms/storefront-types';

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
import { ProductGallery } from './ProductGallery';
import { DeliveryNote } from '@/components/storefront/DeliveryNote';
import { toCartItem } from '@/lib/catalog';
import { useProductReviews } from '@/hooks/useProductReviews';

interface KitDetailViewProps {
  kit: Kit;
}

export function KitDetailView({ kit }: KitDetailViewProps) {
  const cms = useSiteContent<CmsPageContent>('product'); const { copy, links, images } = cms;
const {config:siteConfig,features}=useSiteContent<SiteContent>('site');

  const router = useRouter();
  const { addItem, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const mainActionsRef = React.useRef<HTMLDivElement>(null);

  // Reviews State
  const { reviews, loading: loadingReviews, error: reviewsLoadError, retry: retryReviews } = useProductReviews(kit.id);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState('');
  const [reviewErrorMessage, setReviewErrorMessage] = useState('');

  // Review form fields
  const [reviewRating, setReviewRating] = useState(5);
  const [customerName, setCustomerName] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingReview) return;
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
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          product_id: kit.id,
          product_name: kit.name,
          customer_name: customerName,
          rating: reviewRating,
          title: reviewTitle || 'Customer feedback',
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

  const handleAddToCart = () => { if (!inStock) { setIsNotifyModalOpen(true); return false; } const success = addItem(toCartItem(kit, quantity)); if(success) {setAdded(true);setTimeout(()=>setAdded(false),1500);} return success; };
  const handleBuyNow = () => { if (!inStock) { setIsNotifyModalOpen(true); return; } if(addItem(toCartItem(kit, quantity), {openDrawer:false})){ setIsCartOpen(false); router.push("/checkout"); } };

  const waMessage = encodeURIComponent(`Hi Seedly, I have a question about the ${kit.name}.`);

  return (
    <div className="product-detail-page max-w-7xl mx-auto w-full px-5 md:px-8 pt-4 pb-8 sm:pb-12 bg-white text-neutral-900">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-stone-600 mb-8">
        <Link href={links.href} className="hover:text-black transition-colors">{copy.text_home}</Link>
        <span>/</span>
        <Link href={links.href_kits} className="capitalize hover:text-black transition-colors">{copy.text_curated_seed_kits}</Link>
        <span>/</span>
        <span className="text-neutral-900 truncate font-semibold">{kit.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="product-purchase-hero grid grid-cols-1 lg:grid-cols-2 gap-y-6 lg:gap-x-12 items-start">
        {/* Left Column: Kit Imagery */}
        <div className="product-detail-gallery w-full">
          <ProductGallery name={kit.name} image={kit.image_url} images={kit.gallery_images} />

        </div>

        {/* Right Column: Controls & Info */}
        <div className="lg:row-span-2">
          <div className="space-y-3">
            {/* Header / Social Proof */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-stone-100 text-stone-700 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                {copy.text_14_28_day_routine_kit}</span>

              {features.reviews && reviews.length > 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-800">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500 stroke-1" />
                  </div>
                  <span className="font-semibold text-neutral-900">{(reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)}</span>
                  <span className="text-stone-600">({reviews.length} {copy.text_reviews}</span>
                </div>
              ) : null}
            </div>

            {/* Title */}
            <h1 className="font-heading font-medium text-2xl sm:text-4xl text-neutral-900 leading-tight tracking-tight">
              {kit.name}
            </h1>
            {features.reviews && (<a href={links.href_reviews} className="inline-flex text-sm underline underline-offset-4">{kit.review_count ? kit.rating?.toFixed(1) + " / 5 · " + kit.review_count + " reviews" : "Read or write a review"}</a>)}

            {/* Price & Inventory State */}
            <div className="flex flex-wrap items-baseline gap-3 pt-1">
              <span className="font-heading font-semibold text-3xl sm:text-4xl text-neutral-900 tabular-nums">
                {formatPKR(kit.price_minor)}
              </span>
              {kit.compare_price_minor && (
                <span className="text-base text-stone-600 line-through tabular-nums font-normal">
                  {formatPKR(kit.compare_price_minor)}
                </span>
              )}
              {inStock ? (
                isLowStock ? (
                  <span className="text-[11px] font-medium uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full">
                    {copy.text_low_stock}{currentStock} {copy.text_kits_left}</span>
                ) : (
                  <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                    {copy.text_in_stock_in_lahore}</span>
                )
              ) : (
                <span className="text-[11px] font-medium uppercase tracking-wider text-rose-800 bg-rose-50 border border-rose-200 px-3 py-0.5 rounded-full flex items-center gap-1">
                  <Bell className="w-3 h-3 text-rose-700" />
                  <span>{copy.text_out_of_stock}</span>
                </span>
              )}
            </div>

            {/* In Stock vs Out of Stock Action Controls */}
            <div ref={mainActionsRef} className="product-purchase-actions rounded-2xl border border-[#E3E9DE] bg-[#F7FAF5] p-3 sm:p-4">
              {inStock ? (
                <PurchaseActions
                  added={added}
                  quantity={quantity}
                  maxQuantity={currentStock}

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
                      <span>{copy.text_kit_currently_out_of_stock}</span>
                    </p>
                    <p className="text-stone-600 font-normal">
                      {copy.text_leave_your_email_and_we_will_let_you_know_when_this_kit}</p>
                  </div>

                  <button
                    type="button"
                    data-primary-purchase
                    onClick={() => setIsNotifyModalOpen(true)}
                    className="h-12 sm:h-13 w-full rounded-full font-semibold text-xs sm:text-sm uppercase tracking-wider bg-neutral-900 hover:bg-black text-white shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    <span>{copy.text_notify_me_when_kit_returns}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Short descriptor */}
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              {kit.short_description}
            </p>

            <DeliveryNote />

              <div className="flex items-center gap-2 py-2.5 px-4 bg-[#FBFBFA] border border-gray-200/90 rounded-full text-xs font-normal text-stone-600 shadow-xs">
                <Truck className="h-4 w-4 text-neutral-700" aria-hidden="true" />
                <span>
                  <strong className="text-neutral-900 font-semibold">{copy.text_flat_rs_200_delivery}</strong> · <strong className="text-neutral-900 font-semibold">{copy.text_free}</strong> {copy.text_over_rs_2_500_dispatched_in_24h_from_lahore}</span>
              </div>

            {/* Bundle Savings & Serving Duration Breakdown */}
            {kit.slug === 'complete-cycle-kit' && (
              <div className="rounded-xl border border-stone-200 bg-[#FBFBFA] p-3 text-xs text-stone-600 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-neutral-900 font-semibold">
                  <span>{copy.text_ritual_bundle_value}</span>
                  <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">{copy.text_save_rs_470}</span>
                </div>
                <p>{copy.text_4_x_250g_fresh_pouches_rs_2_970_individual_seed_value}</p>
                <p>{copy.text_engraved_wooden_measuring_scoop_printed_cycle_calendar}</p>
                <p className="text-[11px] text-stone-500 pt-0.5">
                  {copy.text_standalone_total_rs_3_320_at_1_tbsp_day_this_kit_suppli}<strong>{copy.text_50_60_daily_servings_approx_two_28_day_cycles}</strong>.
                </p>
              </div>
            )}

            <KitContentsExplorer items={kit.items} kitSlug={kit.slug} />

            <div className="border-t border-gray-100 pt-5 space-y-2 text-xs font-normal leading-5 text-stone-500">
              <p>{copy.text_delivery_across_pakistan}<Link href={links.href_shipping} className="underline underline-offset-4 text-neutral-800 hover:text-black">{copy.text_see_delivery_times_and_charges}</Link>.</p>
              <p>{copy.text_check_each_pack_for_storage_instructions_and_its_best_b}</p>
              {(kit.slug === 'luteal-blend' || kit.slug === 'complete-cycle-kit') && (
                <p className="text-amber-900">{siteConfig.disclaimer.sesame}</p>
              )}
            </div>

            {/* Standard Dietary Disclaimer Box */}
            <div className="p-4 bg-[#FBFBFA] rounded-2xl border border-gray-200/90 text-xs text-stone-500 leading-relaxed flex items-start gap-2.5 shadow-xs">
              <Info className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 font-semibold uppercase tracking-wider block mb-1">{copy.text_dietary_food_notice_2}</strong>
                {siteConfig.disclaimer.standard}
              </div>
            </div>
          </div>
        </div>

          {/* Contextual WhatsApp Consultation */}
          <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-gray-200/90 shadow-xs flex flex-col items-start sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-900">{copy.text_questions_about_how_this_routine_works}</p>
              <p className="text-xs text-stone-500 font-normal">{copy.text_chat_with_our_team_on_whatsapp_for_ingredients_preparat}</p>
            </div>
            {features.whatsapp&&(<a
              href={`${siteConfig.contact.whatsappUrl}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-white border border-gray-200 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold uppercase tracking-wider shadow-xs shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-neutral-700" />
              <span>{copy.text_ask_on_whatsapp}</span>
            </a>)}
          </div>
      </div>

      {/* Routine Dossier Breakdown */}
      <div className="mt-16 sm:mt-24 pt-10 border-t border-gray-200 space-y-10">
        <div className="max-w-3xl space-y-3">
          <h2 className="font-heading font-medium text-2xl sm:text-3xl text-neutral-900">
            {copy.text_how_this_seed_routine_works}</h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
            {kit.description}
          </p>
        </div>

        {/* 2-Step Routine Visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-[#FBFBFA] rounded-2xl border border-gray-200/90 space-y-3 shadow-xs">
            <span className="text-[11px] uppercase font-semibold tracking-wider text-neutral-800 bg-stone-200/80 px-2.5 py-0.5 rounded-full inline-block">
              {copy.text_daily_usage}</span>
            <h3 className="font-heading font-medium text-lg text-neutral-900">
              {copy.text_simple_preparation}</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              {kit.usage_instructions}
            </p>
          </div>

          <div className="p-6 bg-[#FBFBFA] rounded-2xl border border-gray-200/90 space-y-3 shadow-xs">
            <span className="text-[11px] uppercase font-semibold tracking-wider text-neutral-800 bg-stone-200/80 px-2.5 py-0.5 rounded-full inline-block">
              {copy.text_proper_storage}</span>
            <h3 className="font-heading font-medium text-lg text-neutral-900">
              {copy.text_protecting_freshness}</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              {kit.storage_instructions}
            </p>
          </div>
        </div>

        {/* Customer Reviews Section */}
        {features.reviews && (<div id="reviews" className="pt-8 border-t border-gray-200 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <h3 className="font-heading font-medium text-xl text-neutral-900">{copy.text_customer_reviews}</h3>
              <p className="text-xs sm:text-sm text-stone-500 font-normal mt-0.5">
                {loadingReviews ? 'Loading reviews…' : reviewsLoadError ? 'Reviews are temporarily unavailable.' : reviews.length > 0
                  ? `${reviews.length} review${reviews.length > 1 ? 's' : ''}`
                  : 'Be the first to leave a review for this kit.'}
              </p>
            </div>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>{copy.text_write_a_review_2}</span>
            </button>
          </div>

          {reviewsLoadError && <p role="alert" className="text-sm text-rose-700">{reviewsLoadError} <button type="button" className="min-h-11 underline" onClick={retryReviews}>{copy.text_retry}</button></p>}
          {reviewSuccessMessage && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{reviewSuccessMessage}</p>}
          {reviewErrorMessage && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{reviewErrorMessage}</p>}

          {/* Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="p-6 bg-[#FBFBFA] rounded-2xl border border-gray-200 space-y-4">
              <h5 className="font-heading font-medium text-sm text-neutral-900">{copy.text_review_this_kit}</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="kit-review-name" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    {copy.text_your_name}</label>
                  <input
                    id="kit-review-name"
                    name="customerName"
                    type="text"
                    required
                    placeholder={copy.placeholder_e_g_zainab_m_karachi}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label htmlFor="kit-review-rating" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    {copy.text_rating}</label>
                  <select
                    id="kit-review-rating"
                    name="reviewRating"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                  >
                    <option value={5}>{copy.text_5_excellent}</option>
                    <option value={4}>{copy.text_4_good}</option>
                    <option value={3}>{copy.text_3_average}</option>
                    <option value={2}>{copy.text_2_poor}</option>
                    <option value={1}>{copy.text_1_very_bad}</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="kit-review-title" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  {copy.text_title}</label>
                <input
                  id="kit-review-title"
                  name="reviewTitle"
                  type="text"
                  placeholder={copy.placeholder_e_g_beautiful_packaging_and_easy_to_follow}
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>
              <div>
                <label htmlFor="kit-review-body" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  {copy.text_review_details}</label>
                <textarea
                  id="kit-review-body"
                  name="reviewBody"
                  required
                  rows={3}
                  placeholder={copy.placeholder_how_was_the_experience_taste_and_daily_convenience}
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
                  {copy.text_cancel}</button>
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
                        {copy.text_verified_purchase}</span>
                    )}
                  </div>
                  <span className="text-stone-600 text-xs">{formatDate(rev.created_at)}</span>
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
        </div>)}
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
