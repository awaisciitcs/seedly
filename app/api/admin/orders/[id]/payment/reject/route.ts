import { NextResponse } from 'next/server';
import { rejectBankPayment } from '@/lib/services/orders';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json();
    const reason = body?.reason || 'Payment receipt could not be verified.';
    const updated = rejectBankPayment(id, reason);
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
