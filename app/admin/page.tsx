import React from 'react';
import Link from 'next/link';
import { getOrders } from '../../lib/services/orders';
import { getProducts } from '../../lib/services/products';
import { getKits } from '../../lib/services/kits';
import { getAllStockSubscriptions } from '../../lib/services/stockAlerts';
import { formatPKR, formatDate } from '../../lib/utils';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowRight,
  Layers,
  Bell,
  CheckCircle2,
} from 'lucide-react';

function getOrderStatusBadge(status: string) {
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
    case 'VERIFIED':
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

export default async function AdminDashboardPage() {
  const [orders, products, kits, stockAlerts] = await Promise.all([
    getOrders(),
    getProducts(),
    getKits(),
    getAllStockSubscriptions(),
  ]);

  const activeStockAlerts = stockAlerts.filter((s) => s.status === 'ACTIVE');

  // Metrics
  const totalSalesMinor = orders
    .filter((o) => ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(o.order_status))
    .reduce((sum, o) => sum + o.total_minor, 0);

  const pendingReceipts = orders.filter(
    (o) => o.payment_method !== 'COD' && o.payment_status === 'UNDER_REVIEW'
  );

  const lowStockProducts = products.flatMap((p) =>
    (p.variants || []).filter((v: any) => v.inventory_quantity <= 30).map((v: any) => ({ ...v, productName: p.name }))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Top Action CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
            Operations Dashboard
          </h1>
          <p className="text-xs text-botanical-sage mt-1">
            Real-time Pakistan catalog, inventory reservations, order fulfillment &amp; stock alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="btn-lime-3d px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Fulfill Orders</span>
          </Link>
        </div>
      </div>

      {/* Operational Checklist (Action Needed) Hub */}
      <div className="glass-panel-3d rounded-3xl p-5 md:p-6 space-y-4">
        <h3 className="font-serif font-bold text-base text-white flex items-center gap-2.5 tracking-tight">
          <CheckCircle2 className="w-4 h-4 text-lime" />
          <span>Operational Checklist (Action Needed)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Card 1: Payment Reviews */}
          <Link
            href="/admin/orders?paymentStatus=UNDER_REVIEW"
            className="glass-card-3d p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-amber-400/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-white text-xs block">Payment Reviews</span>
                <p className="text-botanical-sage text-[11px]">
                  {pendingReceipts.length} receipts awaiting bank verification
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-botanical-sage group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Card 2: Low Inventory */}
          <Link
            href="/admin/products"
            className="glass-card-3d p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-rose-400/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-white text-xs block">Low Inventory</span>
                <p className="text-botanical-sage text-[11px]">
                  {lowStockProducts.length} items below stock threshold
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-botanical-sage group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Card 3: Back-in-Stock Alerts */}
          <Link
            href="/admin/stock-alerts"
            className="glass-card-3d p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-cyan-400/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0 shadow-[0_0_12px_rgba(20,184,166,0.2)]">
                <Bell className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-white text-xs block">Back-in-Stock Alerts</span>
                <p className="text-botanical-sage text-[11px]">
                  {activeStockAlerts.length} customers waiting for restocks
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-botanical-sage group-hover:text-teal-300 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>

      {/* 4 Metric / KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Gross Sales */}
        <div className="glass-card-3d p-5 rounded-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-botanical-sage text-xs">
            <span>Gross Sales</span>
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_8px_rgba(34,197,94,0.25)]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xs text-botanical-sage mr-1">Rs.</span>
            <h2 className="font-serif text-3xl font-bold text-white tracking-tight inline">
              {formatPKR(totalSalesMinor).replace('Rs. ', '')}
            </h2>
          </div>
          <p className="text-[11px] text-emerald-400/90 font-medium">Realized sales in PKR</p>
        </div>

        {/* KPI 2: Total Orders Placed */}
        <div className="glass-card-3d p-5 rounded-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-botanical-sage text-xs">
            <span>Total Orders Placed</span>
            <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30 shadow-[0_0_8px_rgba(20,184,166,0.25)]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <h2 className="font-serif text-3xl font-bold text-white tracking-tight">
            {orders.length}
          </h2>
          <p className="text-[11px] text-teal-300/80 font-medium">Customer &amp; guest orders</p>
        </div>

        {/* KPI 3: Pending Receipts */}
        <div className="glass-card-3d p-5 rounded-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-botanical-sage text-xs">
            <span>Pending Receipts</span>
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.25)]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h2 className="font-serif text-3xl font-bold text-white tracking-tight">
            {pendingReceipts.length}
          </h2>
          <p className="text-[11px] text-amber-300/80 font-medium">Meezan bank receipts to verify</p>
        </div>

        {/* KPI 4: Stock Alert Subscribers */}
        <div className="glass-card-3d p-5 rounded-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-botanical-sage text-xs">
            <span>Stock Alert Subscribers</span>
            <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.25)]">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <h2 className="font-serif text-3xl font-bold text-white tracking-tight">
            {activeStockAlerts.length}
          </h2>
          <p className="text-[11px] text-rose-300/80 font-medium">Waiting for item restock</p>
        </div>
      </div>

      {/* Main 2-Column Grid: Recent Orders & Kit Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Recent Customer Orders */}
        <div className="lg:col-span-8 glass-panel-3d rounded-3xl p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-serif font-bold text-lg text-white tracking-tight">
              Recent Customer Orders
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-lime hover:underline flex items-center gap-1 transition-colors"
            >
              <span>View All ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-white/[0.08]">
            {orders.length === 0 ? (
              <p className="text-xs text-botanical-sage py-8 text-center">
                No orders placed yet. Orders placed by customers appear here immediately.
              </p>
            ) : (
              orders.slice(0, 5).map((order) => {
                const badge = getOrderStatusBadge(order.order_status);
                return (
                  <div
                    key={order.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-white/[0.03] px-2 rounded-xl transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <strong className="font-mono text-sm font-bold text-white tracking-tight">
                          #{order.order_number}
                        </strong>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-botanical-sage text-[11px]">
                        {order.customer_name} • {order.shipping_city} • {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-medium text-sm text-white font-mono">
                        {formatPKR(order.total_minor)}
                      </span>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="glass-btn-3d px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Computed Kit Availability */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel-3d rounded-3xl p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-serif font-bold text-base text-white flex items-center gap-2 tracking-tight">
                <Layers className="w-4 h-4 text-lime" />
                <span>Kit Availability</span>
              </h3>
              <Link
                href="/admin/kits"
                className="text-xs text-lime hover:underline font-semibold"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {kits.map((kit) => (
                <div
                  key={kit.id}
                  className="glass-card-3d p-4 rounded-2xl space-y-2 border border-white/10"
                >
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <span className="font-semibold text-white/95 leading-tight">{kit.name}</span>
                    <span className="font-mono font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.2)]">
                      {kit.computed_stock} available
                    </span>
                  </div>
                  <div className="text-[11px] text-botanical-sage">
                    From {kit.items.length} component seed stocks
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
