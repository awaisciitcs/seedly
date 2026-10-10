'use client';
import { useSiteContent } from '@/components/storefront/SiteContentProvider';
import { ManagedSection } from '@/components/storefront/ManagedSections';
import type { CmsPageContent, SiteContent } from '@/lib/cms/storefront-types';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, Review } from '../../lib/types';
import { formatPrice, formatDate, toSentenceCase } from '../../lib/utils';
import { useCart } from '../../lib/store/cart';
import { useWishlist } from '../../lib/store/wishlist';
import { Star, Leaf, Clock, Coffee, CheckCircle2, PenLine, AlertCircle, Bell, MessageCircle, Thermometer, ChevronDown, ChevronRight, Truck, Check } from 'lucide-react';
import { NotifyMeModal } from './NotifyMeModal';
import { ProductCard } from './ProductCard';
import { PurchaseActions } from './PurchaseActions';
import { StickyPurchaseBar } from './StickyPurchaseBar';
import { TeaBrewCalculator } from './TeaBrewCalculator';
import { ProductGallery } from './ProductGallery';
import { DeliveryNote } from '@/components/storefront/DeliveryNote';
import { toCartItem } from '@/lib/catalog';
import { activeCatalogVariants, resolveCatalogVariant } from '@/lib/catalog-filters';
import { useProductReviews } from '@/hooks/useProductReviews';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts?: Product[];
  initialVariantId?: string;
}

export function ProductDetailView({ product, relatedProducts = [], initialVariantId }: ProductDetailViewProps) {
  const cms = useSiteContent<CmsPageContent>('product'); const { copy, links, images } = cms;
const {config:siteConfig,features}=useSiteContent<SiteContent>('site');

  const router = useRouter();
  const { addItem, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const activeVariants = activeCatalogVariants(product);
  const [selectedVariantId, setSelectedVariantId] = useState(resolveCatalogVariant(product,initialVariantId)?.id);
  const selectedVariant = resolveCatalogVariant(product,selectedVariantId);
  useEffect(()=>{setSelectedVariantId(resolveCatalogVariant(product,initialVariantId)?.id);setQuantity(1);},[product.id,initialVariantId]);
  const [quantity, setQuantity] = useState(1);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    details: true,
    usage: false,
    storage: false,
    faqs: false,
    nutritionMobile: false,
  });
  const [added, setAdded] = useState(false);
  const mainActionsRef = React.useRef<HTMLDivElement>(null);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const priceMinor = selectedVariant ? selectedVariant.price_minor : product.price_minor;
  const comparePriceMinor = selectedVariant
    ? selectedVariant.compare_price_minor
    : product.compare_price_minor;
  const currentStock = selectedVariant?.inventory_quantity ?? 0;
  const inStock = currentStock > 0;
  const isLowStock = inStock && currentStock <= 5;
  const wishlisted = isInWishlist(product.id);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);

  // Reviews State
  const { reviews, loading: loadingReviews, error: reviewsLoadError, retry: retryReviews } = useProductReviews(product.id);
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
      setReviewErrorMessage('Please provide your name and review.');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name,
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

  const handleAddToCart = () => { if (!inStock) { setIsNotifyModalOpen(true); return false; } const success = addItem(toCartItem(product, quantity, selectedVariant)); if(success) {setAdded(true);setTimeout(()=>setAdded(false),1500);} return success; };
  const handleBuyNow = () => { if (!inStock) { setIsNotifyModalOpen(true); return; } if(addItem(toCartItem(product, quantity, selectedVariant), {openDrawer:false})){ setIsCartOpen(false); router.push("/checkout"); } };

  const waMessage = encodeURIComponent(`Hi Seedly, I have a question about ${product.name}.`);

  // Category mapping matching top nav labels
  const categoryNavLabel = product.product_type === 'tea' ? 'Teas' : 'Seeds';
  const categoryNavHref = product.product_type === 'tea' ? '/teas' : '/seeds';
  const productSentenceTitle = toSentenceCase(product.name);

  // Extract origin and nutrition rows
  const nutritionRaw = product.nutrition_information || {};
  const originValue = (nutritionRaw as any).origin || 'Pakistan';
  const nutritionEntries = Object.entries(nutritionRaw).filter(
    ([key]) => key.toLowerCase() !== 'origin'
  );

  return (
    <div className="bg-white text-neutral-900">
      {/* 0. BREADCRUMB & HERO */}
      <div className="max-w-7xl mx-auto w-full px-5 md:px-8 pt-4 pb-12 md:pb-16">

        {/* Breadcrumb: sentence case, matching top nav labels */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-600 mb-6 sm:mb-8 font-normal">
          <Link href={links.href} className="hover:text-black transition-colors">{copy.text_home}</Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-600 rtl:rotate-180 shrink-0" aria-hidden="true" />
          <Link href={categoryNavHref} className="hover:text-black transition-colors">
            {categoryNavLabel}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-600 rtl:rotate-180 shrink-0" aria-hidden="true" />
          <span className="text-neutral-900 truncate font-medium" aria-current="page">
            {productSentenceTitle}
          </span>
        </nav>

        {/* Hero: TwoCol (grid-cols-1 lg:grid-cols-2 lg:gap-x-12 gap-y-10 items-start) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12 gap-y-10 items-start">

          {/* Left Hero Column: Square gallery image + column-width WhatsApp help card */}
          <div className="w-full space-y-4">
            <ProductGallery name={product.name} image={product.image_url} images={product.gallery_images} />

            {/* Contextual WhatsApp Help Card: exactly column width */}
            <div className="w-full rounded-xl border border-stone-200 bg-[#FBFBFA] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5 text-start">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                  {copy.text_questions_about_this_product}</p>
                <p className="text-xs text-stone-600 font-normal">
                  {copy.text_ask_our_team_about_ingredients_preparation_or_storage}</p>
              </div>
              {features.whatsapp&&(<a
                href={`${siteConfig.contact.whatsappUrl}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-neutral-800 text-xs font-semibold uppercase tracking-wider px-4 py-2 shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <MessageCircle className="w-3.5 h-3.5 text-neutral-700" />
                <span>{copy.text_ask_on_whatsapp}</span>
              </a>)}
            </div>
          </div>

          {/* Right Hero Column: Steady 16/24px rhythm matching left column height within ~24px */}
          <div className="flex flex-col space-y-4 text-start">

            {/* 1. Category Tag */}
            <div>
              <span className="rounded-full bg-stone-100 text-stone-700 px-3 py-1 text-xs font-semibold uppercase tracking-wider inline-block">
                {product.slug === 'chamomile-tea'
                  ? 'Whole Flower Tisane'
                  : product.slug === 'spearmint-tea'
                  ? 'Mountain Leaf Tisane'
                  : product.slug === 'green-tea'
                  ? 'Highland Green Tea'
                  : product.slug === 'flax-seeds'
                  ? 'Cold-Milled Golden Flax'
                  : product.product_type === 'tea'
                  ? 'Tea'
                  : 'Raw Whole Seeds'}
              </span>
            </div>

            {/* 2. H1 */}
            <h1 className="font-heading font-medium text-3xl sm:text-4xl text-neutral-900 tracking-tight leading-tight">
              {productSentenceTitle}
            </h1>
            {features.reviews && (<a href={links.href_reviews} className="inline-flex text-sm underline underline-offset-4">{product.review_count ? product.rating?.toFixed(1) + " / 5 · " + product.review_count + " reviews" : "Read or write a review"}</a>)}
            <DeliveryNote />

            {/* 3. Description */}
            <p className="text-sm text-stone-600 leading-relaxed font-normal">
              {product.short_description}
            </p>

            {/* 4. Price Row + Stock Pill */}
            <div className="flex items-baseline gap-3 pt-1">
              <span key={priceMinor} className="font-heading font-semibold text-2xl sm:text-3xl text-neutral-900 tabular-nums">
                {formatPrice(priceMinor)}
              </span>
              {comparePriceMinor && (
                <span key={comparePriceMinor} className="text-sm text-stone-500 line-through tabular-nums font-normal">
                  {formatPrice(comparePriceMinor)}
                </span>
              )}
              {inStock ? (
                isLowStock ? (
                  <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-xs font-medium">
                    {copy.text_low_stock}{currentStock} {copy.text_left}</span>
                ) : (
                  <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium">
                    {copy.text_in_stock}</span>
                )
              ) : (
                <span className="rounded-full bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 text-xs font-medium flex items-center gap-1">
                  <Bell className="w-3 h-3 text-rose-700" />
                  <span>{copy.text_out_of_stock}</span>
                </span>
              )}
            </div>

            {/* 5. Per-100g Line (updates with selected size) */}
            {selectedVariant && selectedVariant.weight_grams > 0 ? (
              <p className="text-xs text-stone-600 font-normal">
                {formatPrice(Math.round(priceMinor * 100 / selectedVariant.weight_grams))} {copy.text_per_100g}</p>
            ) : null}

            {/* 6. Pack-size Selector (grid-cols-3, equal tiles, no 'Selected: ...' text) */}
            {activeVariants.length > 1 && (
              <div className="pt-1">
                <div className="grid grid-cols-3 gap-2.5">
                  {activeVariants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const vInStock = (v.inventory_quantity ?? 0) > 0;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => { setSelectedVariantId(v.id); setQuantity(1); }}
                        aria-pressed={isSelected}
                        className={`rounded-xl border p-3 text-center sm:text-start transition-all cursor-pointer shadow-xs min-h-[64px] flex flex-col justify-center ${
                          isSelected
                            ? 'border-seedly-dark bg-seedly-dark text-white'
                            : 'border-stone-200 bg-white text-stone-900 hover:border-stone-400'
                        }`}
                      >
                        <span className="text-sm sm:text-base font-semibold tracking-tight">{v.option_value}</span>
                        <span className={`text-sm tabular-nums mt-1 ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                          {formatPrice(v.price_minor)}
                        </span>
                        {!vInStock && (
                          <span className={`text-[9px] font-semibold uppercase mt-0.5 ${
                            isSelected ? 'text-stone-300' : 'text-rose-600'
                          }`}>
                            {copy.text_sold_out}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7. Delivery Strip */}
            <div className="rounded-xl border border-stone-200 bg-[#FBFBFA] p-3 text-xs text-stone-600 flex items-center gap-2 shadow-xs">
              <Truck className="h-4 w-4 text-neutral-700 shrink-0" aria-hidden="true" />
              <span>
                {copy.text_delivery_charges_are_confirmed_in_your_basket_see_deliv}</span>
            </div>

            {/* 8 & 9. CTA Row (Stepper, Add to cart flex-1, Wishlist; all h-12) & Buy now (full width h-12) */}
            <div ref={mainActionsRef} className="pt-1">
              {inStock ? (
                <PurchaseActions
                  added={added}
                  quantity={quantity}
                  maxQuantity={currentStock}

                  wishlisted={wishlisted}
                  onQuantityChange={setQuantity}
                  onAdd={handleAddToCart}
                  onBuy={handleBuyNow}
                  onWishlist={() => toggleWishlist(product.id)}
                />
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
                    <p className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-amber-700" />
                      <span>{copy.text_currently_out_of_stock}</span>
                    </p>
                    <p className="text-stone-600 font-normal">
                      {copy.text_leave_your_email_and_we_will_let_you_know_when_this_fre}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsNotifyModalOpen(true)}
                    className="h-12 w-full rounded-full font-semibold text-xs sm:text-sm uppercase tracking-wider bg-black hover:bg-neutral-800 text-white shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    <span>{copy.text_notify_me_when_available}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 10. One fine-print row */}
            <div className="pt-2 text-xs text-stone-600 flex items-center gap-2 flex-wrap font-normal">
              <Link href={links.href_shipping} className="hover:text-black underline underline-offset-4">
                {copy.text_delivery_times_charges}</Link>
              <span>·</span>
              <Link href={links.href_returns} className="hover:text-black underline underline-offset-4">
                {copy.text_replacement_policy}</Link>
            </div>

            {/* 11. One muted line linking to #dietary-notice */}
            <p className="text-xs text-stone-600 font-normal">
              {copy.text_culinary_food_item_not_a_medicine}{' '}
              <a href={links.href_dietary_notice} className="underline underline-offset-4 hover:text-black">
                {copy.text_dietary_notice}</a>
            </p>
          </div>
        </div>
      </div>

      {/* 3. PRODUCT INFORMATION (Section, SectionTitle, then TwoCol) */}
      <ManagedSection document="product" sectionId="productdetailview_section_01"><section className="border-t border-stone-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8">
          <h2 className="text-2xl font-medium tracking-tight mb-8 text-neutral-900">
            {copy.text_product_information}</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12 gap-y-10 items-start">

            {/* Left Column: Accordions with identical py-4 and chevrons on column right edge */}
            <div className="border-t border-stone-200 divide-y divide-stone-200">

              {/* Accordion 1: Ingredients & details (open by default) */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('details')}
                  aria-expanded={openSections.details}
                  aria-controls="accordion-details"
                  className="flex w-full items-center justify-between py-4 text-start text-base sm:text-lg font-medium text-neutral-900 hover:text-black transition-colors cursor-pointer"
                >
                  <span>{copy.text_ingredients_details}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-stone-500 transition-transform duration-200 ease-out ms-auto rtl:rotate-180 ${
                      openSections.details ? 'rotate-180 text-black' : 'rotate-0'
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id="accordion-details"
                  role="region"
                  className="accordion-grid"
                  data-open={openSections.details}
                >
                  <div className="accordion-inner">
                    <div className="pb-6 pt-1 text-sm leading-relaxed text-stone-600 space-y-4 font-normal">
                      <p>{product.description}</p>

                      {/* dl grid-cols-[8rem_1fr] gap-y-3: Ingredients, Origin, Pack size, Product code */}
                      <dl className="grid grid-cols-[8rem_1fr] gap-y-3 pt-3 border-t border-stone-100 text-sm">
                        <dt className="text-stone-600 font-medium">{copy.text_ingredients}</dt>
                        <dd className="text-neutral-900">{product.ingredients}</dd>

                        <dt className="text-stone-600 font-medium">{copy.text_origin}</dt>
                        <dd className="text-neutral-900">{originValue}</dd>

                        <dt className="text-stone-600 font-medium">{copy.text_pack_size}</dt>
                        <dd className="text-neutral-900">{selectedVariant?.option_value || (product.weight_grams ? `${product.weight_grams}g pouch` : '250g pouch')}</dd>

                        <dt className="text-stone-600 font-medium">{copy.text_product_code}</dt>
                        <dd className="font-mono text-neutral-900 text-xs sm:text-sm">{selectedVariant?.sku || product.sku || 'SED-FLX-01'}</dd>
                      </dl>

                      {product.slug === 'chamomile-tea' && (
                        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                          <strong>{siteConfig.disclaimer.chamomile}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Accordion 2: How to use / brew */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('usage')}
                  aria-expanded={openSections.usage}
                  aria-controls="accordion-usage"
                  className="flex w-full items-center justify-between py-4 text-start text-base sm:text-lg font-medium text-neutral-900 hover:text-black transition-colors cursor-pointer"
                >
                  <span>{product.product_type === 'tea' ? 'How to brew' : 'How to use'}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-stone-500 transition-transform duration-200 ease-out ms-auto rtl:rotate-180 ${
                      openSections.usage ? 'rotate-180 text-black' : 'rotate-0'
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id="accordion-usage"
                  role="region"
                  className="accordion-grid"
                  data-open={openSections.usage}
                >
                  <div className="accordion-inner">
                    <div className="pb-6 pt-1 text-sm leading-relaxed text-stone-600 space-y-4 font-normal">
                      <p>{product.usage_instructions}</p>
                      {product.product_type === 'tea' && (
                        <TeaBrewCalculator
                          teaName={product.name}
                          slug={product.slug}
                          steepTime={product.steep_time}
                          waterTemp={product.water_temp}
                          caffeineLevel={product.caffeine_level}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Accordion 3: Keeping it fresh & storage */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('storage')}
                  aria-expanded={openSections.storage}
                  aria-controls="accordion-storage"
                  className="flex w-full items-center justify-between py-4 text-start text-base sm:text-lg font-medium text-neutral-900 hover:text-black transition-colors cursor-pointer"
                >
                  <span>{copy.text_keeping_it_fresh_storage}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-stone-500 transition-transform duration-200 ease-out ms-auto rtl:rotate-180 ${
                      openSections.storage ? 'rotate-180 text-black' : 'rotate-0'
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id="accordion-storage"
                  role="region"
                  className="accordion-grid"
                  data-open={openSections.storage}
                >
                  <div className="accordion-inner">
                    <div className="pb-6 pt-1 text-sm leading-relaxed text-stone-600 space-y-3 font-normal">
                      <p>{product.storage_instructions}</p>
                      <p>{copy.text_check_your_pack_for_its_best_before_date_and_reseal_it}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accordion 4: Common questions */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('faqs')}
                  aria-expanded={openSections.faqs}
                  aria-controls="accordion-faqs"
                  className="flex w-full items-center justify-between py-4 text-start text-base sm:text-lg font-medium text-neutral-900 hover:text-black transition-colors cursor-pointer"
                >
                  <span>{copy.text_common_questions}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-stone-500 transition-transform duration-200 ease-out ms-auto rtl:rotate-180 ${
                      openSections.faqs ? 'rotate-180 text-black' : 'rotate-0'
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id="accordion-faqs"
                  role="region"
                  className="accordion-grid"
                  data-open={openSections.faqs}
                >
                  <div className="accordion-inner">
                    <div className="pb-6 pt-1 text-sm leading-relaxed divide-y divide-stone-100 font-normal">
                      {product.product_type === 'tea' && product.caffeine_level && (
                        <div className="pb-4">
                          <h4 className="text-sm sm:text-base font-medium text-neutral-900">{copy.text_does_it_contain_caffeine}</h4>
                          <p className="mt-1 text-stone-600">{copy.text_caffeine_level}{product.caffeine_level}.</p>
                        </div>
                      )}
                      <div className="py-4">
                        <h4 className="text-sm sm:text-base font-medium text-neutral-900">{copy.text_which_pack_sizes_are_available}</h4>
                        <p className="mt-1 text-stone-600">
                          {activeVariants.map((v) => v.option_value).join(', ') || 'See product label.'}
                        </p>
                      </div>
                      <div className="py-4">
                        <h4 className="text-sm sm:text-base font-medium text-neutral-900">{copy.text_when_will_my_order_arrive}</h4>
                        <p className="mt-1 text-stone-600">
                          {copy.text_timings_depend_on_your_delivery_address}<Link href={links.href_shipping} className="underline underline-offset-4 text-neutral-900">{copy.text_see_our_delivery_estimates}</Link>.
                        </p>
                      </div>
                      <div className="pt-4">
                        <h4 className="text-sm sm:text-base font-medium text-neutral-900">{copy.text_have_another_question}</h4>
                        <p className="mt-1 text-stone-600">
                          <Link href={links.href_contact} className="underline underline-offset-4 text-neutral-900">{copy.text_contact_the_seedly_team}</Link> {copy.text_for_help_with_this_product_or_your_order}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile-only Accordion row for Nutrition (<lg) */}
              {nutritionEntries.length > 0 && (
                <div className="block lg:hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('nutritionMobile')}
                    aria-expanded={openSections.nutritionMobile}
                    aria-controls="accordion-nutrition-mobile"
                    className="flex w-full items-center justify-between py-4 text-start text-base sm:text-lg font-medium text-neutral-900 hover:text-black transition-colors cursor-pointer"
                  >
                    <span>{copy.text_nutrition_per_28g_typical_values}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-stone-500 transition-transform duration-200 ease-out ms-auto rtl:rotate-180 ${
                        openSections.nutritionMobile ? 'rotate-180 text-black' : 'rotate-0'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    id="accordion-nutrition-mobile"
                    role="region"
                    className="accordion-grid"
                    data-open={openSections.nutritionMobile}
                  >
                    <div className="accordion-inner">
                      <div className="pb-6 pt-1">
                        <div className="rounded-xl border border-stone-200 bg-[#FBFBFA] p-4 shadow-xs">
                          <table className="w-full text-sm">
                            <tbody className="divide-y divide-stone-200">
                              {nutritionEntries.map(([key, val]) => (
                                <tr key={key} className="py-2.5 flex items-center justify-between">
                                  <td className="text-stone-600 py-1.5 capitalize font-normal">
                                    {key.replace('_', ' ')}
                                  </td>
                                  <td className="text-end font-medium text-neutral-900 py-1.5 tabular-nums">
                                    {String(val)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Nutrition Card (Desktop sticky lg:top-24 self-start) */}
            <div className="hidden lg:block lg:sticky lg:top-24 self-start w-full">
              {nutritionEntries.length > 0 && (
                <div className="rounded-xl border border-stone-200 bg-[#FBFBFA] p-6 shadow-xs">
                  <h3 className="text-base font-semibold text-neutral-900 mb-4 tracking-tight">
                    {copy.text_nutrition_per_28g_typical_values}</h3>
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-stone-200">
                      {nutritionEntries.map(([key, val]) => (
                        <tr key={key} className="py-2.5 flex items-center justify-between">
                          <td className="text-stone-600 py-2 capitalize font-normal">
                            {key.replace('_', ' ')}
                          </td>
                          <td className="text-end font-medium text-neutral-900 py-2 tabular-nums">
                            {String(val)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Full-width Relocated Dietary Food Notice */}
          <div
            id="dietary-notice"
            className="rounded-xl border border-stone-200 bg-[#FBFBFA] p-5 sm:p-6 mt-10 text-xs text-stone-600 leading-relaxed shadow-xs text-start scroll-mt-24"
          >
            <strong className="text-neutral-900 font-semibold uppercase tracking-wider block mb-1">
              {copy.text_dietary_food_notice}</strong>
            {siteConfig.disclaimer.standard}
          </div>
        </div>
      </section></ManagedSection>

      {/* 4. REVIEWS */}
      <ManagedSection document="product" sectionId="productdetailview_section_02">{features.reviews && (<section id="reviews" className="border-t border-stone-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="text-start">
              <h2 className="text-2xl font-medium tracking-tight text-neutral-900">
                {copy.text_customer_reviews}</h2>
              <p className="text-xs sm:text-sm text-stone-600 font-normal mt-1">
                {loadingReviews ? 'Loading reviews…' : reviewsLoadError ? 'Reviews are temporarily unavailable.' : reviews.length > 0
                  ? `${reviews.length} review${reviews.length > 1 ? 's' : ''}`
                  : 'Be the first to share your experience.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="rounded-full border border-black bg-white hover:bg-black hover:text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <span className="flex items-center gap-1.5">
                <PenLine className="w-3.5 h-3.5" />
                <span>{copy.text_write_a_review}</span>
              </span>
            </button>
          </div>

          {/* Success / Error Messages */}
          {reviewsLoadError && <p role="alert" className="mb-5 text-sm text-rose-700">{reviewsLoadError} <button type="button" className="min-h-11 underline" onClick={retryReviews}>{copy.text_retry}</button></p>}
          {reviewSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span role="status">{reviewSuccessMessage}</span>
            </div>
          )}
          {reviewErrorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span role="alert">{reviewErrorMessage}</span>
            </div>
          )}

          {/* Review Submission Form: Full container width */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="p-6 bg-[#FBFBFA] rounded-xl border border-stone-200 space-y-4 mb-8 text-start">
              <h3 className="font-heading font-medium text-base text-neutral-900">{copy.text_submit_your_review}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    {copy.text_your_name}</label>
                  <input
                    type="text"
                    required
                    placeholder={copy.placeholder_e_g_fatima_ali_lahore}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    {copy.text_rating}</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-black cursor-pointer"
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
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  {copy.text_title}</label>
                <input
                  type="text"
                  placeholder={copy.placeholder_e_g_clean_seeds_and_prompt_delivery}
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  {copy.text_review_comments}</label>
                <textarea
                  required
                  rows={3}
                  placeholder={copy.placeholder_share_your_experience_regarding_freshness_quality_and_r}
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-stone-200 bg-white hover:bg-stone-50 rounded-full text-xs font-semibold uppercase tracking-wider text-neutral-700 cursor-pointer"
                >
                  {copy.text_cancel}</button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-semibold uppercase tracking-wider disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {submittingReview ? 'Submitting...' : 'Submit review'}
                </button>
              </div>
            </form>
          )}

          {/* Reviews List: Full width cards */}
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 bg-white rounded-xl border border-stone-200 space-y-2 shadow-xs text-start">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">{rev.customer_name}</span>
                    {rev.verified_purchase && (
                      <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                        {copy.text_verified_buyer}</span>
                    )}
                  </div>
                  <span className="text-stone-600 text-xs">{formatDate(rev.created_at)}</span>
                </div>
                <div className="flex text-amber-500 text-sm">
                  {'★'.repeat(rev.rating)}
                  {'☆'.repeat(5 - rev.rating)}
                </div>
                {rev.title && <h4 className="font-semibold text-sm text-neutral-900">{rev.title}</h4>}
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">{rev.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>)}</ManagedSection>

      {/* 5. RELATED PRODUCTS */}
      {relatedProducts && relatedProducts.length > 0 && (
        <ManagedSection document="product" sectionId="productdetailview_section_03"><section className="border-t border-stone-200 py-12 md:py-16">
          <div className="max-w-7xl mx-auto w-full px-5 md:px-8">
            <h2 className="text-2xl font-medium tracking-tight mb-8 text-neutral-900 text-start">
              {copy.text_you_might_also_like}</h2>

            {/* Responsive Scroller / Grid: one single DOM structure */}
            <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-x-6 md:gap-y-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x md:snap-none -mx-5 px-5 md:mx-0 md:px-0">
              {relatedProducts.slice(0, 3).map((p) => (
                <div key={p.id} className="w-[75%] sm:w-[50%] md:w-auto shrink-0 md:shrink snap-start md:snap-align-none">
                  <ProductCard product={p} buttonVariant="secondary" />
                </div>
              ))}
            </div>
          </div>
        </section></ManagedSection>
      )}

      {/* Notify Me Modal */}
      <NotifyMeModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        itemTitle={product.name}
        productId={product.id}
        variantId={selectedVariant?.id}
      />

      {/* Sticky Mobile Purchase Bar (IntersectionObserver on mainActionsRef) */}
      <StickyPurchaseBar
        name={product.name}
        priceMinor={priceMinor}
        imageUrl={product.image_url}
        variantLabel={selectedVariant?.option_value}
        inStock={inStock}
        targetRef={mainActionsRef}
        onAddToCart={handleAddToCart}
        onNotifyMe={() => setIsNotifyModalOpen(true)}
      />
    </div>
  );
}

export default ProductDetailView;
