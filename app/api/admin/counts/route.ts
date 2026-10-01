import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { getOrders } from '@/lib/services/orders';
import { getProducts } from '@/lib/services/products';
import { getAllStockSubscriptions } from '@/lib/services/stockAlerts';
import { getQueueAge } from '@/lib/admin-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    const [orders, products, stockAlerts] = await Promise.all([
      getOrders(),
      getProducts(),
      getAllStockSubscriptions(),
    ]);

    const pendingReceiptOrders = orders.filter(
      (o) => o.payment_method !== 'COD' && o.payment_status === 'UNDER_REVIEW'
    );

    const ordersToPack = orders.filter(
      (o) => (o.order_status === 'PAID' || o.order_status === 'PROCESSING')
    );

    const lowStockVariants = products.flatMap((p) =>
      (p.variants || []).filter((v: any) => v.inventory_quantity <= 30)
    );

    const activeAlerts = stockAlerts.filter((s) => s.status === 'ACTIVE');

    // Find oldest pending receipt
    let oldestReceiptAge: string | null = null;
    let oldestReceiptDate: string | null = null;
    if (pendingReceiptOrders.length > 0) {
      const sorted = [...pendingReceiptOrders].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      oldestReceiptDate = sorted[0].created_at;
      oldestReceiptAge = getQueueAge(sorted[0].created_at);
    }

    return NextResponse.json({
      data: {
        pendingReceiptsCount: pendingReceiptOrders.length,
        oldestReceiptAge,
        oldestReceiptDate,
        ordersToPackCount: ordersToPack.length,
        lowStockCount: lowStockVariants.length,
        stockAlertsCount: activeAlerts.length,
        totalOrdersCount: orders.length,
      },
    });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: error?.message || 'Server error' } }, { status: 500 });
  }
}
