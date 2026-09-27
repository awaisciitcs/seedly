import { NextResponse } from 'next/server';
import { getAllReviews } from '@/lib/services/reviews';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const productId = searchParams.get('productId') || undefined;

    const reviews = getAllReviews({ status, productId });
    return NextResponse.json({ data: reviews });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err?.message || 'Failed to fetch reviews' } },
      { status: 500 }
    );
  }
}
