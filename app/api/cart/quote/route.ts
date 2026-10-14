import { enforcePublicRateLimit, rateLimitHeaders } from '@/lib/public-rate-limit';
import { NextResponse } from 'next/server';
import { validateAndQuote } from '@/lib/services/orders';
import { parseCheckoutLines } from '@/lib/checkout-validation';
import { createQuoteToken } from '@/lib/checkout-security';
import { readJson, requireSameOrigin, RequestError } from '@/lib/request-guards';
import { couponCode } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readJson(request);
    const items = parseCheckoutLines(body.items);
    await enforcePublicRateLimit(request, 'quotes');
    const code = couponCode(body.coupon_code);
    if (body.customer_email !== undefined && (typeof body.customer_email !== 'string' || body.customer_email.length > 254)) throw new RequestError('Enter a valid email address.');
    const quote = await validateAndQuote(items, code, body.customer_email);
    return NextResponse.json({ data: { ...quote, ...createQuoteToken(items, quote) } }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: { message: error instanceof RequestError ? error.message : 'We could not refresh your total. Please try again.' } }, { status: error instanceof RequestError ? error.status : 503, headers: rateLimitHeaders(error) });
  }
}
