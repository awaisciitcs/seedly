import { scheduleOrderEmails } from '@/lib/email/schedule';
import { readAdminJson, AdminInputError, adminId, adminText } from '@/lib/admin-validation';
import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { rejectBankPayment } from '@/lib/services/orders';

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
    const reason = adminText(body?.reason, 'Rejection reason', 2000, true);
    const updated = await rejectBankPayment(id, reason, adminSession.admin.id);
    scheduleOrderEmails();
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    if (error instanceof AdminAuthError || error instanceof AdminInputError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: 'This operation is temporarily unavailable. Please try again.' } }, { status: 503 });
  }
}
