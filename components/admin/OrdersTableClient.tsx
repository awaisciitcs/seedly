'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Order } from '@/lib/types';
import { formatPKR, formatPKTDateTime, isTestOrder } from '@/lib/admin-utils';
import { OrderDrawer } from '@/components/admin/OrderDrawer';
import { PAYMENT_METHOD_LABELS } from '@/lib/order-status';

interface OrdersTableClientProps {
  initialOrders: Order[];
  initialFilter?: string;
  initialPaymentStatus?: string;
}

export function OrdersTableClient({
  initialOrders,
  initialFilter,
  initialPaymentStatus,
}: OrdersTableClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(
    initialPaymentStatus === 'UNDER_REVIEW'
      ? 'review'
      : initialFilter === 'PROCESSING'
      ? 'processing'
      : 'needs_action'
  );
  const [excludeTestOrders, setExcludeTestOrders] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<'created_at' | 'total_minor'>('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  // Filtered & sorted orders
  const displayOrders = useMemo(() => {
    let list = orders.filter((o) => {
      if (excludeTestOrders && isTestOrder(o)) return false;

      // Status tab filters
      if (statusFilter === 'needs_action') {
        const needsReview = o.payment_method !== 'COD' && o.payment_status === 'UNDER_REVIEW';
        const needsPack = o.order_status === 'PAID' || o.order_status === 'RECEIVED';
        if (!needsReview && !needsPack) return false;
      } else if (statusFilter === 'review') {
        if (o.payment_status !== 'UNDER_REVIEW') return false;
      } else if (statusFilter === 'processing') {
        if (o.order_status !== 'PROCESSING' && o.order_status !== 'PACKED') return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNum = (o.order_number || '').toLowerCase().includes(q);
        const matchName = (o.customer_name || '').toLowerCase().includes(q);
        const matchPhone = (o.customer_phone || '').toLowerCase().includes(q);
        const matchCity = (o.shipping_city || '').toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchPhone && !matchCity) return false;
      }

      return true;
    });

    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (sortField === 'created_at') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    return list;
  }, [orders, excludeTestOrders, statusFilter, search, sortField, sortAsc]);

  const handleRowClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDrawerOpen(true);
  };

  const handleOrderUpdated = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const json = await res.json();
        if (json?.data) setOrders(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'City', 'Payment Method', 'Payment Status', 'Fulfillment Status', 'Total PKR'];
    const rows = displayOrders.map((o) => [
      o.order_number,
      formatPKTDateTime(o.created_at).dateOnly,
      `"${o.customer_name}"`,
      `"${o.customer_phone}"`,
      `"${o.shipping_city}"`,
      o.payment_method,
      o.payment_status,
      o.order_status,
      Math.floor(o.total_minor / 100),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `seedly_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Slide-over Order Drawer */}
      <OrderDrawer
        orderId={selectedOrderId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOrderUpdated={handleOrderUpdated}
      />

      {/* Header & Filter Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
            Customer Orders
          </h1>
          <p className="text-xs text-botanical-sage mt-1">
            Manage packaging fulfillment, verify bank receipts, and assign courier tracking.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('needs_action')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
              statusFilter === 'needs_action'
                ? 'btn-keycap text-xs font-bold'
                : 'glass-btn-3d font-medium hover:text-white'
            }`}
          >
            Needs Action
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('review')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
              statusFilter === 'review'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-bold'
                : 'glass-btn-3d text-amber-300/80 hover:text-amber-200 border-amber-500/20 font-medium'
            }`}
          >
            Payments under review
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('processing')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
              statusFilter === 'processing'
                ? 'bg-purple-500/25 text-purple-300 border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.25)] font-bold'
                : 'glass-btn-3d font-medium hover:text-white'
            }`}
          >
            Processing &amp; Packing
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white/20 text-white font-bold border border-white/20'
                : 'glass-btn-3d font-medium hover:text-white'
            }`}
          >
            All Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* Main Glass Table Container */}
      <div className="glass p-5 md:p-6 space-y-4 border border-white/10">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-botanical-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, phone, customer name..."
              className="glass-input-3d w-full pl-10 pr-4 py-2 rounded-2xl text-xs placeholder:text-botanical-sage/60"
            />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Test Orders Filter Toggle */}
            <label className="flex items-center gap-2 text-xs text-botanical-sage cursor-pointer select-none">
              <input
                type="checkbox"
                checked={excludeTestOrders}
                onChange={(e) => setExcludeTestOrders(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-white/10 border-white/20 text-lime focus:ring-0"
              />
              <span className="hidden sm:inline">Hide Test Orders</span>
            </label>

            <button
              type="button"
              onClick={handleExportCSV}
              className="glass-btn-3d px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-botanical-sage" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
          <table className="w-full text-left text-xs min-w-[840px]">
            <thead>
              <tr className="border-b border-white/10 text-botanical-sage text-[11px] uppercase tracking-wider font-semibold">
                <th
                  className="py-3.5 px-4 font-semibold cursor-pointer select-none hover:text-white"
                  onClick={() => {
                    setSortField('created_at');
                    setSortAsc(!sortAsc);
                  }}
                >
                  ORDER # {sortField === 'created_at' && (sortAsc ? '↑' : '↓')}
                </th>
                <th className="py-3.5 px-4 font-semibold">CUSTOMER</th>
                <th className="py-3.5 px-4 font-semibold">CITY</th>
                <th className="py-3.5 px-4 font-semibold">METHOD</th>
                <th className="py-3.5 px-4 font-semibold">PAYMENT</th>
                <th className="py-3.5 px-4 font-semibold">FULFILLMENT</th>
                <th
                  className="py-3.5 px-4 font-semibold cursor-pointer select-none hover:text-white"
                  onClick={() => {
                    setSortField('total_minor');
                    setSortAsc(!sortAsc);
                  }}
                >
                  TOTAL (PKR) {sortField === 'total_minor' && (sortAsc ? '↑' : '↓')}
                </th>
                <th className="py-3.5 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {displayOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-botanical-sage text-xs">
                    No orders found matching the selected filter or search term.
                  </td>
                </tr>
              ) : (
                displayOrders.map((o) => {
                  const isTest = isTestOrder(o);
                  const cleanPhone = (o.customer_phone || '').replace(/[^0-9]/g, '');
                  const waNum = cleanPhone.startsWith('92')
                    ? cleanPhone
                    : `92${cleanPhone.replace(/^0+/, '')}`;

                  const methodLabel =
                    PAYMENT_METHOD_LABELS[o.payment_method as keyof typeof PAYMENT_METHOD_LABELS] ||
                    o.payment_method;

                  return (
                    <tr
                      key={o.id}
                      onClick={() => handleRowClick(o.id)}
                      className="group hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      {/* Order Number & Test Badge */}
                      <td className="py-4 px-4 font-mono font-bold text-white whitespace-nowrap">
                        <div className="group-hover:text-lime transition-colors">
                          #{o.order_number}
                        </div>
                        <div className="text-[10px] text-botanical-sage font-sans font-normal mt-0.5">
                          {formatPKTDateTime(o.created_at).dateOnly} ({formatPKTDateTime(o.created_at).relative})
                        </div>
                        {isTest && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-400 border border-amber-500/30">
                            TEST
                          </span>
                        )}
                      </td>

                      {/* Customer Cell */}
                      <td className="py-4 px-4">
                        <p className="font-semibold text-white whitespace-nowrap">
                          {o.customer_name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-botanical-sage font-mono mt-0.5">
                          <span>{o.customer_phone}</span>
                          {o.customer_phone && (
                            <a
                              href={`https://wa.me/${waNum}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-400/70 hover:text-emerald-300"
                              title="Message via WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3 fill-current" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* City */}
                      <td className="py-4 px-4 text-white/90 whitespace-nowrap">{o.shipping_city}</td>

                      {/* Payment Method */}
                      <td className="py-4 px-4 text-white/80 whitespace-nowrap text-xs">
                        {methodLabel}
                      </td>

                      {/* Payment Status Chip */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`status-chip ${
                            o.payment_status === 'VERIFIED'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                              : o.payment_status === 'UNDER_REVIEW'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40 animate-pulse'
                              : 'bg-white/10 text-white/70 border border-white/15'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              o.payment_status === 'VERIFIED'
                                ? 'bg-emerald-400'
                                : o.payment_status === 'UNDER_REVIEW'
                                ? 'bg-amber-400'
                                : 'bg-white/50'
                            }`}
                          />
                          <span>{o.payment_status}</span>
                        </span>
                      </td>

                      {/* Fulfillment Status Chip */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`status-chip ${
                            o.order_status === 'DELIVERED'
                              ? 'bg-teal-950/80 text-teal-300 border border-teal-500/40'
                              : o.order_status === 'SHIPPED'
                              ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                              : o.order_status === 'PACKED'
                              ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                              : o.order_status === 'PAID'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                              : 'bg-white/10 text-white/70 border border-white/15'
                          }`}
                        >
                          <span>{o.order_status}</span>
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 font-serif font-bold text-white whitespace-nowrap num-lining">
                        {formatPKR(o.total_minor)}
                      </td>

                      {/* Primary Contextual Action */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {o.payment_status === 'UNDER_REVIEW' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(o.id);
                            }}
                            className="btn-keycap py-1.5 px-3 text-xs font-bold gap-1 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify Receipt</span>
                          </button>
                        ) : o.order_status === 'PAID' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(o.id);
                            }}
                            className="btn-keycap py-1.5 px-3 text-xs font-bold gap-1 cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Mark Packed</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(o.id);
                            }}
                            className="glass-btn-3d py-1.5 px-3 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            <span>Inspect</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs text-botanical-sage">
          <p>
            Showing {displayOrders.length} of {orders.length} orders
          </p>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled
              className="glass-btn-3d p-1.5 rounded-lg opacity-40 cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 h-7 rounded-lg bg-lime text-botanical-deep font-bold flex items-center justify-center text-xs shadow-[0_0_10px_rgba(183,228,89,0.4)]">
              1
            </span>
            <button
              type="button"
              disabled
              className="glass-btn-3d p-1.5 rounded-lg opacity-40 cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
