import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { updateOrderStatus } from '@/lib/services/orders';
import { OrderStatusError } from '@/lib/order-status';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdmin();
    const { id } = await props.params;
    const body = await request.json();
    const { status, courier, tracking_number, note } = body;

    if (!status) {
      return NextResponse.json({ error: { message: 'Status is required' } }, { status: 400 });
    }

    const updated = await updateOrderStatus(id, status, courier, tracking_number, note, adminSession.admin.id);
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json(
      { error: { message: error.message } },
      { status: error instanceof OrderStatusError ? 400 : 500 }
    );
  }
}
