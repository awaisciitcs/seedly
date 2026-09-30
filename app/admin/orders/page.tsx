import React from 'react';
import Link from 'next/link';
import { getOrders } from '../../../lib/services/orders';
import { PAYMENT_METHOD_LABELS } from '../../../lib/order-status';
import { formatPKR, formatDate } from '../../../lib/utils';
import { Search, Eye, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

function getPaymentBadge(status: string) {
  switch (status?.toUpperCase()) {
    case 'VERIFIED':
    case 'PAID':
      return {
        bg: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(34,197,94,0.2)]',
        dot: 'bg-emerald-400',
        label: 'VERIFIED',
      };
    case 'UNDER_REVIEW':
      return {
        bg: 'bg-amber-950/70 text-amber-300 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
        dot: 'bg-amber-400',
        label: 'PENDING',
      };
    case 'REJECTED':
      return {
        bg: 'bg-rose-950/70 text-rose-300 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]',
        dot: 'bg-rose-400',
        label: 'REJECTED',
      };
    default:
      return {
        bg: 'bg-rose-950/70 text-rose-300 border-rose-500/30',
        dot: 'bg-rose-400',
        label: 'PENDING',
      };
  }
}

function getFulfillmentBadge(status: string) {
  switch (status?.toUpperCase()) {
    case 'RECEIVED':
      return {
        bg: 'bg-teal-950/70 text-teal-300 border-teal-500/30 shadow-[0_0_8px_rgba(45,212,191,0.2)]',
        dot: 'bg-teal-400',
        label: 'RECEIVED',
      };
    case 'PROCESSING':
      return {
        bg: 'bg-amber-950/70 text-amber-300 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
        dot: 'bg-amber-400',
        label: 'PROCESSING',
      };
    case 'PAID':
      return {
        bg: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(34,197,94,0.2)]',
        dot: 'bg-emerald-400',
        label: 'PAID',
      };
    case 'PACKED':
      return {
        bg: 'bg-purple-950/70 text-purple-300 border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.2)]',
        dot: 'bg-purple-400',
        label: 'PACKED',
      };
    case 'SHIPPED':
    case 'DELIVERED':
      return {
        bg: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(34,197,94,0.2)]',
        dot: 'bg-emerald-400',
        label: status.toUpperCase(),
      };
    default:
      return {
        bg: 'bg-white/10 text-white/90 border-white/20',
        dot: 'bg-white/60',
        label: status || 'PENDING',
      };
  }
}

export default async function AdminOrdersPage(props: {
  searchParams: Promise<{ paymentStatus?: string; status?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const paymentStatus = searchParams.paymentStatus;
  const status = searchParams.status;
  const search = searchParams.search;

  const orders = await getOrders({
    paymentStatus,
    status,
    search,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
          <Link
            href="/admin/orders"
            className={`px-4 py-1.5 rounded-full text-xs transition-all ${
              !paymentStatus && !status
                ? 'btn-lime-3d font-bold'
                : 'glass-btn-3d font-medium hover:text-white'
            }`}
          >
            All Orders ({orders.length})
          </Link>

          <Link
            href="/admin/orders?paymentStatus=UNDER_REVIEW"
            className={`px-4 py-1.5 rounded-full text-xs transition-all ${
              paymentStatus === 'UNDER_REVIEW'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-bold'
                : 'glass-btn-3d text-amber-300/80 hover:text-amber-200 border-amber-500/20 font-medium'
            }`}
          >
            Payments under review
          </Link>

          <Link
            href="/admin/orders?status=PROCESSING"
            className={`px-4 py-1.5 rounded-full text-xs transition-all ${
              status === 'PROCESSING'
                ? 'bg-purple-500/25 text-purple-300 border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.25)] font-bold'
                : 'glass-btn-3d font-medium hover:text-white'
            }`}
          >
            Processing &amp; Packing
          </Link>
        </div>
      </div>

      {/* Main Glass Table Container */}
      <div className="glass-panel-3d rounded-3xl p-5 md:p-6 space-y-4">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-botanical-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search orders, customers, order #..."
              defaultValue={search || ''}
              className="glass-input-3d w-full pl-10 pr-4 py-2 rounded-2xl text-xs placeholder:text-botanical-sage/60"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              className="glass-btn-3d px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5 text-botanical-sage" />
              <span>Filter</span>
            </button>
            <button
              type="button"
              className="glass-btn-3d px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-botanical-sage" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10 text-botanical-sage text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 font-semibold">ORDER #</th>
                <th className="py-3.5 px-4 font-semibold">CUSTOMER</th>
                <th className="py-3.5 px-4 font-semibold">CITY</th>
                <th className="py-3.5 px-4 font-semibold">METHOD</th>
                <th className="py-3.5 px-4 font-semibold">PAYMENT</th>
                <th className="py-3.5 px-4 font-semibold">FULFILLMENT</th>
                <th className="py-3.5 px-4 font-semibold">TOTAL (PKR)</th>
                <th className="py-3.5 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-botanical-sage text-xs">
                    No orders found matching the selected filter.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const payBadge = getPaymentBadge(o.payment_status);
                  const fulBadge = getFulfillmentBadge(o.order_status);
                  const methodLabel = PAYMENT_METHOD_LABELS[o.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || o.payment_method;

                  return (
                    <tr key={o.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-white whitespace-nowrap">
                        #{o.order_number}
                        <p className="text-[10px] text-botanical-sage font-sans font-normal mt-0.5">
                          {formatDate(o.created_at)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-white whitespace-nowrap">{o.customer_name}</p>
                        <p className="text-[11px] text-botanical-sage font-mono mt-0.5">{o.customer_phone}</p>
                      </td>
                      <td className="py-4 px-4 text-white/90 whitespace-nowrap">{o.shipping_city}</td>
                      <td className="py-4 px-4 text-white/80 whitespace-nowrap">
                        {methodLabel}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${payBadge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${payBadge.dot}`} />
                          {payBadge.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${fulBadge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${fulBadge.dot}`} />
                          {fulBadge.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-white whitespace-nowrap">
                        {formatPKR(o.total_minor)}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="glass-btn-3d inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-lime" />
                          <span>Inspect</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs text-botanical-sage">
          <p>
            Showing 1–{orders.length} of {orders.length} orders
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
