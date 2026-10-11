import 'server-only';
import crypto from 'node:crypto';
import { isIP } from 'node:net';
import { createAdminClient } from './supabase/admin';
import { RequestError } from './request-guards';

type Scope = 'orders' | 'quotes' | 'receipts' | 'reviews' | 'restock' | 'leads';
const LIMITS: Record<Scope, { global: number; perClient: number; seconds: number }> = {
  orders: { global: 120, perClient: 10, seconds: 60 },
  quotes: { global: 600, perClient: 60, seconds: 60 },
  receipts: { global: 60, perClient: 5, seconds: 60 },
  reviews: { global: 120, perClient: 5, seconds: 600 },
  restock: { global: 120, perClient: 5, seconds: 600 },
  leads: { global: 120, perClient: 5, seconds: 600 },
};
export class RateLimitError extends RequestError {
  constructor(public retryAfter: number) { super('Too many requests. Please wait a moment and try again.', 429); }
}

/** Only accept headers overwritten by our hosting platform or an explicitly trusted proxy. */
export function trustedClientIp(request: Request): string | null {
  const header = process.env.VERCEL === '1' ? 'x-vercel-forwarded-for' : process.env.TRUSTED_CLIENT_IP_HEADER;
  if (!header || !/^[a-z0-9-]{1,80}$/i.test(header)) return null;
  const value = request.headers.get(header)?.trim();
  if (!value || value.length > 100 || !isIP(value)) return null;
  return value.includes(':') ? new URL('http://[' + value + ']/').hostname.slice(1, -1) : value;
}
export function rateLimitHeaders(error: unknown): Record<string, string> {
  return { 'Cache-Control': 'no-store', ...(error instanceof RateLimitError ? { 'Retry-After': String(error.retryAfter) } : {}) };
}

/** Atomic shared counters work across Vercel instances; failures never bypass admission. */
export async function enforcePublicRateLimit(request: Request, scope: Scope): Promise<void> {
  if (!process.env.SUPABASE_SECRET_KEY) throw new RequestError('This service is temporarily unavailable. Please try again later.', 503);
  const client = createAdminClient();
  const limits = LIMITS[scope];
  const consume = async (bucket: string, limit: number) => {
    const { data, error } = await (client.rpc as any)('consume_rate_limit', { p_bucket: bucket, p_limit: limit, p_window_seconds: limits.seconds });
    if (error || !data || typeof data.allowed !== 'boolean' || !Number.isInteger(data.retry_after_seconds) || data.retry_after_seconds < 0 || data.retry_after_seconds > 86400) {
      throw new RequestError('This service is temporarily unavailable. Please try again later.', 503);
    }
    if (!data.allowed) throw new RateLimitError(Math.max(1, data.retry_after_seconds));
  };
  await consume('public:' + scope + ':global', limits.global);
  const ip = trustedClientIp(request);
  if (ip) {
    const digest = crypto.createHmac('sha256', process.env.CHECKOUT_SIGNING_SECRET || process.env.SUPABASE_SECRET_KEY).update(ip).digest('hex');
    await consume('public:' + scope + ':' + digest, limits.perClient);
  }
}
