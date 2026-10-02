'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant, Review } from '../../lib/types';
import { formatPrice, formatDate, toSentenceCase } from '../../lib/utils';
import { useCart } from '../../lib/store/cart';
import { useWishlist } from '../../lib/store/wishlist';
import { Star, Leaf, Clock, Coffee, CheckCircle2, PenLine, AlertCircle, Bell, MessageCircle, Thermometer, ChevronDown, ChevronRight, Truck, Check } from 'lucide-react';
import { NotifyMeModal } from './NotifyMeModal';
import { ProductCard } from './ProductCard';
import { PurchaseActions } from './PurchaseActions';
import { StickyPurchaseBar } from './StickyPurchaseBar';
import { TeaBrewCalculator } from './TeaBrewCalculator';
import { siteConfig } from '../../lib/config';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts?: Product[];
}

export function ProductDetailView({ product, relatedProducts = [] }: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const activeVariants = product.variants?.filter((variant) => variant.status === 'ACTIVE') || [];
  const defaultVar = activeVariants.find((variant) => variant.weight_grams === product.weight_grams)
    || activeVariants.find((variant) => variant.weight_grams === 250)
    || activeVariants[0];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(defaultVar);
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
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-400 rtl:rotate-180 shrink-0" aria-hidden="true" />
          <Link href={categoryNavHref} className="hover:text-black transition-colors">
            {categoryNavLabel}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-400 rtl:rotate-180 shrink-0" aria-hidden="true" />
          <span className="text-neutral-900 truncate font-medium" aria-current="page">
            {productSentenceTitle}
          </span>
        </nav>

        {/* Hero: TwoCol (grid-cols-1 lg:grid-cols-2 lg:gap-x-12 gap-y-10 items-start) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12 gap-y-10 items-start">
          
          {/* Left Hero Column: Square gallery image + column-width WhatsApp help card */}
          <div className="w-full space-y-4">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#FBFBFA] border border-stone-200 shadow-xs">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Contextual WhatsApp Help Card: exactly column width */}
            <div className="w-full rounded-xl border border-stone-200 bg-[#FBFBFA] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5 text-start">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                  Questions about this product?
                </p>
                <p className="text-xs text-stone-600 font-normal">
                  Ask our team about ingredients, preparation, or storage.
                </p>
              </div>
              <a
                href={`${siteConfig.contact.whatsappUrl}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-neutral-800 text-xs font-semibold uppercase tracking-wider px-4 py-2 shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <MessageCircle className="w-3.5 h-3.5 text-neutral-700" />
                <span>Ask on WhatsApp</span>
              </a>
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
                  : 'Raw Whole Seeds'}
              </span>
            </div>

            {/* 2. H1 */}
            <h1 className="font-heading font-medium text-3xl sm:text-4xl text-neutral-900 tracking-tight leading-tight">
              {productSentenceTitle}
            </h1>

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
                    Low stock — {currentStock} left
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium">
                    In stock
                  </span>
                )
              ) : (
                <span className="rounded-full bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 text-xs font-medium flex items-center gap-1">
                  <Bell className="w-3 h-3 text-rose-700" />
                  <span>Out of stock</span>
                </span>
              )}
            </div>

            {/* 5. Per-100g Line (updates with selected size) */}
            {selectedVariant && selectedVariant.weight_grams > 0 ? (
              <p className="text-xs text-stone-600 font-normal">
                {formatPrice(Math.round(priceMinor * 100 / selectedVariant.weight_grams))} per 100g
              </p>
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
                        onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                        aria-pressed={isSelected}
                        className={`rounded-xl border p-3 text-center sm:text-start transition-all cursor-pointer shadow-xs min-h-[64px] flex flex-col justify-center ${
                          isSelected
                            ? 'border-black bg-black text-white'
                            : 'border-stone-200 bg-white text-stone-900 hover:border-stone-400'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-semibold tracking-tight">{v.option_value}</span>
                        <span className={`text-[11px] tabular-nums mt-0.5 ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                          {formatPrice(v.price_minor)}
                        </span>
                        {!vInStock && (
                          <span className={`text-[9px] font-semibold uppercase mt-0.5 ${
                            isSelected ? 'text-stone-300' : 'text-rose-600'
                          }`}>
                            Sold out
                          </span>
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
                Flat Rs. 200 delivery · FREE over Rs. 2,500 · Dispatched in 24h from Lahore
              </span>
            </div>

            {/* 8 & 9. CTA Row (Stepper, Add to cart flex-1, Wishlist; all h-12) & Buy now (full width h-12) */}
            <div ref={mainActionsRef} className="pt-1">
              {inStock ? (
                <PurchaseActions
                  quantity={quantity}
                  maxQuantity={currentStock}
                  added={added}
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
                      <span>Currently out of stock</span>
                    </p>
                    <p className="text-stone-600 font-normal">
                      Leave your email and we will let you know when this fresh batch is packed.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsNotifyModalOpen(true)}
                    className="h-12 w-full rounded-full font-semibold text-xs sm:text-sm uppercase tracking-wider bg-black hover:bg-neutral-800 text-white shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Notify me when available</span>
                  </button>
                </div>
              )}
            </div>

            {/* 10. One fine-print row */}
            <div className="pt-2 text-xs text-stone-600 flex items-center gap-2 flex-wrap font-normal">
              <Link href="/shipping" className="hover:text-black underline underline-offset-4">
                Delivery times &amp; charges
              </Link>
              <span>·</span>
              <Link href="/returns" className="hover:text-black underline underline-offset-4">
                Replacement policy
              </Link>
            </div>

            {/* 11. One muted line linking to #dietary-notice */}
            <p className="text-xs text-stone-600 font-normal">
              Culinary food item, not a medicine.{' '}
              <a href="#dietary-notice" className="underline underline-offset-4 hover:text-black">
                Dietary notice
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* 3. PRODUCT INFORMATION (Section, SectionTitle, then TwoCol) */}
      <section className="border-t border-stone-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8">
          <h2 className="text-2xl font-medium tracking-tight mb-8 text-neutral-900">
            Product information
          </h2>

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
                  <span>Ingredients &amp; details</span>
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
                      
                      {/* dl grid-cols-[8rem_1fr] gap-y-3: Ingredients, Origin, Product code */}
                      <dl className="grid grid-cols-[8rem_1fr] gap-y-3 pt-3 border-t border-stone-100 text-sm">
                        <dt className="text-stone-600 font-medium">Ingredients</dt>
                        <dd className="text-neutral-900">{product.ingredients}</dd>

                        <dt className="text-stone-600 font-medium">Origin</dt>
                        <dd className="text-neutral-900">{originValue}</dd>

                        <dt className="text-stone-600 font-medium">Product code</dt>
                        <dd className="font-mono text-neutral-900 text-xs sm:text-sm">{product.sku || 'SED-FLX-01'}</dd>
                      </dl>
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
                  <span>Keeping it fresh &amp; storage</span>
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
                      <p>Check your pack for its best-before date and reseal it after each use.</p>
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
                  <span>Common questions</span>
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
                          <h4 className="text-sm sm:text-base font-medium text-neutral-900">Does it contain caffeine?</h4>
                          <p className="mt-1 text-stone-600">Caffeine level: {product.caffeine_level}.</p>
                        </div>
                      )}
                      <div className="py-4">
                        <h4 className="text-sm sm:text-base font-medium text-neutral-900">Which pack sizes are available?</h4>
                        <p className="mt-1 text-stone-600">
                          {activeVariants.map((v) => v.option_value).join(', ') || 'See product label.'}
                        </p>
                      </div>
                      <div className="py-4">
                        <h4 className="text-sm sm:text-base font-medium text-neutral-900">When will my order arrive?</h4>
                        <p className="mt-1 text-stone-600">
                          Timings depend on your delivery address. <Link href="/shipping" className="underline underline-offset-4 text-neutral-900">See our delivery estimates</Link>.
                        </p>
                      </div>
                      <div className="pt-4">
                        <h4 className="text-sm sm:text-base font-medium text-neutral-900">Have another question?</h4>
                        <p className="mt-1 text-stone-600">
                          <Link href="/contact" className="underline underline-offset-4 text-neutral-900">Contact the Seedly team</Link> for help with this product or your order.
                        </p>
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
                    <span>Nutrition per 28g (typical values)</span>
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
                    Nutrition per 28g (typical values)
                  </h3>
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
              Dietary Food Notice:
            </strong>
            {siteConfig.disclaimer.standard}
          </div>
        </div>
      </section>

      {/* 4. REVIEWS */}
      <section className="border-t border-stone-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="text-start">
              <h2 className="text-2xl font-medium tracking-tight text-neutral-900">
                Customer reviews
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-normal mt-1">
                {reviews.length > 0
                  ? `${reviews.length} verified review${reviews.length > 1 ? 's' : ''}`
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
                <span>Write a review</span>
              </span>
            </button>
          </div>

          {/* Success / Error Messages */}
          {reviewSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{reviewSuccessMessage}</span>
            </div>
          )}
          {reviewErrorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{reviewErrorMessage}</span>
            </div>
          )}

          {/* Review Submission Form: Full container width */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="p-6 bg-[#FBFBFA] rounded-xl border border-stone-200 space-y-4 mb-8 text-start">
              <h3 className="font-heading font-medium text-base text-neutral-900">Submit your review</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fatima Ali (Lahore)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Rating
                  </label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-black cursor-pointer"
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
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Clean seeds and prompt delivery"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Review Comments *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share your experience regarding freshness, quality, and routine convenience..."
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
                  Cancel
                </button>
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
                        Verified Buyer
                      </span>
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
      </section>

      {/* 5. RELATED PRODUCTS */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="border-t border-stone-200 py-12 md:py-16">
          <div className="max-w-7xl mx-auto w-full px-5 md:px-8">
            <h2 className="text-2xl font-medium tracking-tight mb-8 text-neutral-900 text-start">
              You might also like
            </h2>

            {/* Desktop / Tablet Grid: grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8 */}
            <div className="hidden md:grid md:grid-cols-3 gap-x-6 gap-y-8">
              {relatedProducts.slice(0, 3).map((p) => (
                <ProductCard key={p.id} product={p} buttonVariant="secondary" />
              ))}
            </div>

            {/* Mobile Snap Scroller: below md, snap-x snap-mandatory, w-[70%] cards */}
            <div className="md:hidden flex snap-x snap-mandatory gap-4 overflow-x-auto -mx-5 px-5 pb-4">
              {relatedProducts.slice(0, 3).map((p) => (
                <div key={p.id} className="w-[70%] shrink-0 snap-start">
                  <ProductCard product={p} buttonVariant="secondary" />
                </div>
              ))}
            </div>
          </div>
        </section>
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
