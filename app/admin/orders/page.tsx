import React from 'react';
import Link from 'next/link';
import { getOrders } from '../../../lib/services/orders';
import { PAYMENT_METHOD_LABELS } from '../../../lib/order-status';
import { formatPKR, formatDate } from '../../../lib/utils';
import { ShoppingBag, Search, Eye, Filter } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Customer Orders</h1>
          <p className="text-xs text-muted-gray mt-1">
            Manage packaging fulfillment, verify bank receipts, and assign courier tracking.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/orders"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              !paymentStatus && !status ? 'bg-seedly-dark text-white' : 'bg-white text-charcoal border border-border-gray'
            }`}
          >
            All Orders ({orders.length})
          </Link>
          <Link
            href="/admin/orders?paymentStatus=UNDER_REVIEW"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              paymentStatus === 'UNDER_REVIEW'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-amber-800 border border-amber-300'
            }`}
          >
            Payments under review
          </Link>
          <Link
            href="/admin/orders?status=PROCESSING"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              status === 'PROCESSING' ? 'bg-seedly-dark text-white' : 'bg-white text-charcoal border border-border-gray'
            }`}
          >
            Processing & Packing
          </Link>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-border-gray shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream/60 border-b border-border-gray text-muted-gray uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-4 px-6">Order #</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">City</th>
                <th className="py-4 px-6">Method</th>
                <th className="py-4 px-6">Payment</th>
                <th className="py-4 px-6">Fulfillment</th>
                <th className="py-4 px-6">Total (PKR)</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-gray/50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-gray">
                    No orders found matching the selected filter.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-cream/30 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-charcoal">
                      #{o.order_number}
                      <p className="text-[10px] text-muted-gray font-sans font-normal">
                        {formatDate(o.created_at)}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-charcoal">{o.customer_name}</p>
                      <p className="text-[11px] text-muted-gray">{o.customer_phone}</p>
                    </td>
                    <td className="py-4 px-6 text-charcoal">{o.shipping_city}</td>
                    <td className="py-4 px-6 capitalize">
                      {PAYMENT_METHOD_LABELS[o.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || o.payment_method}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          o.payment_status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.payment_status === 'UNDER_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          o.order_status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.order_status === 'SHIPPED'
                            ? 'bg-indigo-100 text-indigo-800'
                            : o.order_status === 'DELIVERED'
                            ? 'bg-emerald-700 text-white'
                            : 'bg-cream text-charcoal'
                        }`}
                      >
                        {o.order_status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-serif font-bold text-sm text-charcoal">
                      {formatPKR(o.total_minor)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-seedly-light hover:bg-seedly-dark hover:text-white text-seedly-dark rounded-lg font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
