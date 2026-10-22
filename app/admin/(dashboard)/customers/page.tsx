import React from 'react';
import { requireAdminOrRedirect } from '@/lib/auth/require-admin';
import { getOrders } from '@/lib/services/orders';
import { isTestOrder } from '@/lib/admin-utils';
import { isConfirmedOrder } from '@/lib/admin-metrics';
import { CustomersTableClient } from '@/components/admin/CustomersTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCustomersPage() {
  await requireAdminOrRedirect();

  const orders = await getOrders();

  // Aggregate customers from orders
  const customerMap = new Map<
    string,
    {
      name: string;
      email: string;
      phone: string;
      city: string;
      orderCount: number;
      totalSpendMinor: number;
      lastOrderDate: string;
      isTest: boolean;
    }
  >();

  for (const o of orders) {
    const key = (o.customer_email || o.customer_phone || o.customer_name).toLowerCase();
    const isTest = isTestOrder(o);
    const existing = customerMap.get(key);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpendMinor += isConfirmedOrder(o) ? o.total_minor : 0;
      if (new Date(o.created_at) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = o.created_at;
      }
      if (isTest) existing.isTest = true;
    } else {
      customerMap.set(key, {
        name: o.customer_name,
        email: o.customer_email,
        phone: o.customer_phone,
        city: o.shipping_city,
        orderCount: 1,
        totalSpendMinor: isConfirmedOrder(o) ? o.total_minor : 0,
        lastOrderDate: o.created_at,
        isTest,
      });
    }
  }

  const customers = Array.from(customerMap.values());

  return <CustomersTableClient initialCustomers={customers} />;
}
