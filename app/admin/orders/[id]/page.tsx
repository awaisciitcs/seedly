'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatPKR, formatDate } from '../../../../lib/utils';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  ShieldCheck,
  Clock,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setOrder(json.data);
          setStatus(json.data.order_status);
          setCourier(json.data.tracking_courier || 'TCS Express');
          setTrackingNumber(json.data.tracking_number || '');

          if (json.data.receipt_path) {
            if (json.data.receipt_path.startsWith('/')) {
              setReceiptUrl(json.data.receipt_path);
            } else {
              fetch(`/api/admin/receipts?path=${encodeURIComponent(json.data.receipt_path)}`)
                .then((r) => r.json())
                .then((res) => {
                  if (res.url) setReceiptUrl(res.url);
                })
                .catch(console.error);
            }
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleApprovePayment = async () => {
    setUpdating(true);
    setMessage('');
    setErrorMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payment/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_note: 'Transfer verified by administrator' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Unable to approve payment.');
      setOrder(json.data);
      setStatus(json.data.order_status);
      setMessage('Payment verified. Update fulfillment separately when preparation begins.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to approve payment.');
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectPayment = async () => {
    const reason = prompt('Please enter the reason for rejecting this receipt (e.g., Unclear screenshot or amount mismatch):');
    if (!reason) return;

    setUpdating(true);
    setMessage('');
    setErrorMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payment/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Unable to reject payment.');
      setOrder(json.data);
      setStatus(json.data.order_status);
      setMessage('Payment rejected.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to reject payment.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateFulfillment = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');
    setErrorMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          courier,
          tracking_number: trackingNumber,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Unable to update fulfillment.');
      setOrder(json.data);
      setStatus(json.data.order_status);
      setMessage('Fulfillment status updated.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to update fulfillment.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-muted-gray">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm font-semibold">Order not found.</p>
        <Link href="/admin/orders" className="text-xs text-seedly-dark underline">
          Return to Orders List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 bg-white rounded-xl border border-border-gray hover:bg-cream text-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
                Order #{order.order_number}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  order.payment_status === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.payment_status === 'UNDER_REVIEW'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                Payment: {order.payment_status}
              </span>
            </div>
            <p className="text-xs text-muted-gray mt-0.5">Placed on {formatDate(order.created_at)}</p>
          </div>
        </div>

        <Link
          href={`/order/${order.order_number}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-border-gray rounded-xl text-xs font-medium text-charcoal hover:bg-cream"
        >
          <span>Customer Tracking View</span>
          <ExternalLink className="w-3.5 h-3.5 text-muted-gray" />
        </Link>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{errorMessage}</p>}

      {/* Manual payment verification */}
      {order.payment_method !== 'COD' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-gray/70">
            <h3 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>{order.payment_method === 'wallet_aggregator' ? 'Wallet transfer verification' : 'Bank transfer verification'}</span>
            </h3>
            <span className="text-xs font-bold font-mono text-charcoal">
              Amount to Verify: {formatPKR(order.total_minor)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Receipt Preview */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-gray uppercase tracking-wider block">
                Uploaded Receipt Screenshot
              </span>
              {order.receipt_path ? (
                <div className="space-y-2">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border-gray bg-cream">
                    {receiptUrl ? (
                      order.receipt_path.endsWith('.pdf') ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                          <ExternalLink className="w-8 h-8 text-seedly-dark mb-2" />
                          <span className="text-xs font-semibold text-charcoal">PDF Receipt Document</span>
                        </div>
                      ) : (
                        <img src={receiptUrl} alt="Customer Bank Receipt" className="w-full h-full object-contain" />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-gray">
                        Loading secure receipt...
                      </div>
                    )}
                  </div>
                  {receiptUrl && (
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-seedly-dark hover:underline"
                    >
                      <span>Open Full Receipt</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-cream/40 rounded-2xl border border-dashed border-border-gray text-xs text-muted-gray">
                  {order.payment_method === 'wallet_aggregator' ? 'Check the transaction ID in the order notes against your wallet account.' : 'Customer has not attached a screenshot yet.'}
                </div>
              )}
            </div>

            {/* Approval Controls */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cream/50 border border-border-gray space-y-2 text-xs">
                <p>
                  <strong>Customer:</strong> {order.customer_name} ({order.customer_phone})
                </p>
                <p>
                  <strong>Payment method:</strong> {order.payment_method === 'wallet_aggregator' ? 'JazzCash / Easypaisa' : 'Bank transfer'}
                </p>
                <p>
                  <strong>Total Value:</strong> {formatPKR(order.total_minor)}
                </p>
              </div>

              {order.payment_status === 'UNDER_REVIEW' ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={handleApprovePayment}
                    className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-subtle flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Payment</span>
                  </button>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={handleRejectPayment}
                    className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Payment has been {order.payment_status}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fulfillment Status Controls & Courier Assignment */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-card space-y-6">
        <h3 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2">
          <Truck className="w-5 h-5 text-seedly-primary" />
          <span>Fulfillment & Courier Tracking</span>
        </h3>

        <form onSubmit={handleUpdateFulfillment} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
              Fulfillment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50"
            >
              <option value="RECEIVED">RECEIVED (Awaiting preparation)</option>
              <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
              <option value="PAYMENT_REVIEW">PAYMENT_REVIEW</option>
              <option value="PAID" disabled={order.payment_status !== 'VERIFIED'}>PAID</option>
              <option value="PROCESSING" disabled={order.payment_method !== 'COD' && order.payment_status !== 'VERIFIED'}>PROCESSING (Preparation in progress)</option>
              <option value="PACKED" disabled={order.payment_method !== 'COD' && order.payment_status !== 'VERIFIED'}>PACKED (Ready for Courier Pickup)</option>
              <option value="SHIPPED" disabled={order.payment_method !== 'COD' && order.payment_status !== 'VERIFIED'}>SHIPPED (In Transit)</option>
              <option value="DELIVERED" disabled={order.payment_method !== 'COD' && order.payment_status !== 'VERIFIED'}>DELIVERED (Completed)</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
              Courier Partner
            </label>
            <input
              type="text"
              placeholder="e.g. TCS / Leopards Courier"
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
              Tracking Number
            </label>
            <input
              type="text"
              placeholder="e.g. TCS-7729104"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-cream/30 border border-border-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seedly-primary/50"
            />
          </div>

          <div className="sm:col-span-3 pt-2 flex justify-end">
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2.5 bg-seedly-dark hover:bg-seedly-forest text-white rounded-xl text-xs font-semibold shadow-card transition-all"
            >
              {updating ? 'Updating...' : 'Save status'}
            </button>
          </div>
        </form>
      </div>

      {/* Customer & Shipping Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-border-gray shadow-card space-y-3 text-xs">
          <h4 className="font-serif font-bold text-base text-charcoal">Customer Information</h4>
          <p>
            <strong>Name:</strong> {order.customer_name}
          </p>
          <p>
            <strong>Phone:</strong> {order.customer_phone}
          </p>
          <p>
            <strong>Email:</strong> {order.customer_email}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-border-gray shadow-card space-y-3 text-xs">
          <h4 className="font-serif font-bold text-base text-charcoal">Delivery Address</h4>
          <p>{order.shipping_address}</p>
          <p>
            {order.shipping_city}, {order.shipping_province}
          </p>
          {order.shipping_notes && <p className="italic text-muted-gray">Note: {order.shipping_notes}</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-3xl p-6 border border-border-gray shadow-card space-y-4">
        <h4 className="font-serif font-bold text-base text-charcoal">Ordered Goods</h4>
        <div className="divide-y divide-border-gray/50">
          {order.items?.map((item: any) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-charcoal">{item.name_snapshot}</p>
                <p className="text-muted-gray font-mono text-[11px]">SKU: {item.sku_snapshot}</p>
              </div>
              <div className="text-right">
                <span className="font-semibold text-charcoal">{formatPKR(item.line_total_minor)}</span>
                <p className="text-muted-gray">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border-gray pt-4 flex justify-between text-sm font-bold text-charcoal">
          <span>Total Order Value</span>
          <span className="text-seedly-dark">{formatPKR(order.total_minor)}</span>
        </div>
      </div>
    </div>
  );
}
