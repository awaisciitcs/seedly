import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/services/orders';
import { OrderStatusError } from '@/lib/order-status';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json();
    const { status, courier, tracking_number, note } = body;

    if (!status) {
      return NextResponse.json({ error: { message: 'Status is required' } }, { status: 400 });
    }

    const updated = updateOrderStatus(id, status, courier, tracking_number, note);
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: error instanceof OrderStatusError ? 400 : 500 });
  }
}
