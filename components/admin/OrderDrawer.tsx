'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ZoomIn,
  Truck,
  MessageCircle,
  FileText,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { formatPKR, formatPKTDateTime } from '@/lib/admin-utils';

export function OrderDrawer({
  orderId,
  isOpen,
  onClose,
  onOrderUpdated,
}: {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [bankReference, setBankReference] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptZoomed, setReceiptZoomed] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [note, setNote] = useState('');

  // Fetch full order when opened
  useEffect(() => {
    if (!orderId || !isOpen) return;

    let isCurrent = true;
    setLoading(true);
    setReceiptUrl(null);
    setBankReference('');

    async function fetchOrderDetails() {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`);
        if (res.ok) {
          const json = await res.json();
          if (isCurrent && json?.data) {
            const ord = json.data;
            setOrder(ord);
            setNote(ord.admin_note || '');

            // Fetch secure signed receipt URL if order has a receipt
            if (ord.receipt_path) {
              try {
                const recRes = await fetch(`/api/admin/receipts?path=${encodeURIComponent(ord.receipt_path)}`);
                if (recRes.ok) {
                  const recJson = await recRes.json();
                  if (recJson?.url && isCurrent) {
                    setReceiptUrl(recJson.url);
                  }
                }
              } catch (e) {
                console.error('Failed to load receipt signed url:', e);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch order in drawer:', err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    fetchOrderDetails();
    return () => {
      isCurrent = false;
    };
  }, [orderId, isOpen]);

  // Handle Verify / Approve Payment
  const handleApprovePayment = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/payment/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankReference: bankReference.trim() || undefined,
          adminNote: note.trim() || undefined,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setOrder(json.data);
        if (onOrderUpdated) onOrderUpdated();
      } else {
        const err = await res.json();
        alert(err.error?.message || 'Failed to approve payment');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while approving payment');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Payment
  const handleRejectPayment = async () => {
    if (!order) return;
    const reason = prompt('Please enter the reason for rejecting this payment:');
    if (!reason) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/payment/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        const json = await res.json();
        setOrder(json.data);
        if (onOrderUpdated) onOrderUpdated();
      } else {
        const err = await res.json();
        alert(err.error?.message || 'Failed to reject payment');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while rejecting payment');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Status Update (e.g. PACKED, SHIPPED)
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const json = await res.json();
        setOrder(json.data);
        if (onOrderUpdated) onOrderUpdated();
      } else {
        const err = await res.json();
        alert(err.error?.message || `Failed to update status to ${newStatus}`);
      }
    } catch (e) {
      console.error(e);
      alert('Network error while updating status');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  // Clean WhatsApp number
  const cleanPhone = (order?.customer_phone || '').replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.startsWith('92') ? cleanPhone : `92${cleanPhone.replace(/^0+/, '')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dim Scrim */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[3px] transition-opacity duration-240"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className="glass w-screen max-w-2xl rounded-l-3xl p-6 flex flex-col justify-between overflow-y-auto border-l border-white/20 transition-transform duration-240"
          data-elev="overlay"
          onClick={(e) => e.stopPropagation()}
        >
          {loading || !order ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-lime animate-spin" />
              <p className="text-xs text-botanical-sage">Loading order details...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
                      #{order.order_number}
                    </h2>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
                      {order.payment_method === 'COD' ? 'Cash on Delivery' : 'Meezan Bank Transfer'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-botanical-sage">
                    <Clock className="w-3.5 h-3.5 text-lime" />
                    <span>{formatPKTDateTime(order.created_at).absolute}</span>
                    <span>•</span>
                    <span>{formatPKTDateTime(order.created_at).relative}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    target="_blank"
                    className="p-2 rounded-xl glass-inset text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    title="Open Full Page Inspection"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-xl glass-inset text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Customer Contact & Delivery Info */}
              <div className="glass-inset rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{order.customer_name}</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                      GUEST ORDER
                    </span>
                  </div>

                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                      `Salam ${order.customer_name}, regarding your Seedly order #${order.order_number}:`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 text-botanical-sage">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-lime shrink-0" />
                    <span className="font-mono text-white/90">{order.customer_phone}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(order.customer_phone);
                        setCopiedPhone(true);
                        setTimeout(() => setCopiedPhone(false), 2000);
                      }}
                      className="text-white/40 hover:text-white"
                      title="Copy phone"
                    >
                      {copiedPhone ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-lime shrink-0" />
                    <span className="truncate text-white/90">{order.customer_email}</span>
                  </div>
                  <div className="sm:col-span-2 flex items-start gap-2 pt-1 border-t border-white/5">
                    <MapPin className="w-3.5 h-3.5 text-lime shrink-0 mt-0.5" />
                    <span className="text-white/80">
                      {order.shipping_address}, {order.shipping_city}, {order.shipping_province}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bank Transfer Receipt Verification Section (High-Risk Flow) */}
              {order.payment_method !== 'COD' && (
                <div className="glass-recessed rounded-2xl p-4 space-y-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-lime" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Bank Receipt Proof
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        order.payment_status === 'VERIFIED'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-950/80 text-amber-400 border border-amber-500/40 animate-pulse'
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Receipt Preview Image */}
                    <div className="space-y-2">
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center group">
                        {receiptUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={receiptUrl}
                            alt="Bank transfer payment receipt proof"
                            className={`w-full h-full object-contain cursor-pointer transition-transform ${
                              receiptZoomed ? 'scale-150' : 'group-hover:scale-105'
                            }`}
                            onClick={() => setReceiptZoomed(!receiptZoomed)}
                          />
                        ) : order.receipt_path ? (
                          <div className="text-center p-4">
                            <FileText className="w-8 h-8 text-botanical-sage mx-auto mb-1" />
                            <p className="text-[11px] text-botanical-sage">Receipt recorded in storage</p>
                          </div>
                        ) : (
                          <div className="text-center p-4">
                            <AlertTriangle className="w-8 h-8 text-amber-400/60 mx-auto mb-1" />
                            <p className="text-[11px] text-amber-200/80">No receipt file uploaded yet</p>
                          </div>
                        )}
                        {receiptUrl && (
                          <button
                            type="button"
                            onClick={() => setReceiptZoomed(!receiptZoomed)}
                            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 text-white/80 hover:text-white"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right: Amount Match & Verification Inputs */}
                    <div className="space-y-3 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="glass-inset p-3 rounded-xl space-y-1">
                          <span className="text-[10px] text-botanical-sage uppercase font-medium">
                            Expected Amount to Match
                          </span>
                          <div className="font-serif text-2xl font-bold text-white num-lining">
                            {formatPKR(order.total_minor)}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-botanical-sage">
                            Bank Reference / Transaction ID:
                          </label>
                          <input
                            type="text"
                            value={bankReference}
                            onChange={(e) => setBankReference(e.target.value)}
                            placeholder="e.g. PK26MEZN00192837..."
                            className="glass-input-3d w-full px-3 py-2 rounded-xl text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-botanical-sage">Admin Audit Note:</label>
                          <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Optional note e.g. Verified on Meezan portal"
                            className="glass-input-3d w-full px-3 py-2 rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      {order.payment_status === 'UNDER_REVIEW' && (
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleApprovePayment}
                            disabled={actionLoading}
                            className="btn-keycap flex-1 py-2.5 px-3 text-xs font-bold gap-1.5"
                          >
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            <span>Approve Payment</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleRejectPayment}
                            disabled={actionLoading}
                            className="glass-btn-3d py-2.5 px-3 rounded-xl text-xs font-bold text-rose-300 hover:text-white hover:bg-rose-500/20 gap-1.5 flex items-center"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items Breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-botanical-sage">
                  Purchased Items ({order.items?.length || 0})
                </span>

                <div className="space-y-2">
                  {(order.items || []).map((it) => (
                    <div
                      key={it.id}
                      className="glass-inset p-3 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-white">{it.name_snapshot}</div>
                        <div className="text-[11px] text-botanical-sage font-mono">
                          SKU: {it.sku_snapshot} · Qty: {it.quantity}
                        </div>
                      </div>
                      <div className="font-bold text-white num-lining">
                        {formatPKR(it.line_total_minor)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="glass-inset p-3.5 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-botanical-sage">
                    <span>Subtotal:</span>
                    <span className="num-lining">{formatPKR(order.subtotal_minor)}</span>
                  </div>
                  <div className="flex justify-between text-botanical-sage">
                    <span>Delivery Charges:</span>
                    <span className="num-lining">
                      {order.shipping_minor === 0 ? 'FREE' : formatPKR(order.shipping_minor)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                    <span>Total Amount:</span>
                    <span className="text-lime num-lining">{formatPKR(order.total_minor)}</span>
                  </div>
                </div>
              </div>

              {/* Fulfillment Actions */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-botanical-sage">
                  Fulfillment Status: {order.order_status}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {order.order_status === 'PAID' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange('PACKED')}
                      disabled={actionLoading}
                      className="btn-keycap py-2 px-4 text-xs font-bold gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Mark as Packed</span>
                    </button>
                  )}
                  {order.order_status === 'PACKED' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange('SHIPPED')}
                      disabled={actionLoading}
                      className="btn-keycap py-2 px-4 text-xs font-bold gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch &amp; Ship</span>
                    </button>
                  )}
                  {order.order_status === 'SHIPPED' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange('DELIVERED')}
                      disabled={actionLoading}
                      className="btn-keycap py-2 px-4 text-xs font-bold gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Delivered</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
