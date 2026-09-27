import React from 'react';
import Link from 'next/link';
import { getOrders } from '../../lib/services/orders';
import { getProducts } from '../../lib/services/products';
import { getKits } from '../../lib/services/kits';
import { getDispatchedNotifications } from '../../lib/services/notifications';
import { formatPKR, formatDate } from '../../lib/utils';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Package,
  Layers,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const orders = getOrders();
  const products = getProducts();
  const kits = getKits();
  const notifications = getDispatchedNotifications();

  // Metrics
  const totalSalesMinor = orders
    .filter((o) => ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(o.order_status))
    .reduce((sum, o) => sum + o.total_minor, 0);

  const pendingReceipts = orders.filter(
    (o) => o.payment_method === 'bank_transfer' && o.payment_status === 'UNDER_REVIEW'
  );

  const lowStockProducts = products.flatMap((p) =>
    (p.variants || []).filter((v) => v.inventory_quantity < 35).map((v) => ({ ...v, productName: p.name }))
  );

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Operations Overview</h1>
          <p className="text-xs text-muted-gray mt-1">
            Real-time Pakistan catalog, inventory reservations & fulfillment status.
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

      {/* Pending Bank Review Alert Banner */}
      {pendingReceipts.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-900">
                {pendingReceipts.length} Bank Transfer Receipt{pendingReceipts.length === 1 ? '' : 's'} Awaiting Verification
              </h3>
              <p className="text-xs text-amber-800">
                Customer payment receipts require verification against Meezan Bank statement.
              </p>
            </div>
          </div>
          <Link
            href="/admin/orders?paymentStatus=UNDER_REVIEW"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0"
          >
            Review Receipts Now →
          </Link>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-border-gray shadow-card space-y-2">
          <div className="flex items-center justify-between text-muted-gray text-xs">
            <span>Gross Realized Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">
            {formatPKR(totalSalesMinor)}
          </h2>
          <p className="text-[11px] text-emerald-700 font-medium">All verified orders (PKR)</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-border-gray shadow-card space-y-2">
          <div className="flex items-center justify-between text-muted-gray text-xs">
            <span>Total Orders Placed</span>
            <ShoppingBag className="w-4 h-4 text-seedly-primary" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">{orders.length}</h2>
          <p className="text-[11px] text-muted-gray">Customer & guest checkouts</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-border-gray shadow-card space-y-2">
          <div className="flex items-center justify-between text-muted-gray text-xs">
            <span>Pending Receipts</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">{pendingReceipts.length}</h2>
          <p className="text-[11px] text-amber-700 font-medium">Bank transfer verification queue</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-border-gray shadow-card space-y-2">
          <div className="flex items-center justify-between text-muted-gray text-xs">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">{lowStockProducts.length}</h2>
          <p className="text-[11px] text-rose-600 font-medium">SKUs near replenishment threshold</p>
        </div>
      </div>

      {/* Main Grid: Orders Feed & Kit Bottlenecks */}
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
                No orders placed yet. As orders are placed in the storefront, they appear here instantly.
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

        {/* Right Column: Computed Kit Availability (Bottleneck Component Monitor) */}
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
                    Computed dynamically from {kit.items.length} component seeds.
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
