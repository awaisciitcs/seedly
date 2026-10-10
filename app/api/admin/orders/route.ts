import { readAdminJson, AdminInputError, adminId, adminText, adminEnum } from '@/lib/admin-validation';
import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { ORDER_STATUSES } from '@/lib/order-status';
import { getOrders } from '@/lib/services/orders';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get('paymentStatus') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    if (status) adminEnum(status,ORDER_STATUSES,'order status');
    if (paymentStatus) adminEnum(paymentStatus,['PENDING','UNDER_REVIEW','VERIFIED','PAID','REJECTED','FAILED','REFUNDED'],'payment status');
    const orders = await getOrders({ paymentStatus, status, search });
    return NextResponse.json({ data: orders });
  } catch (error: any) {
    if (error instanceof AdminAuthError || error instanceof AdminInputError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: 'This operation is temporarily unavailable. Please try again.' } }, { status: 503 });
  }
}
