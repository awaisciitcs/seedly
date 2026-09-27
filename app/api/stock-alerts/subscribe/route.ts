import { NextResponse } from 'next/server';
import { subscribeToStockAlert } from '@/lib/services/stockAlerts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, variantId, kitId, sellableTitle, email, userId } = body;

    if (!email || !sellableTitle) {
      return NextResponse.json(
        { error: { message: 'Email and product details are required' } },
        { status: 400 }
      );
    }

    const result = subscribeToStockAlert({
      productId,
      variantId,
      kitId,
      sellableTitle,
      email,
      userId,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: { message: result.message },
          alreadyInStock: result.alreadyInStock,
        },
        { status: result.alreadyInStock ? 409 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.subscription,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error?.message || 'Failed to subscribe to stock alert' } },
      { status: 500 }
    );
  }
}
