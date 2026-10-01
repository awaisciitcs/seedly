import React from 'react';
import { getOrders } from '@/lib/services/orders';
import { isTestOrder } from '@/lib/admin-utils';
import { CustomersTableClient } from '@/components/admin/CustomersTableClient';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
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
      existing.totalSpendMinor += o.total_minor;
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
        totalSpendMinor: o.total_minor,
        lastOrderDate: o.created_at,
        isTest,
      });
    }
  }

  const customers = Array.from(customerMap.values());

  return <CustomersTableClient initialCustomers={customers} />;
}
