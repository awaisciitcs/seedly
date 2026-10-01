'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant, Review } from '../../lib/types';
import { formatPKR, formatDate } from '../../lib/utils';
import { useCart } from '../../lib/store/cart';
import { useWishlist } from '../../lib/store/wishlist';
import { Star, Leaf, Clock, Coffee, CheckCircle2, PenLine, AlertCircle, Bell, MessageCircle, Thermometer, ChevronDown, Truck } from 'lucide-react';
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
    usage: product.product_type === 'tea',
    storage: false,
    faqs: false,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-gray mb-8">
        <Link href="/" className="hover:text-charcoal">Home</Link>
        <span>/</span>
        <Link href={`/${product.product_type === 'tea' ? 'teas' : 'seeds'}`} className="capitalize hover:text-charcoal">
          {product.product_type === 'tea' ? 'Mountain Teas' : 'Raw Pantry Seeds'}
        </Link>
        <span>/</span>
        <span className="text-charcoal font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Left Column: Packaging Visual */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-sm overflow-hidden bg-cream border border-border-gray">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full border border-border-gray text-sm font-medium text-charcoal flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-seedly-primary"></span>
              <span>{selectedVariant?.option_value || (product.weight_grams ? `${product.weight_grams}g` : product.name)}</span>
            </div>
          </div>

          {/* Contextual WhatsApp Consultation */}
          <div className="p-4 rounded-sm bg-white border border-border-gray flex flex-col items-start sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-charcoal">Questions about this product?</p>
              <p className="text-sm text-muted-gray">Ask our team about ingredients, preparation, or storage.</p>
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

        {/* Right Column: Product Controls & Dossier Summary */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & Verified Review Social Proof */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm uppercase tracking-widest font-semibold text-seedly-primary">
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
              {product.name}
            </h1>

            {/* Short descriptor */}
            <p className="text-sm sm:text-base text-muted-gray leading-relaxed">
              {product.short_description}
            </p>

            {/* Tea specific quick attributes */}
            {product.product_type === 'tea' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 px-4 bg-seedly-stone rounded-sm border border-border-gray text-sm text-charcoal">
                {product.flavor_profile && (
                  <div className="space-y-0.5">
                    <span className="font-semibold flex items-center gap-1 text-seedly-dark">
                      <Leaf className="w-3.5 h-3.5" /> Notes
                    </span>
                    <p className="text-sm text-muted-gray truncate">{product.flavor_profile}</p>
                  </div>
                )}
                <div className="space-y-0.5">
                  <span className="font-semibold flex items-center gap-1 text-seedly-dark">
                    <Clock className="w-3.5 h-3.5" /> Brew Time
                  </span>
                  <p className="text-sm text-muted-gray">{product.steep_time || '3–4 mins'}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="font-semibold flex items-center gap-1 text-seedly-dark">
                    <Thermometer className="w-3.5 h-3.5" /> Water Temp
                  </span>
                  <p className="text-sm text-muted-gray">{product.water_temp || (product.slug === 'green-tea' ? '80°C' : '90°C–95°C')}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="font-semibold flex items-center gap-1 text-seedly-dark">
                    <Coffee className="w-3.5 h-3.5" /> Caffeine
                  </span>
                  <p className="text-sm text-muted-gray">{product.caffeine_level || 'Caffeine-free'}</p>
                </div>
              </div>
            )}

            {/* Price & Real Inventory State */}
            <div className="flex flex-wrap items-baseline gap-3 pt-2">
              <span key={priceMinor} className="font-serif text-3xl font-medium text-charcoal price-crossfade motion-count">
                {formatPKR(priceMinor)}
              </span>
              {comparePriceMinor && (
                <span key={comparePriceMinor} className="text-base text-muted-gray line-through price-crossfade">
                  {formatPKR(comparePriceMinor)}
                </span>
              )}
              {inStock ? (
                isLowStock ? (
                  <span className="text-sm text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium">
                    Low stock — only {currentStock} left
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

            {selectedVariant && selectedVariant.weight_grams > 0 && (
              <p className="text-sm text-muted-gray">
                {selectedVariant.option_value} &middot; {formatPKR(Math.round(priceMinor * 100 / selectedVariant.weight_grams))} per 100g
              </p>
            )}

            {/* Pack Size / Variant Selector */}
            {activeVariants.length > 1 && (
              <fieldset className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <legend className="text-sm font-semibold text-charcoal">Select Pack Size (Weight)</legend>
                  {selectedVariant && (
                    <span className="text-xs font-mono text-seedly-dark font-medium">
                      Selected: {selectedVariant.option_value} ({formatPKR(selectedVariant.price_minor)})
                    </span>
                  )}
                </div>
                <div
                  className={`grid gap-2 sm:gap-3 ${
                    activeVariants.length === 2
                      ? 'grid-cols-2'
                      : activeVariants.length === 4
                      ? 'grid-cols-2 sm:grid-cols-4'
                      : 'grid-cols-2 sm:grid-cols-3'
                  }`}
                >
                  {activeVariants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const vInStock = (v.inventory_quantity ?? 0) > 0;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                        aria-pressed={isSelected}
                        className={`relative flex min-h-[84px] flex-col items-start justify-center gap-1 rounded-2xl border px-3.5 py-3 text-left transition-all duration-200 sm:px-4 cursor-pointer ${
                          isSelected
                            ? 'border-seedly-dark bg-seedly-light/70 text-seedly-dark ring-2 ring-seedly-dark shadow-sm'
                            : 'border-border-gray bg-white text-charcoal hover:border-seedly-primary hover:bg-seedly-light/30'
                        }`}
                      >
                        <span className="text-sm font-bold tracking-tight">{v.option_value}</span>
                        <span className={`text-xs font-mono font-semibold sm:text-sm ${isSelected ? 'text-seedly-dark' : 'text-muted-gray'}`}>
                          {formatPKR(v.price_minor)}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="absolute right-2.5 top-2.5 h-4 w-4 text-seedly-dark motion-pop" aria-hidden="true" />
                        )}
                        {!vInStock && (
                          <span className="text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md">
                            Sold out
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* Action Controls */}
            <div ref={mainActionsRef} className="space-y-3">
              <div className="flex items-center gap-2 py-2.5 px-3.5 bg-seedly-light/70 border border-seedly-primary/20 rounded-xl text-xs text-charcoal">
                <Truck className="h-4 w-4 text-seedly-primary shrink-0" aria-hidden="true" />
                <span>
                  <strong>Flat Rs. 200 delivery</strong> · <strong className="text-seedly-dark">FREE</strong> over Rs. 2,500 · Dispatched in 24h from Lahore
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
                  onWishlist={() => toggleWishlist(product.id)}
                />
              ) : (
                <div className="space-y-3 pt-4">
                  <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-sm text-sm text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-amber-700" />
                      <span>Currently out of stock</span>
                    </p>
                    <p className="text-amber-800">
                      Leave your email and we will let you know when this product is available.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsNotifyModalOpen(true)}
                    className="min-h-14 w-full py-3.5 px-6 rounded-full font-medium text-sm bg-seedly-dark hover:bg-seedly-forest text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Notify Me When Available</span>
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-border-gray pt-5 space-y-3 text-sm leading-6 text-muted-gray">
              <p>Delivery across Pakistan. <Link href="/shipping" className="underline underline-offset-4 text-seedly-dark">See delivery times and charges</Link>.</p>
              <p>Something wrong with your parcel? <Link href="/returns" className="underline underline-offset-4 text-seedly-dark">Read our replacement policy</Link>.</p>
              {product.sku && <p className="text-sm">Product code: {product.sku}</p>}
            </div>

            {/* Prominent Allergen Notice */}
            {product.slug === 'sesame-seeds' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm text-sm text-amber-900 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Allergen Notice: Contains Sesame Seeds. Packed in a facility handling edible seeds.</span>
              </div>
            )}
            {product.slug === 'chamomile-tea' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm text-sm text-amber-900 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Allergy Caution: Chamomile belongs to the Asteraceae (daisy) plant family. Avoid if you have known allergies to daisy-family plants.</span>
              </div>
            )}

            {/* Standard Dietary Disclaimer */}
            <div className="p-3.5 bg-stone/50 border border-border-gray rounded-sm text-sm text-muted-gray leading-relaxed">
              <strong className="text-charcoal font-semibold">Dietary Notice: </strong>
              {siteConfig.disclaimer.standard}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 sm:mt-24 pt-10 border-t border-border-gray">
        <h2 className="font-serif text-2xl font-medium text-charcoal mb-6">Product Information</h2>
        
        <div className="max-w-3xl divide-y divide-border-gray border-y border-border-gray">
          {/* Ingredients & Details Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('details')}
              aria-expanded={openSections.details}
              aria-controls="accordion-details"
              className="flex w-full items-center justify-between py-4 text-left font-serif text-lg font-medium text-charcoal hover:text-seedly-dark transition-colors"
            >
              <span>Ingredients & Details</span>
              <ChevronDown
                className={`h-5 w-5 text-muted-gray transition-transform duration-200 ease-out ${
                  openSections.details ? 'rotate-180 text-seedly-dark' : 'rotate-0'
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
                <div className="pb-6 pt-1 text-sm leading-relaxed text-charcoal space-y-4">
                  <p>{product.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-white rounded-sm border border-border-gray space-y-1">
                      <span className="text-xs uppercase tracking-wider font-semibold text-muted-gray block">
                        Ingredients
                      </span>
                      <p className="font-medium text-charcoal">{product.ingredients}</p>
                    </div>
                    <div className="p-4 bg-white rounded-sm border border-border-gray space-y-1">
                      <span className="text-xs uppercase tracking-wider font-semibold text-muted-gray block">
                        Pack size
                      </span>
                      <p className="font-medium text-charcoal">
                        {selectedVariant?.option_value || (product.weight_grams ? product.weight_grams + "g" : "See product label")}
                      </p>
                    </div>
                  </div>

                  {product.nutrition_information && (
                    <div className="space-y-2 pt-2">
                      <h4 className="font-serif font-medium text-base text-charcoal">Nutrition per 28 g (typical values)</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(product.nutrition_information).map(([key, val]) => (
                          <div key={key} className="bg-white p-3 rounded-sm border border-border-gray">
                            <span className="text-xs uppercase tracking-wider text-muted-gray font-semibold block capitalize">
                              {key.replace('_', ' ')}
                            </span>
                            <span className="text-sm font-bold text-charcoal">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* How to use / brew Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('usage')}
              aria-expanded={openSections.usage}
              aria-controls="accordion-usage"
              className="flex w-full items-center justify-between py-4 text-left font-serif text-lg font-medium text-charcoal hover:text-seedly-dark transition-colors"
            >
              <span>{product.product_type === 'tea' ? 'How to brew' : 'How to use'}</span>
              <ChevronDown
                className={`h-5 w-5 text-muted-gray transition-transform duration-200 ease-out ${
                  openSections.usage ? 'rotate-180 text-seedly-dark' : 'rotate-0'
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
                <div className="pb-6 pt-1 text-sm leading-relaxed text-muted-gray space-y-4">
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

          {/* Storage Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('storage')}
              aria-expanded={openSections.storage}
              aria-controls="accordion-storage"
              className="flex w-full items-center justify-between py-4 text-left font-serif text-lg font-medium text-charcoal hover:text-seedly-dark transition-colors"
            >
              <span>Keeping it fresh & Storage</span>
              <ChevronDown
                className={`h-5 w-5 text-muted-gray transition-transform duration-200 ease-out ${
                  openSections.storage ? 'rotate-180 text-seedly-dark' : 'rotate-0'
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
                <div className="pb-6 pt-1 text-sm leading-relaxed text-muted-gray space-y-3">
                  <p>{product.storage_instructions}</p>
                  <p>Check your pack for its best-before date and reseal it after each use.</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('faqs')}
              aria-expanded={openSections.faqs}
              aria-controls="accordion-faqs"
              className="flex w-full items-center justify-between py-4 text-left font-serif text-lg font-medium text-charcoal hover:text-seedly-dark transition-colors"
            >
              <span>Common Questions</span>
              <ChevronDown
                className={`h-5 w-5 text-muted-gray transition-transform duration-200 ease-out ${
                  openSections.faqs ? 'rotate-180 text-seedly-dark' : 'rotate-0'
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
                <div className="pb-6 pt-1 text-sm leading-relaxed divide-y divide-border-gray/50">
                  {product.product_type === 'tea' && product.caffeine_level && (
                    <div className="pb-4">
                      <h4 className="font-serif text-base font-medium text-charcoal">Does it contain caffeine?</h4>
                      <p className="mt-1 text-muted-gray">Caffeine level: {product.caffeine_level}.</p>
                    </div>
                  )}
                  <div className="py-4">
                    <h4 className="font-serif text-base font-medium text-charcoal">Which pack sizes are available?</h4>
                    <p className="mt-1 text-muted-gray">{product.variants?.filter((variant) => variant.status === 'ACTIVE').map((variant) => variant.option_value).join(', ') || 'See the product label for the pack size.'}</p>
                  </div>
                  <div className="py-4">
                    <h4 className="font-serif text-base font-medium text-charcoal">When will my order arrive?</h4>
                    <p className="mt-1 text-muted-gray">Timings depend on your delivery address. <Link href="/shipping" className="underline underline-offset-4 text-seedly-dark">See our delivery estimates</Link>.</p>
                  </div>
                  <div className="pt-4">
                    <h4 className="font-serif text-base font-medium text-charcoal">Have another question?</h4>
                    <p className="mt-1 text-muted-gray"><Link href="/contact" className="underline underline-offset-4 text-seedly-dark">Contact the Seedly team</Link> for help with this product or your order.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-12 max-w-3xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border-gray">
            <div>
              <h3 className="font-serif font-medium text-xl text-charcoal">Customer Reviews</h3>
              <p className="text-sm text-muted-gray">
                {reviews.length > 0
                  ? `${reviews.length} verified review${reviews.length > 1 ? 's' : ''}`
                  : 'Be the first to share your experience.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-seedly-dark hover:bg-seedly-forest text-white rounded-sm text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Success / Error Messages */}
          {reviewSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{reviewSuccessMessage}</span>
            </div>
          )}
          {reviewErrorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-sm text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{reviewErrorMessage}</span>
            </div>
          )}

          {/* Review Submission Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="p-5 bg-white rounded-sm border border-border-gray space-y-4">
              <h5 className="font-serif font-medium text-sm text-charcoal">Submit your review</h5>
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
                    className="w-full px-3 py-2 bg-cream/40 border border-border-gray rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-seedly-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                    Rating
                  </label>
                  <select
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
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Very clean and fresh seeds"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-cream/40 border border-border-gray rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-seedly-primary"
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
                  {submittingReview ? 'Submitting...' : 'Submit review'}
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 bg-white rounded-sm border border-border-gray space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal">{rev.customer_name}</span>
                    {rev.verified_purchase && (
                      <span className="text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                        Verified Buyer
                      </span>
                    )}
                  </div>
                  <span className="text-muted-gray text-xs">{formatDate(rev.created_at)}</span>
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

      {/* Genuinely Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16 pt-12 border-t border-border-gray">
          <h3 className="font-serif text-2xl font-medium text-charcoal mb-6">You may also like</h3>
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

      {/* Sticky Mobile Purchase Bar */}
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
