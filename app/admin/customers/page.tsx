import React from 'react';
import { getOrders } from '../../../lib/services/orders';
import { formatPKR, formatDate } from '../../../lib/utils';
import { Users, Mail, Phone, ShoppingBag } from 'lucide-react';

export default function AdminCustomersPage() {
  const orders = getOrders();

  // Aggregate customers from orders
  const customerMap = new Map<string, {
    name: string;
    email: string;
    phone: string;
    city: string;
    orderCount: number;
    totalSpendMinor: number;
    lastOrderDate: string;
  }>();

  for (const o of orders) {
    const key = o.customer_email.toLowerCase();
    const existing = customerMap.get(key);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpendMinor += o.total_minor;
      if (new Date(o.created_at) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = o.created_at;
      }
    } else {
      customerMap.set(key, {
        name: o.customer_name,
        email: o.customer_email,
        phone: o.customer_phone,
        city: o.shipping_city,
        orderCount: 1,
        totalSpendMinor: o.total_minor,
        lastOrderDate: o.created_at,
      });
    }
  }

  const customers = Array.from(customerMap.values());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Customer Directory</h1>
        <p className="text-xs text-muted-gray mt-1">
          Inspect customer order frequency, total lifetime spend, and contact channels.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-border-gray shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream/60 border-b border-border-gray text-muted-gray uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Contact Channels</th>
                <th className="py-4 px-6">Primary City</th>
                <th className="py-4 px-6">Total Orders</th>
                <th className="py-4 px-6">Lifetime Value (PKR)</th>
                <th className="py-4 px-6">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-gray/50">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-gray">
                    No customer records yet. Customers are cataloged automatically as orders are placed.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.email} className="hover:bg-cream/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-charcoal text-sm">{c.name}</td>
                    <td className="py-4 px-6 space-y-0.5 text-muted-gray">
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-seedly-primary" />
                        <span>{c.email}</span>
                      </p>
                      <p className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{c.phone}</span>
                      </p>
                    </td>
                    <td className="py-4 px-6 font-medium text-charcoal">{c.city}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full bg-cream font-mono font-bold text-charcoal">
                        {c.orderCount} order{c.orderCount === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-serif font-bold text-sm text-seedly-dark">
                      {formatPKR(c.totalSpendMinor)}
                    </td>
                    <td className="py-4 px-6 text-muted-gray">{formatDate(c.lastOrderDate)}</td>
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
