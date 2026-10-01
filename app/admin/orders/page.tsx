import React from 'react';
import { getOrders } from '@/lib/services/orders';
import { OrdersTableClient } from '@/components/admin/OrdersTableClient';

export const dynamic = 'force-dynamic';

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
    <OrdersTableClient
      initialOrders={orders}
      initialFilter={status}
      initialPaymentStatus={paymentStatus}
    />
  );
}
