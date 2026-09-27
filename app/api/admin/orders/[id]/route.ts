import { NextResponse } from 'next/server';
import { getOrderById, getOrder } from '@/lib/services/orders';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    let order = getOrderById(id);
    if (!order) {
      order = getOrder(id);
    }

    if (!order) {
      return NextResponse.json({ error: { message: 'Order not found' } }, { status: 404 });
    }

    return NextResponse.json({ data: order });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
