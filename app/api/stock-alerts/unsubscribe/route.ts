import { NextResponse } from 'next/server';
import { unsubscribeFromStockAlert } from '@/lib/services/stockAlerts';
import { readBody, readJson, requireSameOrigin, RequestError } from '@/lib/request-guards';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow' };
const validToken = (token: unknown): token is string => typeof token === 'string' && /^[A-Za-z0-9_-]{16,200}$/.test(token);
function page(content: string,status=200) { return new NextResponse('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Restock preferences | Seedly</title></head><body style="font-family:system-ui;background:#faf8f2;color:#20382b;padding:32px"><main style="max-width:480px;margin:10vh auto;background:white;padding:32px;border:1px solid #ddd;border-radius:16px"><h1>Restock preferences</h1>'+content+'</main></body></html>',{status,headers:{...headers,'Content-Type':'text/html; charset=utf-8'}}); }
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  if (!validToken(token)) return page('<p>This unsubscribe link is invalid. Please contact Seedly.</p>',400);
  // Email scanners and browser prefetching must never cancel a subscription.
  return page('<p>Confirm to stop receiving this product’s restock notification.</p><form method="post"><input type="hidden" name="token" value="'+token+'"><button type="submit">Unsubscribe</button></form><p><a href="/">Return to Seedly</a></p>');
}
export async function POST(request: Request) {
  const isForm = request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded');
  try {
    requireSameOrigin(request);
    const token = isForm ? new URLSearchParams(new TextDecoder().decode(await readBody(request,1024))).get('token') : (await readJson(request,1024)).token;
    if (!validToken(token)) throw new RequestError('Invalid unsubscribe link.');
    await unsubscribeFromStockAlert(token);
    if (isForm) return page('<p>This restock preference is inactive. You can subscribe again on the product page.</p><a href="/">Return to Seedly</a>');
    return NextResponse.json({success:true,message:'This restock preference is inactive.'},{headers});
  } catch (error) {
    const status = error instanceof RequestError ? error.status : 503;
    const message = error instanceof RequestError ? error.message : 'We could not update this preference. Please try again.';
    if (isForm) return page('<p>'+message+'</p><a href="/">Return to Seedly</a>',status);
    return NextResponse.json({error:{message}},{status,headers});
  }
}
