import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { processOrderEmails } from '@/lib/email/outbox';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;
async function handle(request: Request) {
  const secret = process.env.CRON_SECRET || process.env.EMAIL_CRON_SECRET;
  if (!secret || secret.length < 32) return NextResponse.json({error:'Email worker is not configured.'},{status:503});
  const authorization = request.headers.get('authorization') || '';
  const given = authorization.startsWith('Bearer ') && authorization.length <= 512 ? authorization.slice(7) : '';
  const digest = (value: string) => crypto.createHash('sha256').update(value).digest();
  if (!given || !crypto.timingSafeEqual(digest(given),digest(secret))) return NextResponse.json({error:'Unauthorized.'},{status:401});
  try {
    const summary = await processOrderEmails();
    return NextResponse.json(summary,{status:summary.configured ? 200 : 503,headers:{'Cache-Control':'no-store'}});
  } catch { return NextResponse.json({error:'Email processing is temporarily unavailable.'},{status:503}); }
}
export const POST = handle;
export const GET = handle;
