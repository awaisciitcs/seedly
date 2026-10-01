'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatPKR, formatDate } from '@/lib/utils';
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
      if (!res.ok) throw new Error(json.error?.message || 'Unable to reject receipt.');
      setOrder(json.data);
      setStatus(json.data.order_status);
      setMessage('Receipt marked as rejected. Customer has been notified.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to reject receipt.');
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
      const res = await fetch(`/api/admin/orders/${orderId}/fulfillment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          tracking_courier: courier,
          tracking_number: trackingNumber,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to update order fulfillment.');
      }

      setOrder(json.data);
      setMessage(`Fulfillment status updated to ${status}.`);
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error updating fulfillment.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-botanical-sage text-xs">
        Loading order inspection details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-white text-sm">Order record not found.</p>
        <Link href="/admin/orders" className="glass-btn-3d px-4 py-2 rounded-xl text-xs font-semibold">
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="glass-btn-3d p-2 rounded-xl text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Order #{order.order_number}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                  order.payment_status === 'VERIFIED'
                    ? 'bg-emerald-400/15 text-emerald-300 border-emerald-500/30'
                    : order.payment_status === 'UNDER_REVIEW'
                    ? 'bg-amber-950/70 text-amber-300 border-amber-500/30'
                    : 'bg-rose-950/70 text-rose-300 border-rose-500/30'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Payment: {order.payment_status}
              </span>
            </div>
            <p className="text-xs text-botanical-sage mt-0.5">Placed on {formatDate(order.created_at)}</p>
          </div>
        </div>

        <Link
          href={`/order/${order.order_number}`}
          target="_blank"
          className="glass-btn-3d inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
        >
          <span>Customer Tracking View</span>
          <ExternalLink className="w-3.5 h-3.5 text-lime" />
        </Link>
      </div>

      {message && (
        <div className="p-4 bg-emerald-400/15 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn shadow-[0_0_12px_rgba(34,197,94,0.2)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <p role="alert" className="rounded-2xl border border-rose-500/40 bg-rose-950/70 p-4 text-xs text-rose-300">
          {errorMessage}
        </p>
      )}

      {/* Manual payment verification */}
      {order.payment_method !== 'COD' && (
        <div className="glass-panel-3d rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2 tracking-tight">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>{order.payment_method === 'wallet_aggregator' ? 'Wallet transfer verification' : 'Bank transfer verification'}</span>
            </h3>
            <span className="text-xs font-bold font-mono text-white">
              Amount to Verify: {formatPKR(order.total_minor)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Receipt Preview */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-botanical-sage uppercase tracking-wider block">
                Uploaded Receipt Screenshot
              </span>
              {order.receipt_path ? (
                <div className="space-y-2">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    {receiptUrl ? (
                      order.receipt_path.endsWith('.pdf') ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                          <ExternalLink className="w-8 h-8 text-lime mb-2" />
                          <span className="text-xs font-semibold text-white">PDF Receipt Document</span>
                        </div>
                      ) : (
                        <img src={receiptUrl} alt="Customer Bank Receipt" className="w-full h-full object-contain" />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-botanical-sage">
                        Loading secure receipt...
                      </div>
                    )}
                  </div>
                  {receiptUrl && (
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-lime hover:underline"
                    >
                      <span>Open Full Receipt</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-white/[0.02] rounded-2xl border border-dashed border-white/10 text-xs text-botanical-sage">
                  {order.payment_method === 'wallet_aggregator' ? 'Check the transaction ID in the order notes against your wallet account.' : 'Customer has not attached a screenshot yet.'}
                </div>
              )}
            </div>

            {/* Approval Controls */}
            <div className="space-y-4">
              <div className="glass-card-3d p-4 rounded-2xl space-y-2 text-xs">
                <p className="text-white/90">
                  <strong className="text-white">Customer:</strong> {order.customer_name} ({order.customer_phone})
                </p>
                <p className="text-white/90">
                  <strong className="text-white">Payment method:</strong> {order.payment_method === 'wallet_aggregator' ? 'JazzCash / Easypaisa' : 'Bank transfer'}
                </p>
                <p className="text-white/90">
                  <strong className="text-white">Total Value:</strong> {formatPKR(order.total_minor)}
                </p>
              </div>

              {order.payment_status === 'UNDER_REVIEW' ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={handleApprovePayment}
                    className="btn-lime-3d flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Payment</span>
                  </button>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={handleRejectPayment}
                    className="glass-btn-3d px-4 py-3 rounded-xl text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              ) : (
                <div className="glass-card-3d p-3 rounded-xl text-xs font-semibold flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Payment has been {order.payment_status}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fulfillment Status Controls & Courier Assignment */}
      <div className="glass-panel-3d rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2 tracking-tight">
          <Truck className="w-5 h-5 text-lime" />
          <span>Fulfillment &amp; Courier Tracking</span>
        </h3>

        <form onSubmit={handleUpdateFulfillment} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-botanical-sage uppercase tracking-wider mb-1">
              Fulfillment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="glass-input-3d w-full px-4 py-2.5 rounded-xl text-xs bg-botanical-dark text-white"
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
            <label className="block text-[11px] font-semibold text-botanical-sage uppercase tracking-wider mb-1">
              Courier Partner
            </label>
            <input
              type="text"
              placeholder="e.g. TCS / Leopards Courier"
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="glass-input-3d w-full px-4 py-2.5 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-botanical-sage uppercase tracking-wider mb-1">
              Tracking Number
            </label>
            <input
              type="text"
              placeholder="e.g. TCS-7729104"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="glass-input-3d w-full px-4 py-2.5 rounded-xl text-xs font-mono"
            />
          </div>

          <div className="sm:col-span-3 pt-2 flex justify-end">
            <button
              type="submit"
              disabled={updating}
              className="btn-lime-3d px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              {updating ? 'Updating...' : 'Save status'}
            </button>
          </div>
        </form>
      </div>

      {/* Customer & Shipping Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel-3d rounded-3xl p-6 space-y-3 text-xs">
          <h4 className="font-serif font-bold text-base text-white">Customer Information</h4>
          <p className="text-white/90">
            <strong className="text-white">Name:</strong> {order.customer_name}
          </p>
          <p className="text-white/90">
            <strong className="text-white">Phone:</strong> {order.customer_phone}
          </p>
          <p className="text-white/90">
            <strong className="text-white">Email:</strong> {order.customer_email}
          </p>
        </div>

        <div className="glass-panel-3d rounded-3xl p-6 space-y-3 text-xs">
          <h4 className="font-serif font-bold text-base text-white">Delivery Address</h4>
          <p className="text-white/90">{order.shipping_address}</p>
          <p className="text-white/90">
            {order.shipping_city}, {order.shipping_province}
          </p>
          {order.shipping_notes && <p className="italic text-botanical-sage">Note: {order.shipping_notes}</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="glass-panel-3d rounded-3xl p-6 space-y-4">
        <h4 className="font-serif font-bold text-base text-white">Ordered Goods</h4>
        <div className="divide-y divide-white/10">
          {order.items?.map((item: any) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white text-xs">{item.name_snapshot}</p>
                <p className="text-botanical-sage font-mono text-[10px] mt-0.5">SKU: {item.sku_snapshot}</p>
              </div>
              <div className="text-right">
                <span className="font-medium font-mono text-white text-xs">{formatPKR(item.line_total_minor)}</span>
                <p className="text-botanical-sage text-[11px]">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-4 flex justify-between text-sm font-bold text-white">
          <span>Total Order Value</span>
          <span className="font-mono text-lime">{formatPKR(order.total_minor)}</span>
        </div>
      </div>
    </div>
  );
}
