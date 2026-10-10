import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { getOrderById, getOrder } from '@/lib/services/orders';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await props.params;
    let order = await getOrderById(id);
    if (!order) {
      order = await getOrder(id);
    }

    if (!order) {
      return NextResponse.json({ error: { message: 'Order not found' } }, { status: 404 });
    }

    return NextResponse.json({ data: order });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
