import { NextResponse } from 'next/server';
import { approveBankPayment } from '@/lib/services/orders';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json().catch(() => ({}));
    const updated = approveBankPayment(id, body?.admin_note);
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
