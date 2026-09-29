'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../../lib/store/cart';
import { formatPKR } from '../../../lib/utils';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Building,
  Upload,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Copy,
  Check,
  Banknote,
  PhoneCall,
  Clock,
} from 'lucide-react';

const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Gujrat',
  'Mardan',
  'Kasur',
  'Rahim Yar Khan',
  'Sahiwal',
  'Okara',
  'Wah Cantt',
  'Dera Ghazi Khan',
  'Mirpur (AJK)',
  'Muzaffarabad',
  'Gilgit',
  'Skardu',
  'Swat / Mingora',
  'Jhelum',
  'Sheikhupura',
  'Chiniot',
  'Other City',
];

const CITY_PROVINCE_MAP: Record<string, string> = {
  Karachi: 'Sindh',
  Lahore: 'Punjab',
  Islamabad: 'Islamabad Capital Territory',
  Rawalpindi: 'Punjab',
  Faisalabad: 'Punjab',
  Multan: 'Punjab',
  Peshawar: 'Khyber Pakhtunkhwa',
  Quetta: 'Balochistan',
  Sialkot: 'Punjab',
  Gujranwala: 'Punjab',
  Hyderabad: 'Sindh',
  Abbottabad: 'Khyber Pakhtunkhwa',
  Bahawalpur: 'Punjab',
  Sargodha: 'Punjab',
  Sukkur: 'Sindh',
  Gujrat: 'Punjab',
  Mardan: 'Khyber Pakhtunkhwa',
  Kasur: 'Punjab',
  'Rahim Yar Khan': 'Punjab',
  Sahiwal: 'Punjab',
  Okara: 'Punjab',
  'Wah Cantt': 'Punjab',
  'Dera Ghazi Khan': 'Punjab',
  'Mirpur (AJK)': 'Azad Jammu & Kashmir',
  Muzaffarabad: 'Azad Jammu & Kashmir',
  Gilgit: 'Gilgit-Baltistan',
  Skardu: 'Gilgit-Baltistan',
  'Swat / Mingora': 'Khyber Pakhtunkhwa',
  Jhelum: 'Punjab',
  Sheikhupura: 'Punjab',
  Chiniot: 'Punjab',
};

const PROVINCES = [
  'Punjab',
  'Sindh',
  'Islamabad Capital Territory',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalMinor, clearCart, freeShippingThreshold, setIsCartOpen } = useCart();

  // Ensure cart drawer overlay is closed upon entering checkout
  useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  // Stable pre-order reference preview
  const [pendingOrderRef] = useState(() => `SED-${Math.floor(100000 + Math.random() * 900000)}`);

  // Site settings for bank & wallets
  const [settings, setSettings] = useState({
    bank_name: 'Meezan Bank Limited',
    bank_account_title: 'Seedly',
    bank_account_number: '01020304050607',
    bank_iban: 'PK12MEZN0001020304050607',
    jazzcash_title: 'Seedly Care',
    jazzcash_number: '0304 1117333',
    easypaisa_title: 'Seedly Care',
    easypaisa_number: '0345 5557333',
    whatsapp_number: '+92 304 1117333',
  });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setSettings((prev: any) => ({ ...prev, ...json.data }));
        }
      })
      .catch(() => {});
  }, []);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('Lahore');
  const [customCity, setCustomCity] = useState('');
  const [shippingProvince, setShippingProvince] = useState('Punjab');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');

  // Field-level Validation states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'customerName':
        if (!value.trim()) return 'Full name is required.';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters.';
        return '';

      case 'customerEmail':
        if (!value.trim()) return 'Email address is required for dispatch notifications.';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim())) {
          return 'Please enter a valid email address (e.g. name@example.com).';
        }
        return '';

      case 'customerPhone': {
        if (!value.trim()) return 'Mobile / WhatsApp phone number is required.';
        const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
        if (!/^((\+92)|(0092)|(92)|0)?(3[0-9]{9})$/.test(cleanPhone)) {
          return 'Enter a valid Pakistani mobile number (e.g. 0304 1117333).';
        }
        return '';
      }

      case 'shippingAddress':
        if (!value.trim()) return 'Complete delivery address is required.';
        if (value.trim().length < 8) return 'Please provide full house/street/sector details (at least 8 characters).';
        return '';

      case 'customCity':
        if (shippingCity === 'Other City' && !value.trim()) {
          return 'Please enter your city / town name.';
        }
        return '';

      default:
        return '';
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleFieldChange = (field: string, value: string, setter: (val: string) => void) => {
    setter(value);
    if (touched[field]) {
      const err = validateField(field, value);
      setFieldErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleCityChange = (newCity: string) => {
    setShippingCity(newCity);
    if (CITY_PROVINCE_MAP[newCity]) {
      setShippingProvince(CITY_PROVINCE_MAP[newCity]);
    }
    if (newCity !== 'Other City') {
      setFieldErrors((prev) => ({ ...prev, customCity: '' }));
    }
  };

  // Payment states: COD, wallet_aggregator, bank_transfer
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'wallet_aggregator' | 'bank_transfer'>('COD');
  const [walletProvider, setWalletProvider] = useState<'jazzcash' | 'easypaisa'>('jazzcash');
  const [transactionId, setTransactionId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Bank transfer receipt state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Submission & transition states
  const [submitting, setSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isFreeShipping = subtotalMinor >= freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : 20000; // Rs. 200
  const totalMinor = subtotalMinor + shippingFee;

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num.replace(/\s+/g, ''));
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleReceiptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg('Your basket is empty. Please add products before checking out.');
      return;
    }

    // Run comprehensive field validation
    const nameErr = validateField('customerName', customerName);
    const emailErr = validateField('customerEmail', customerEmail);
    const phoneErr = validateField('customerPhone', customerPhone);
    const addrErr = validateField('shippingAddress', shippingAddress);
    const customCityErr = shippingCity === 'Other City' ? validateField('customCity', customCity) : '';

    const newErrors: Record<string, string> = {};
    if (nameErr) newErrors.customerName = nameErr;
    if (emailErr) newErrors.customerEmail = emailErr;
    if (phoneErr) newErrors.customerPhone = phoneErr;
    if (addrErr) newErrors.shippingAddress = addrErr;
    if (customCityErr) newErrors.customCity = customCityErr;

    setTouched({
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      shippingAddress: true,
      customCity: true,
    });
    setFieldErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setErrorMsg('Please correct the highlighted fields above before placing your order.');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
      return;
    }

    setSubmitting(true);

    try {
      let uploadedReceiptPath: string | undefined = undefined;

      // If receipt file selected (either bank transfer or wallet screenshot), upload first
      if (receiptFile) {
        setUploadingReceipt(true);
        const formData = new FormData();
        formData.append('receipt', receiptFile);

        const uploadRes = await fetch('/api/payments/bank-transfer/receipt', {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          uploadedReceiptPath = uploadJson.data.receipt_path;
        }
        setUploadingReceipt(false);
      }

      // Combine payment metadata notes
      let combinedNotes = shippingNotes;
      if (paymentMethod === 'wallet_aggregator') {
        const provName = walletProvider === 'jazzcash' ? 'JazzCash' : 'Easypaisa';
        combinedNotes += ` [${provName} TID: ${transactionId || 'Pending verification'}]`;
      } else if (paymentMethod === 'COD') {
        combinedNotes += ` [Payment: Cash on Delivery]`;
      }

      const orderPayload = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        shipping_city: shippingCity === 'Other City' ? (customCity.trim() || 'Other') : shippingCity,
        shipping_province: shippingProvince,
        shipping_postal_code: shippingPostalCode,
        shipping_notes: combinedNotes,
        payment_method: paymentMethod,
        receipt_path: uploadedReceiptPath,
        items: items.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id,
          kit_id: i.kit_id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to place order.');
      }

      const orderNumber = json.data.order_number;

      // Avoid empty basket flash before navigation completes
      setIsOrderPlaced(true);
      clearCart();
      router.push(`/order/${orderNumber}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong while placing your order.');
      setSubmitting(false);
    }
  };

  // If order was successfully placed, render clean loading state instead of empty basket
  if (isOrderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-28 text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-subtle">
          <CheckCircle2 className="w-8 h-8 animate-pulse" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
          Order Placed Successfully!
        </h2>
        <p className="text-sm text-muted-gray">
          Redirecting to your order confirmation and live delivery tracker...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-charcoal">Your basket is empty</h2>
        <p className="text-sm text-muted-gray mt-2 mb-6">
          Add fresh heirloom seeds or herbal teas before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="px-6 py-3 bg-seedly-dark text-white rounded-full text-xs font-semibold"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Return to Cart Quiet Link */}
      <div className="mb-6">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-gray hover:text-charcoal transition-colors"
        >
          <span>←</span>
          <span>Return to Cart</span>
        </Link>
      </div>

      {/* Checkout Header with Pending Order Reference */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-gray/70 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
            Checkout &amp; Delivery
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-1">
            Complete Your Order
          </h1>
        </div>
        <div className="text-left sm:text-right space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand/60 border border-border-gray text-xs font-mono text-charcoal">
            <span className="text-muted-gray">Pending Ref:</span>
            <strong>{pendingOrderRef}</strong>
          </div>
          <p className="text-[11px] text-muted-gray">
            Need assistance? <a href="https://wa.me/923041117333" target="_blank" rel="noopener noreferrer" className="text-seedly-dark font-semibold hover:underline">WhatsApp 0304 1117333</a>
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Customer Contact */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border-gray/60">
              <h2 className="font-serif text-xl font-bold text-charcoal flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-seedly-dark text-white text-xs flex items-center justify-center font-sans">
                  1
                </span>
                <span>Customer Contact</span>
              </h2>
              <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                Guest Checkout (No Account Needed)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="customerName"
                  id="customerName-label"
                  className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5"
                >
                  Full Name *
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  required
                  autoComplete="name"
                  aria-required="true"
                  aria-labelledby="customerName-label"
                  aria-invalid={!!(touched.customerName && fieldErrors.customerName)}
                  aria-describedby={touched.customerName && fieldErrors.customerName ? 'customerName-error' : undefined}
                  placeholder="e.g. Fatima Ali"
                  value={customerName}
                  onChange={(e) => handleFieldChange('customerName', e.target.value, setCustomerName)}
                  onBlur={() => handleBlur('customerName', customerName)}
                  className={`w-full px-4 py-2.5 bg-cream/30 border ${
                    touched.customerName && fieldErrors.customerName
                      ? 'border-rose-500 focus:ring-rose-400'
                      : 'border-border-gray focus:ring-seedly-primary/50'
                  } rounded-xl text-sm focus:outline-none focus:ring-2`}
                />
                {touched.customerName && fieldErrors.customerName && (
                  <p id="customerName-error" role="alert" className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.customerName}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="customerEmail"
                  id="customerEmail-label"
                  className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5"
                >
                  Email Address *
                </label>
                <input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  required
                  autoComplete="email"
                  aria-required="true"
                  aria-labelledby="customerEmail-label"
                  aria-invalid={!!(touched.customerEmail && fieldErrors.customerEmail)}
                  aria-describedby={touched.customerEmail && fieldErrors.customerEmail ? 'customerEmail-error' : 'customerEmail-hint'}
                  placeholder="fatima@example.com"
                  value={customerEmail}
                  onChange={(e) => handleFieldChange('customerEmail', e.target.value, setCustomerEmail)}
                  onBlur={() => handleBlur('customerEmail', customerEmail)}
                  className={`w-full px-4 py-2.5 bg-cream/30 border ${
                    touched.customerEmail && fieldErrors.customerEmail
                      ? 'border-rose-500 focus:ring-rose-400'
                      : 'border-border-gray focus:ring-seedly-primary/50'
                  } rounded-xl text-sm focus:outline-none focus:ring-2`}
                />
                {touched.customerEmail && fieldErrors.customerEmail ? (
                  <p id="customerEmail-error" role="alert" className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.customerEmail}</span>
                  </p>
                ) : (
                  <p id="customerEmail-hint" className="text-[11px] text-muted-gray mt-1">
                    Invoice &amp; order tracking confirmation sent here.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="customerPhone"
                  id="customerPhone-label"
                  className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5"
                >
                  WhatsApp / Mobile Phone *
                </label>
                <input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  required
                  autoComplete="tel"
                  aria-required="true"
                  aria-labelledby="customerPhone-label"
                  aria-invalid={!!(touched.customerPhone && fieldErrors.customerPhone)}
                  aria-describedby={touched.customerPhone && fieldErrors.customerPhone ? 'customerPhone-error' : 'customerPhone-hint'}
                  placeholder="0304 1117333"
                  value={customerPhone}
                  onChange={(e) => handleFieldChange('customerPhone', e.target.value, setCustomerPhone)}
                  onBlur={() => handleBlur('customerPhone', customerPhone)}
                  className={`w-full px-4 py-2.5 bg-cream/30 border ${
                    touched.customerPhone && fieldErrors.customerPhone
                      ? 'border-rose-500 focus:ring-rose-400'
                      : 'border-border-gray focus:ring-seedly-primary/50'
                  } rounded-xl text-sm focus:outline-none focus:ring-2`}
                />
                {touched.customerPhone && fieldErrors.customerPhone ? (
                  <p id="customerPhone-error" role="alert" className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.customerPhone}</span>
                  </p>
                ) : (
                  <p id="customerPhone-hint" className="text-[11px] text-muted-gray mt-1">
                    For TCS / Leopards courier delivery coordination.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Destination */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border-gray/60">
              <h2 className="font-serif text-xl font-bold text-charcoal flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-seedly-dark text-white text-xs flex items-center justify-center font-sans">
                  2
                </span>
                <span>Delivery Address (Pakistan)</span>
              </h2>
              <span className="text-xs text-muted-gray flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-seedly-primary" />
                <span>Nationwide TCS / Leopards</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="shippingAddress"
                  id="shippingAddress-label"
                  className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5"
                >
                  Complete Delivery Address / House / Street *
                </label>
                <input
                  id="shippingAddress"
                  name="shippingAddress"
                  type="text"
                  required
                  autoComplete="street-address"
                  aria-required="true"
                  aria-labelledby="shippingAddress-label"
                  aria-invalid={!!(touched.shippingAddress && fieldErrors.shippingAddress)}
                  aria-describedby={touched.shippingAddress && fieldErrors.shippingAddress ? 'shippingAddress-error' : undefined}
                  placeholder="House 12, Street 4, Sector F-7/2 or Block 5, Clifton"
                  value={shippingAddress}
                  onChange={(e) => handleFieldChange('shippingAddress', e.target.value, setShippingAddress)}
                  onBlur={() => handleBlur('shippingAddress', shippingAddress)}
                  className={`w-full px-4 py-2.5 bg-cream/30 border ${
                    touched.shippingAddress && fieldErrors.shippingAddress
                      ? 'border-rose-500 focus:ring-rose-400'
                      : 'border-border-gray focus:ring-seedly-primary/50'
                  } rounded-xl text-sm focus:outline-none focus:ring-2`}
                />
                {touched.shippingAddress && fieldErrors.shippingAddress && (
                  <p id="shippingAddress-error" role="alert" className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.shippingAddress}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="shippingCity"
                  id="shippingCity-label"
                  className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5"
                >
                  City *
                </label>
                <select
                  id="shippingCity"
                  name="shippingCity"
                  autoComplete="address-level2"
                  aria-required="true"
                  aria-labelledby="shippingCity-label"
                  value={shippingCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50"
                >
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="shippingProvince"
                  id="shippingProvince-label"
                  className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5"
                >
                  Province
                </label>
                <select
                  id="shippingProvince"
                  name="shippingProvince"
                  autoComplete="address-level1"
                  aria-labelledby="shippingProvince-label"
                  value={shippingProvince}
                  onChange={(e) => setShippingProvince(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50"
                >
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {shippingCity === 'Other City' && (
                <div className="sm:col-span-2 animate-fadeIn">
                  <label
                    htmlFor="customCity"
                    id="customCity-label"
                    className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5"
                  >
                    Specify City / Town Name *
                  </label>
                  <input
                    id="customCity"
                    name="customCity"
                    type="text"
                    required
                    autoComplete="address-level2"
                    aria-required="true"
                    aria-labelledby="customCity-label"
                    placeholder="Enter your city, town or tehsil name"
                    value={customCity}
                    onChange={(e) => handleFieldChange('customCity', e.target.value, setCustomCity)}
                    onBlur={() => handleBlur('customCity', customCity)}
                    className={`w-full px-4 py-2.5 bg-cream/30 border ${
                      touched.customCity && fieldErrors.customCity
                        ? 'border-rose-500 focus:ring-rose-400'
                        : 'border-border-gray focus:ring-seedly-primary/50'
                    } rounded-xl text-sm focus:outline-none focus:ring-2`}
                  />
                  {touched.customCity && fieldErrors.customCity && (
                    <p id="customCity-error" role="alert" className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.customCity}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="sm:col-span-2">
                <label
                  htmlFor="shippingNotes"
                  id="shippingNotes-label"
                  className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5"
                >
                  Delivery Notes / Landmark (Optional)
                </label>
                <input
                  id="shippingNotes"
                  name="shippingNotes"
                  type="text"
                  aria-labelledby="shippingNotes-label"
                  placeholder="Near main commercial market, call before arriving..."
                  value={shippingNotes}
                  onChange={(e) => setShippingNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Payment Method Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border-gray/60">
              <h2 id="payment-methods-heading" className="font-serif text-xl font-bold text-charcoal flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-seedly-dark text-white text-xs flex items-center justify-center font-sans">
                  3
                </span>
                <span>Select Payment Method</span>
              </h2>
              <span className="text-xs text-muted-gray flex items-center gap-1">
                <Lock className="w-3 h-3 text-seedly-primary" />
                <span>256-bit Encrypted</span>
              </span>
            </div>

            {/* Payment Method Radio Group */}
            <div role="radiogroup" aria-labelledby="payment-methods-heading" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Cash on Delivery (COD) */}
              <button
                type="button"
                role="radio"
                aria-checked={paymentMethod === 'COD'}
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  paymentMethod === 'COD'
                    ? 'border-seedly-dark bg-seedly-light/60 shadow-subtle'
                    : 'border-border-gray bg-white hover:bg-cream'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Pay on Delivery
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'COD'
                          ? 'border-seedly-dark bg-seedly-dark text-white'
                          : 'border-border-gray'
                      }`}
                    >
                      {paymentMethod === 'COD' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                  <h3 className="font-serif font-bold text-charcoal text-sm sm:text-base">Cash on Delivery</h3>
                  <p className="text-[11px] text-muted-gray mt-1 leading-relaxed">
                    Pay cash to the courier agent upon doorstep delivery.
                  </p>
                </div>
              </button>

              {/* Option 2: Mobile Wallets (JazzCash / Easypaisa) */}
              <button
                type="button"
                role="radio"
                aria-checked={paymentMethod === 'wallet_aggregator'}
                onClick={() => setPaymentMethod('wallet_aggregator')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  paymentMethod === 'wallet_aggregator'
                    ? 'border-seedly-dark bg-seedly-light/60 shadow-subtle'
                    : 'border-border-gray bg-white hover:bg-cream'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                      Mobile Wallet
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'wallet_aggregator'
                          ? 'border-seedly-dark bg-seedly-dark text-white'
                          : 'border-border-gray'
                      }`}
                    >
                      {paymentMethod === 'wallet_aggregator' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                  <h3 className="font-serif font-bold text-charcoal text-sm sm:text-base">JazzCash / Easypaisa</h3>
                  <p className="text-[11px] text-muted-gray mt-1 leading-relaxed">
                    Send directly to wallet &amp; enter Transaction ID (TID).
                  </p>
                </div>
              </button>

              {/* Option 3: Meezan Bank Transfer */}
              <button
                type="button"
                role="radio"
                aria-checked={paymentMethod === 'bank_transfer'}
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-seedly-dark bg-seedly-light/60 shadow-subtle'
                    : 'border-border-gray bg-white hover:bg-cream'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal bg-sand px-2 py-0.5 rounded-full">
                      Bank Transfer
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-seedly-dark bg-seedly-dark text-white'
                          : 'border-border-gray'
                      }`}
                    >
                      {paymentMethod === 'bank_transfer' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                  <h3 className="font-serif font-bold text-charcoal text-sm sm:text-base">Meezan Bank</h3>
                  <p className="text-[11px] text-muted-gray mt-1 leading-relaxed">
                    Online banking / ATM transfer with receipt upload.
                  </p>
                </div>
              </button>
            </div>

            {/* Cash on Delivery Details */}
            {paymentMethod === 'COD' && (
              <div className="p-5 rounded-2xl bg-cream/70 border border-border-gray space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <Banknote className="w-4 h-4 text-emerald-700" />
                  <span>Cash on Delivery Instructions</span>
                </div>
                <div className="space-y-2 text-xs text-charcoal leading-relaxed bg-white p-4 rounded-xl border border-border-gray/70">
                  <p>
                    • <strong>Exact change:</strong> Please keep cash of <strong>{formatPKR(totalMinor)}</strong> ready for the courier rider.
                  </p>
                  <p>
                    • <strong>Courier dispatch:</strong> Dispatched from our Lahore center via TCS / Leopards within 24 hours.
                  </p>
                  <p>
                    • <strong>Live updates:</strong> You will receive a courier tracking number via SMS and WhatsApp.
                  </p>
                </div>
              </div>
            )}

            {/* Wallet Details View (JazzCash / Easypaisa) */}
            {paymentMethod === 'wallet_aggregator' && (
              <div className="p-5 rounded-2xl bg-cream/50 border border-border-gray space-y-4 animate-fadeIn">
                {/* Provider switcher */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setWalletProvider('jazzcash')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      walletProvider === 'jazzcash'
                        ? 'bg-rose-700 text-white border-rose-700 shadow-subtle'
                        : 'bg-white text-charcoal border-border-gray'
                    }`}
                  >
                    JazzCash Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletProvider('easypaisa')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      walletProvider === 'easypaisa'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-subtle'
                        : 'bg-white text-charcoal border-border-gray'
                    }`}
                  >
                    Easypaisa Account
                  </button>
                </div>

                {/* Receiving Account Card */}
                <div className="bg-white p-4 rounded-2xl border border-border-gray space-y-3">
                  <div className="flex items-center justify-between border-b border-border-gray/50 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-gray">
                      Send Payment To (Official Account)
                    </span>
                    <span className="font-serif font-bold text-sm text-seedly-dark">
                      Amount: {formatPKR(totalMinor)}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5 text-xs">
                      <p className="text-muted-gray">Account Title:</p>
                      <strong className="text-charcoal font-semibold text-sm">
                        {walletProvider === 'jazzcash' ? settings.jazzcash_title : settings.easypaisa_title}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-cream rounded-xl border border-border-gray font-mono font-bold text-sm text-charcoal">
                        {walletProvider === 'jazzcash' ? settings.jazzcash_number : settings.easypaisa_number}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyNumber(
                            walletProvider === 'jazzcash'
                              ? settings.jazzcash_number
                              : settings.easypaisa_number
                          )
                        }
                        className="p-2 bg-seedly-light hover:bg-seedly-dark hover:text-white text-seedly-dark rounded-xl transition-colors text-xs flex items-center gap-1 font-semibold"
                        title="Copy account number"
                      >
                        {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{copiedNumber ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transaction ID (TID) Input */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor="transactionId" id="transactionId-label" className="block text-xs font-semibold text-charcoal uppercase tracking-wider">
                      Transaction ID (TID / Trx ID)
                    </label>
                    <input
                      id="transactionId"
                      name="transactionId"
                      type="text"
                      aria-labelledby="transactionId-label"
                      placeholder={
                        walletProvider === 'jazzcash'
                          ? 'e.g. 12-digit TID from 8558 SMS (e.g. 982182746192)'
                          : 'e.g. TID from 3737 SMS (e.g. 817263541209)'
                      }
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-border-gray rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-seedly-primary/50 text-charcoal"
                    />
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-gray pt-1">
                      <Clock className="w-3.5 h-3.5 text-seedly-primary" />
                      <span>Wallet payments are verified within 2–4 business hours upon order placement.</span>
                    </div>
                  </div>

                  {/* Optional Screenshot */}
                  <div>
                    <label htmlFor="walletScreenshot" id="walletScreenshot-label" className="block text-xs font-semibold text-charcoal mb-1">
                      Upload Payment Screenshot (Optional)
                    </label>
                    <div className="border border-dashed border-border-gray hover:border-seedly-primary rounded-xl p-3 text-center bg-white cursor-pointer relative">
                      <input
                        id="walletScreenshot"
                        name="walletScreenshot"
                        type="file"
                        accept="image/*,.pdf"
                        aria-labelledby="walletScreenshot-label"
                        onChange={handleReceiptChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {receiptPreview ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border-gray">
                            <Image src={receiptPreview} alt="Receipt Preview" fill className="object-cover" />
                          </div>
                          <span className="text-xs font-medium text-emerald-700">Screenshot attached!</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-gray">
                          <Upload className="w-3.5 h-3.5 text-seedly-primary" />
                          <span>Attach transaction confirmation image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Transfer Details View */}
            {paymentMethod === 'bank_transfer' && (
              <div className="p-5 rounded-2xl bg-cream/50 border border-border-gray space-y-4 animate-fadeIn">
                <div className="bg-white p-4 rounded-xl border border-border-gray space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-gray font-medium">Bank Name:</span>
                    <strong className="text-charcoal">{settings.bank_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-gray font-medium">Account Title:</span>
                    <strong className="text-charcoal">{settings.bank_account_title}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-gray font-medium">Account Number:</span>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-charcoal font-mono">{settings.bank_account_number}</strong>
                      <button
                        type="button"
                        onClick={() => handleCopyNumber(settings.bank_account_number)}
                        className="text-seedly-dark hover:underline text-[11px]"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-gray font-medium">IBAN:</span>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-charcoal font-mono">{settings.bank_iban}</strong>
                      <button
                        type="button"
                        onClick={() => handleCopyNumber(settings.bank_iban)}
                        className="text-seedly-dark hover:underline text-[11px]"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Receipt Upload Input */}
                <div className="space-y-2">
                  <label htmlFor="bankReceipt" id="bankReceipt-label" className="block text-xs font-semibold text-charcoal">
                    Upload Bank Transfer Receipt / Screenshot *
                  </label>
                  <div className="border-2 border-dashed border-border-gray hover:border-seedly-primary rounded-xl p-4 text-center bg-white cursor-pointer relative">
                    <input
                      id="bankReceipt"
                      name="bankReceipt"
                      type="file"
                      accept="image/*,.pdf"
                      aria-labelledby="bankReceipt-label"
                      onChange={handleReceiptChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {receiptPreview ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border-gray">
                          <Image src={receiptPreview} alt="Receipt Preview" fill className="object-cover" />
                        </div>
                        <span className="text-xs font-medium text-emerald-700">Receipt attached successfully!</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-5 h-5 text-muted-gray mx-auto" />
                        <p className="text-xs text-charcoal font-medium">Click to upload bank transfer receipt</p>
                        <p className="text-[10px] text-muted-gray">JPG, PNG or PDF up to 5MB</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-gray">
                    <Clock className="w-3.5 h-3.5 text-seedly-primary" />
                    <span>Bank transfers are verified within 2–4 business hours.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-6 sticky top-24">
            <h2 className="font-serif text-xl font-bold text-charcoal">Order Items ({items.length})</h2>

            {/* Items list */}
            <div className="divide-y divide-border-gray/50 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between text-xs gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-cream shrink-0 border border-border-gray">
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-charcoal leading-snug">{item.name}</p>
                      <p className="text-muted-gray text-[11px] mt-0.5">
                        {item.variant_label || '250g Pouch'} · Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-charcoal shrink-0 font-mono text-xs pt-0.5">
                    {formatPKR(item.price_minor * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 text-xs border-t border-border-gray pt-4">
              <div className="flex justify-between text-muted-gray">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal">{formatPKR(subtotalMinor)}</span>
              </div>
              <div className="flex justify-between text-muted-gray">
                <span>Nationwide Shipping</span>
                <span className="font-semibold text-charcoal">
                  {isFreeShipping ? (
                    <span className="text-emerald-700 font-bold">FREE (Promotional)</span>
                  ) : (
                    formatPKR(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-muted-gray">
                <span>Payment Method</span>
                <span className="font-semibold text-charcoal">
                  {paymentMethod === 'COD'
                    ? 'Cash on Delivery'
                    : paymentMethod === 'wallet_aggregator'
                    ? 'Mobile Wallet'
                    : 'Bank Transfer'}
                </span>
              </div>
              <div className="border-t border-border-gray pt-3 flex justify-between items-baseline">
                <span className="font-serif font-bold text-base text-charcoal">Total Amount</span>
                <span className="font-serif font-bold text-2xl text-seedly-dark">
                  {formatPKR(totalMinor)}
                </span>
              </div>
            </div>

            {/* Delivery Timing Indicator */}
            <div className="p-3 bg-cream/70 rounded-xl border border-border-gray/70 text-xs text-charcoal space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <Truck className="w-3.5 h-3.5 text-seedly-primary" />
                <span>Estimated Delivery: 2–4 business days</span>
              </div>
              <p className="text-[11px] text-muted-gray">
                Dispatched directly from Lahore via TCS &amp; Leopards Courier.
              </p>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 rounded-full font-medium text-sm transition-all shadow-card flex items-center justify-center gap-2 ${
                submitting
                  ? 'bg-seedly-primary cursor-not-allowed text-white'
                  : 'bg-seedly-dark hover:bg-seedly-forest text-white'
              }`}
            >
              <span>{submitting ? 'Confirming & Placing Order...' : 'Place Order Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="space-y-2 text-[11px] text-muted-gray text-center pt-2">
              <p className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>256-bit SSL Encrypted Checkout</span>
              </p>
              <p>
                By placing this order, you agree to Seedly's{' '}
                <Link href="/terms" className="underline hover:text-charcoal">Terms</Link> and{' '}
                <Link href="/shipping" className="underline hover:text-charcoal">Shipping Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
