import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getOrder, lookupOrderWithCapability } from '../../../../lib/services/orders';
import { formatPKR, formatDate } from '../../../../lib/utils';
import { getOrderProgress, PAYMENT_METHOD_LABELS } from '../../../../lib/order-status';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  CheckCheck,
  Building,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Lock,
  Unlock,
} from 'lucide-react';

function maskName(name: string): string {
  if (!name) return 'Customer';
  const parts = name.trim().split(/\s+/);
  return parts.map(p => (p.length > 1 ? p[0] + '***' : p)).join(' ');
}

function maskPhone(phone: string): string {
  if (!phone) return '03*********';
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  if (clean.length < 8) return '03*********';
  return clean.slice(0, 4) + '****' + clean.slice(-3);
}

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'customer@***.com';
  const [user, domain] = email.split('@');
  return (user[0] || 'c') + '***@' + domain;
}

export default async function OrderConfirmationPage(props: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string; verify?: string }>;
}) {
  const { orderNumber } = await props.params;
  const searchParams = await props.searchParams;

  const token = searchParams.token || '';
  const verifyInput = searchParams.verify?.trim().toLowerCase() || '';

  const lookup = await lookupOrderWithCapability(orderNumber, token, verifyInput);
  if (!lookup) {
    notFound();
  }

  const { order, isAuthorized } = lookup;

  const progress = getOrderProgress(order);
  const steps = [
    { key: 'RECEIVED', label: 'Order Received', icon: CheckCircle2, done: true },
    {
      key: 'PAYMENT',
      label: progress.paymentLabel,
      icon: Clock,
      done: progress.paymentDone,
      active: progress.paymentActive,
      detail: order.payment_method === 'COD' && !progress.paymentDone ? 'Due on delivery' : undefined,
    },
    {
      key: 'PACKED',
      label: progress.packingActive ? 'Preparing your order' : 'Prepared & packed',
      icon: Package,
      done: progress.packed,
      active: progress.packingActive,
    },
    {
      key: 'SHIPPED',
      label: 'Dispatched via Courier',
      icon: Truck,
      done: progress.shipped,
    },
    {
      key: 'DELIVERED',
      label: 'Safely Delivered',
      icon: CheckCheck,
      done: progress.delivered,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border-gray shadow-card text-center space-y-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-subtle">
          <svg
            className="w-9 h-9 text-emerald-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" className="motion-draw-check" />
          </svg>
        </div>

        <span className="text-xs uppercase tracking-widest font-bold text-seedly-dark bg-seedly-light px-3 py-1 rounded-full">
          {order.order_status === 'CANCELLED' ? 'Order cancelled' : order.order_status === 'REFUNDED' ? 'Order refunded' : 'Order received'}
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
          {isAuthorized ? `Thank You, ${order.customer_name}!` : 'Order Status & Tracking'}
        </h1>

        <p className="text-sm text-muted-gray max-w-lg mx-auto">
          Order reference: <strong className="text-charcoal font-mono">#{order.order_number}</strong>.
          {isAuthorized ? (
            <> Confirmation dispatched to <strong>{order.customer_email}</strong> and WhatsApp <strong>{order.customer_phone}</strong>.</>
          ) : (
            <> General status and package tracking are shown below.</>
          )}
        </p>

        {/* Bank Review Notification Banner if applicable */}
        {order.payment_method !== 'COD' && order.payment_status === 'UNDER_REVIEW' && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-amber-900">
              <strong className="block text-sm font-semibold">Payment under review</strong>
              <p>
                Our team is verifying your payment. Preparation and packing will appear here once verified.
              </p>
            </div>
          </div>
        )}

        {/* Courier Tracking Banner if shipped */}
        {order.tracking_number && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left flex items-start gap-3">
            <Truck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-emerald-900">
              <strong className="block text-sm font-semibold">
                Dispatched with {order.tracking_courier || 'TCS Courier'}
              </strong>
              <p>
                Tracking Number:{' '}
                <strong className="font-mono text-sm underline">{order.tracking_number}</strong>. Your package is currently on the delivery route.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Live Order Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card mb-8">
        <h2 className="font-serif text-xl font-bold text-charcoal mb-6">Fulfillment Timeline</h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.key}
                className={`flex sm:flex-col items-center gap-3 sm:text-center p-3 rounded-2xl border transition-all ${
                  step.done
                    ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900'
                    : step.active
                    ? 'border-amber-300 bg-amber-50/50 text-amber-900 animate-pulse'
                    : 'border-border-gray/50 bg-cream/20 text-muted-gray'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    step.done
                      ? 'bg-emerald-600 text-white'
                      : step.active
                      ? 'bg-amber-500 text-white'
                      : 'bg-border-gray/50 text-muted-gray'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold block">{step.label}</span>
                  <span className="text-[10px] text-muted-gray">
                    {step.detail || (step.done ? 'Completed' : step.active ? 'In progress' : 'Pending')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Privacy Protection Gate for Non-Authorized Views */}
      {!isAuthorized && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card mb-8 text-left space-y-4">
          <div className="flex items-center gap-3 text-charcoal">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base">Personal Delivery Details Protected</h3>
              <p className="text-xs text-muted-gray">
                To prevent unauthorized enumeration of personal contact details, street addresses and phone numbers are hidden.
              </p>
            </div>
          </div>

          <form method="GET" className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              name="verify"
              placeholder="Enter customer email or phone to view full details"
              defaultValue={searchParams.verify || ''}
              className="flex-1 px-4 py-2.5 bg-cream/40 border border-border-gray rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-seedly-primary/50"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-seedly-dark hover:bg-seedly-forest text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock Details</span>
            </button>
          </form>
        </div>
      )}

      {/* Order Details & Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Shipping & Delivery Address */}
        <div className="bg-white rounded-3xl p-6 border border-border-gray shadow-card space-y-4">
          <h3 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2">
            <Truck className="w-4 h-4 text-seedly-primary" />
            <span>Delivery Destination</span>
          </h3>
          <div className="text-xs space-y-1.5 text-muted-gray">
            <p className="font-semibold text-charcoal text-sm">
              {isAuthorized ? order.customer_name : maskName(order.customer_name)}
            </p>
            <p>{isAuthorized ? order.shipping_address : `Street Address Protected`}</p>
            <p>
              {order.shipping_city}, {order.shipping_province}
            </p>
            {isAuthorized && order.shipping_notes && (
              <p className="italic bg-cream p-2.5 rounded-xl border border-border-gray mt-2">
                Note: {order.shipping_notes}
              </p>
            )}
            <p className="pt-2 font-medium text-charcoal">
              Phone: {isAuthorized ? order.customer_phone : maskPhone(order.customer_phone)}
            </p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-3xl p-6 border border-border-gray shadow-card space-y-4">
          <h3 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-seedly-primary" />
            <span>Payment Summary</span>
          </h3>
          <div className="text-xs space-y-2 text-muted-gray">
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <strong className="text-charcoal capitalize">
                {PAYMENT_METHOD_LABELS[order.payment_method]}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  order.payment_status === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.payment_status}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Order Date:</span>
              <strong className="text-charcoal">{formatDate(order.created_at)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Invoice Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-6">
        <h3 className="font-serif font-bold text-lg text-charcoal">Ordered Botanical Goods</h3>

        <div className="divide-y divide-border-gray/60">
          {order.items?.map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 relative rounded-xl overflow-hidden bg-cream shrink-0 border border-border-gray">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name_snapshot} fill className="object-cover" />
                  ) : (
                    <Package className="w-6 h-6 m-auto text-muted-gray" />
                  )}
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-sm text-charcoal">{item.name_snapshot}</h4>
                  <p className="text-xs text-muted-gray">Quantity: {item.quantity}</p>
                </div>
              </div>
              <span className="font-serif font-bold text-sm text-charcoal">
                {formatPKR(item.line_total_minor)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-border-gray pt-4 space-y-2 text-xs text-muted-gray">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-charcoal">{formatPKR(order.subtotal_minor)}</span>
          </div>
          <div className="flex justify-between">
            <span>Nationwide Delivery</span>
            <span className="font-semibold text-charcoal">
              {order.shipping_minor === 0 ? 'FREE' : formatPKR(order.shipping_minor)}
            </span>
          </div>
          <div className="border-t border-border-gray pt-3 flex justify-between items-baseline">
            <span className="font-serif font-bold text-base text-charcoal">Total Amount</span>
            <span className="font-serif font-bold text-2xl text-seedly-dark">
              {formatPKR(order.total_minor)}
            </span>
          </div>
        </div>
      </div>

      {/* Support & Return to shop CTA */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <a
          href={`https://wa.me/923719055758?text=${encodeURIComponent(
            `Salam Seedly! I am inquiring about my order #${order.order_number}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-semibold flex items-center justify-center gap-2 shadow-subtle"
        >
          <Phone className="w-4 h-4" />
          <span>Chat on WhatsApp regarding Order #{order.order_number}</span>
        </a>

        <Link
          href="/shop"
          className="text-seedly-dark font-semibold hover:underline flex items-center gap-1"
        >
          <span>Continue Browsing Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
