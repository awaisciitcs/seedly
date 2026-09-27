import { NextResponse } from 'next/server';
import { updateReviewStatus, deleteReview } from '@/lib/services/reviews';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: { message: 'Valid status (APPROVED, REJECTED, PENDING) is required' } },
        { status: 400 }
      );
    }

    const updated = updateReviewStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: { message: 'Review not found' } }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Review marked as ${status}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err?.message || 'Failed to update review status' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const deleted = deleteReview(id);
    if (!deleted) {
      return NextResponse.json({ error: { message: 'Review not found' } }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err?.message || 'Failed to delete review' } },
      { status: 500 }
    );
  }
}
