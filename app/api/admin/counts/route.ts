import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { getScopedClient } from '@/lib/supabase/admin';
import { getQueueAge } from '@/lib/admin-utils';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    await requireAdmin();
    const client = await getScopedClient();
    // Exact HEAD counts do not download customer records or stop at the REST row cap.
    const [receipts, packing, stock, alerts, total, oldest] = await Promise.all([
      client.from('orders').select('id', { count: 'exact', head: true }).neq('payment_method', 'COD').eq('payment_status', 'UNDER_REVIEW'),
      client.from('orders').select('id', { count: 'exact', head: true }).or('order_status.in.(PAID,PROCESSING),and(payment_method.eq.COD,order_status.eq.RECEIVED)'),
      client.from('product_variants').select('id,products!inner(status)', { count: 'exact', head: true }).eq('status', 'ACTIVE').eq('products.status', 'ACTIVE').lte('inventory_quantity', 30),
      client.from('stock_alert_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      client.from('orders').select('id', { count: 'exact', head: true }),
      client.from('orders').select('created_at').neq('payment_method', 'COD').eq('payment_status', 'UNDER_REVIEW').order('created_at', { ascending: true }).limit(1),
    ]);
    if ([receipts, packing, stock, alerts, total, oldest].some(result => result.error) ||
      [receipts, packing, stock, alerts, total].some(result => !Number.isSafeInteger(result.count))) {
      throw new Error('Queue counts unavailable.');
    }
    const oldestReceiptDate = oldest.data?.[0]?.created_at || null;
    return NextResponse.json({ data: {
      pendingReceiptsCount: receipts.count, oldestReceiptDate,
      oldestReceiptAge: oldestReceiptDate ? getQueueAge(oldestReceiptDate) : null,
      ordersToPackCount: packing.count, lowStockCount: stock.count,
      stockAlertsCount: alerts.count, totalOrdersCount: total.count,
    } });
  } catch (error) {
    return NextResponse.json({ error: { message: error instanceof AdminAuthError ? error.message : 'Queue counts are temporarily unavailable. Please try again.' } },
      { status: error instanceof AdminAuthError ? error.status : 503 });
  }
}
