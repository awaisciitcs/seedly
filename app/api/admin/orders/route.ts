import { NextResponse } from 'next/server';
import { getOrders } from '@/lib/services/orders';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get('paymentStatus') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const orders = getOrders({ paymentStatus, status, search });
    return NextResponse.json({ data: orders });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
