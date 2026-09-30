import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { getAllReviews } from '@/lib/services/reviews';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const productId = searchParams.get('productId') || undefined;

    const reviews = await getAllReviews({ status, productId });
    return NextResponse.json({ data: reviews });
  } catch (err: any) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    return NextResponse.json(
      { error: { message: err?.message || 'Failed to fetch reviews' } },
      { status: 500 }
    );
  }
}
