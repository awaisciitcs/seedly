import React from 'react';
import { getOrders } from '@/lib/services/orders';
import { getProducts } from '@/lib/services/products';
import { getKits } from '@/lib/services/kits';
import { getAllStockSubscriptions } from '@/lib/services/stockAlerts';
import { DashboardClient } from '@/components/admin/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [orders, products, kits, stockAlerts] = await Promise.all([
    getOrders(),
    getProducts(),
    getKits(),
    getAllStockSubscriptions(),
  ]);

  return (
    <DashboardClient
      initialOrders={orders}
      initialProducts={products}
      initialKits={kits}
      initialStockAlerts={stockAlerts}
    />
  );
}
