import React from 'react';
import Link from 'next/link';
import { getOrders } from '../../lib/services/orders';
import { getProducts } from '../../lib/services/products';
import { getKits } from '../../lib/services/kits';
import { getDispatchedNotifications } from '../../lib/services/notifications';
import { getAllStockSubscriptions } from '../../lib/services/stockAlerts';
import { formatPKR, formatDate } from '../../lib/utils';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowRight,
  Layers,
  MessageCircle,
  Bell,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const orders = getOrders();
  const products = getProducts();
  const kits = getKits();
  const notifications = getDispatchedNotifications();
  const stockAlerts = getAllStockSubscriptions();
  const activeStockAlerts = stockAlerts.filter((s) => s.status === 'ACTIVE');

  // Metrics
  const totalSalesMinor = orders
    .filter((o) => ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(o.order_status))
    .reduce((sum, o) => sum + o.total_minor, 0);

  const pendingReceipts = orders.filter(
    (o) => o.payment_method === 'bank_transfer' && o.payment_status === 'UNDER_REVIEW'
  );

  const lowStockProducts = products.flatMap((p) =>
    (p.variants || []).filter((v) => v.inventory_quantity <= 30).map((v) => ({ ...v, productName: p.name }))
  );

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Operations Dashboard</h1>
          <p className="text-xs text-muted-gray mt-1">
            Real-time Pakistan catalog, inventory reservations, order fulfillment &amp; stock alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-seedly-dark hover:bg-seedly-forest text-white rounded-xl text-xs font-semibold shadow-subtle flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Fulfill Orders</span>
          </Link>
        </div>
      </div>

      {/* Operational "Action Needed" Hub */}
      <div className="bg-white rounded-3xl p-6 border border-border-gray shadow-card space-y-4">
        <h3 className="font-serif font-bold text-base text-charcoal flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Operational Checklist (Action Needed)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <Link
            href="/admin/orders?paymentStatus=UNDER_REVIEW"
            className="p-4 rounded-2xl bg-cream border border-border-gray hover:border-amber-400 transition-colors flex items-center justify-between group"
          >
            <div className="space-y-1">
              <span className="font-bold text-charcoal flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Payment Reviews</span>
              </span>
              <p className="text-muted-gray">{pendingReceipts.length} receipts awaiting bank verification</p>
            </div>
            <span className="font-bold text-sm text-charcoal group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>

          <Link
            href="/admin/products"
            className="p-4 rounded-2xl bg-cream border border-border-gray hover:border-rose-400 transition-colors flex items-center justify-between group"
          >
            <div className="space-y-1">
              <span className="font-bold text-charcoal flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Low Inventory</span>
              </span>
              <p className="text-muted-gray">{lowStockProducts.length} items below stock threshold</p>
            </div>
            <span className="font-bold text-sm text-charcoal group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>

          <Link
            href="/admin/stock-alerts"
            className="p-4 rounded-2xl bg-cream border border-border-gray hover:border-seedly-primary transition-colors flex items-center justify-between group"
          >
            <div className="space-y-1">
              <span className="font-bold text-charcoal flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-seedly-primary" />
                <span>Back-in-Stock Alerts</span>
              </span>
              <p className="text-muted-gray">{activeStockAlerts.length} customers waiting for restocks</p>
            </div>
            <span className="font-bold text-sm text-charcoal group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-border-gray shadow-card space-y-2">
          <div className="flex items-center justify-between text-muted-gray text-xs">
            <span>Gross Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">
            {formatPKR(totalSalesMinor)}
          </h2>
          <p className="text-[11px] text-emerald-700 font-medium">Realized sales in PKR</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-gray shadow-card space-y-2">
          <div className="flex items-center justify-between text-muted-gray text-xs">
            <span>Total Orders Placed</span>
            <ShoppingBag className="w-4 h-4 text-seedly-primary" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">{orders.length}</h2>
          <p className="text-[11px] text-muted-gray">Customer &amp; guest orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-gray shadow-card space-y-2">
          <div className="flex items-center justify-between text-muted-gray text-xs">
            <span>Pending Receipts</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">{pendingReceipts.length}</h2>
          <p className="text-[11px] text-amber-700 font-medium">Meezan bank receipts to verify</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-gray shadow-card space-y-2">
          <div className="flex items-center justify-between text-muted-gray text-xs">
            <span>Stock Alert Subscribers</span>
            <Bell className="w-4 h-4 text-seedly-primary" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">{activeStockAlerts.length}</h2>
          <p className="text-[11px] text-seedly-dark font-medium">Waiting for item restock</p>
        </div>
      </div>

      {/* Main Grid: Orders Stream & Kit Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Orders Stream */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-border-gray shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-gray/70">
            <h3 className="font-serif font-bold text-lg text-charcoal">Recent Customer Orders</h3>
            <Link href="/admin/orders" className="text-xs font-semibold text-seedly-dark hover:underline">
              View All ({orders.length}) →
            </Link>
          </div>

          <div className="divide-y divide-border-gray/50">
            {orders.length === 0 ? (
              <p className="text-xs text-muted-gray py-8 text-center">
                No orders placed yet. Orders placed by customers appear here immediately.
              </p>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="font-mono text-sm text-charcoal">#{order.order_number}</strong>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          order.order_status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.order_status === 'PAYMENT_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-cream text-charcoal'
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </div>
                    <p className="text-muted-gray">
                      {order.customer_name} • {order.shipping_city} • {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-serif font-bold text-sm text-charcoal">
                      {formatPKR(order.total_minor)}
                    </span>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="px-3 py-1.5 bg-cream hover:bg-seedly-light text-seedly-dark border border-border-gray rounded-lg font-medium"
                    >
                      Inspect
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Computed Kit Availability */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-border-gray shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-gray/70">
              <h3 className="font-serif font-bold text-base text-charcoal flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-seedly-primary" />
                <span>Kit Availability (Bottlenecks)</span>
              </h3>
              <Link href="/admin/kits" className="text-xs text-seedly-dark underline font-medium">
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {kits.map((kit) => (
                <div key={kit.id} className="p-3.5 rounded-2xl bg-cream/40 border border-border-gray space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-charcoal">{kit.name}</span>
                    <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                      {kit.computed_stock} available
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-gray">
                    Computed dynamically from {kit.items.length} component seed stocks.
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outgoing Notification Dispatches */}
          <div className="bg-white rounded-3xl p-6 border border-border-gray shadow-card space-y-4">
            <h3 className="font-serif font-bold text-base text-charcoal flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Notification Dispatch Feed</span>
            </h3>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 text-xs">
              {notifications.length === 0 ? (
                <p className="text-[11px] text-muted-gray">No notifications sent yet.</p>
              ) : (
                notifications.slice(0, 4).map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-cream/50 border border-border-gray space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-700">{n.channel}</span>
                      <span className="text-muted-gray font-mono">{formatDate(n.timestamp)}</span>
                    </div>
                    <p className="font-medium text-charcoal line-clamp-1">{n.subject}</p>
                    <p className="text-[10px] text-muted-gray truncate">{n.recipient}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
