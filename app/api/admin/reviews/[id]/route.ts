import { readAdminJson, AdminInputError, adminId, adminText } from '@/lib/admin-validation';
import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { updateReviewStatus, deleteReview } from '@/lib/services/reviews';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await props.params;
    adminId(id, 'review ID');
    const body = await readAdminJson(request);
    const { status } = body;

    if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: { message: 'Valid status (APPROVED, REJECTED, PENDING) is required' } },
        { status: 400 }
      );
    }

    const updated = await updateReviewStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: { message: 'Review not found' } }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Review marked as ${status}`,
    });
  } catch (err: any) {
    if (err instanceof AdminAuthError || err instanceof AdminInputError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    return NextResponse.json(
      { error: { message: 'This operation is temporarily unavailable. Please try again.' } }, { status: 503 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await props.params;
    adminId(id, 'review ID');
    const deleted = await deleteReview(id);
    if (!deleted) {
      return NextResponse.json({ error: { message: 'Review not found' } }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (err: any) {
    if (err instanceof AdminAuthError || err instanceof AdminInputError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    return NextResponse.json(
      { error: { message: 'This operation is temporarily unavailable. Please try again.' } }, { status: 503 }
    );
  }
}
