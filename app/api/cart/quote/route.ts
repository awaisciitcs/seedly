import { enforcePublicRateLimit, rateLimitHeaders } from '@/lib/public-rate-limit';
import { NextResponse } from 'next/server';
import { validateAndQuote } from '@/lib/services/orders';
import { parseCheckoutLines } from '@/lib/checkout-validation';
import { createQuoteToken } from '@/lib/checkout-security';
import { readJson, requireSameOrigin, RequestError } from '@/lib/request-guards';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readJson(request);
    const items = parseCheckoutLines(body.items);
    await enforcePublicRateLimit(request, 'quotes');
    const quote = await validateAndQuote(items);
    return NextResponse.json({ data: { ...quote, ...createQuoteToken(items, quote) } }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: { message: error instanceof RequestError ? error.message : 'We could not refresh your total. Please try again.' } }, { status: error instanceof RequestError ? error.status : 503, headers: rateLimitHeaders(error) });
  }
}
