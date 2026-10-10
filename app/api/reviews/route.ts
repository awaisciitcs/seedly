import { enforcePublicRateLimit, rateLimitHeaders } from '@/lib/public-rate-limit';
import { NextResponse } from 'next/server';
import { getApprovedReviews, createReview } from '@/lib/services/reviews';
import { readJson, requireSameOrigin, RequestError } from '@/lib/request-guards';
export const dynamic = 'force-dynamic';
const validId = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(value);
export async function GET(request: Request) {
  try {
    const productId = new URL(request.url).searchParams.get('productId') || undefined;
    if (productId && !validId(productId)) throw new RequestError('Invalid product selection.');
    return NextResponse.json({ data: await getApprovedReviews(productId) });
  } catch (error) {
    return NextResponse.json({ error: { message: error instanceof RequestError ? error.message : 'Reviews are temporarily unavailable. Please try again.' } }, { status: error instanceof RequestError ? error.status : 503, headers: rateLimitHeaders(error) });
  }
}
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const input = await readJson(request, 16384);
    if (!validId(input.product_id)) throw new RequestError('Please choose a valid product.');
    const text = (value: unknown, min: number, max: number, label: string) => {
      if (typeof value !== 'string' || value.trim().length < min || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new RequestError(label + ' is invalid.');
      return value.trim();
    };
    if (typeof input.rating !== 'number' || !Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) throw new RequestError('Choose a whole rating between 1 and 5.');
    await enforcePublicRateLimit(request, 'reviews');
    const review = await createReview({ product_id: input.product_id, product_name: '', customer_name: text(input.customer_name,2,100,'Name'), rating: input.rating, title: text(input.title ?? 'Customer review',1,160,'Title'), body: text(input.body,10,4000,'Review'), verified_purchase: false });
    return NextResponse.json({ success: true, message: 'Thank you! Your review has been submitted for moderation.', data: review }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: { message: error instanceof RequestError ? error.message : 'We could not save your review. Please try again.' } }, { status: error instanceof RequestError ? error.status : 503, headers: rateLimitHeaders(error) });
  }
}
