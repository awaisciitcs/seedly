import { scheduleOrderEmails } from '@/lib/email/schedule';
import { readAdminJson, AdminInputError, adminId, adminText } from '@/lib/admin-validation';
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
    adminId(id, 'order ID');
    const body = await readAdminJson(request);
    const { status, courier, tracking_number, note } = body;
    if (courier !== undefined) adminText(courier, 'Courier', 100);
    if (tracking_number !== undefined) adminText(tracking_number, 'Tracking number', 160);
    if (note !== undefined) adminText(note, 'Note', 2000);

    if (!status) {
      return NextResponse.json({ error: { message: 'Status is required' } }, { status: 400 });
    }

    const updated = await updateOrderStatus(id, status, courier, tracking_number, note, adminSession.admin.id);
    scheduleOrderEmails();
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    if (error instanceof AdminAuthError || error instanceof AdminInputError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json(
      { error: { message: error instanceof OrderStatusError ? error.message : 'Order update is temporarily unavailable.' } },
      { status: error instanceof OrderStatusError ? 409 : 503 }
    );
  }
}
