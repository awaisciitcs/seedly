import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { approveBankPayment } from '@/lib/services/orders';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdmin();
    const { id } = await props.params;
    const body = await request.json().catch(() => ({}));
    const updated = await approveBankPayment(id, body?.admin_note, adminSession.admin.id);
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
