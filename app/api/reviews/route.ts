import { NextResponse } from 'next/server';
import { getApprovedReviews, createReview } from '@/lib/services/reviews';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || undefined;
    const reviews = getApprovedReviews(productId);
    return NextResponse.json({ data: reviews });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err?.message || 'Failed to fetch reviews' } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_id, product_name, customer_name, rating, title, body: reviewText } = body;

    if (!product_id || !customer_name || !rating || !reviewText) {
      return NextResponse.json(
        { error: { message: 'Please provide all required review fields (name, rating, review)' } },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { error: { message: 'Rating must be between 1 and 5 stars' } },
        { status: 400 }
      );
    }

    const review = createReview({
      product_id,
      product_name: product_name || 'Botanical Harvest',
      customer_name: customer_name.trim(),
      rating: numericRating,
      title: (title || 'Verified Botanical Feedback').trim(),
      body: reviewText.trim(),
      verified_purchase: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your review has been submitted for moderation and will appear publicly once approved.',
      data: review,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err?.message || 'Failed to submit review' } },
      { status: 500 }
    );
  }
}
