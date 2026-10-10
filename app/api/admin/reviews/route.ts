import { readAdminJson, AdminInputError, adminId, adminText, adminEnum } from '@/lib/admin-validation';
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

    if (status) adminEnum(status,['PENDING','APPROVED','REJECTED','ALL'],'review status');
    if (productId) adminId(productId,'product ID');
    const reviews = await getAllReviews({ status, productId });
    return NextResponse.json({ data: reviews });
  } catch (err: any) {
    if (err instanceof AdminAuthError || err instanceof AdminInputError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    return NextResponse.json(
      { error: { message: 'This operation is temporarily unavailable. Please try again.' } }, { status: 503 }
    );
  }
}
