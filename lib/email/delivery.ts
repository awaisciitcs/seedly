import 'server-only';
export interface TransactionalEmail { to: string; subject: string; html: string; text: string; idempotencyKey: string; from?: string; replyTo?: string }
export type EmailDeliveryResult = { status: 'PREPARED' | 'ACCEPTED' | 'FAILED'; providerId?: string; retryable?: boolean; errorCode?: string };
const validAddress = (value: unknown): value is string => typeof value === 'string' && value.length <= 300 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
const validSender = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length > 300 || /[\r\n]/.test(value)) return false;
  return validAddress(value.match(/^[^<>\r\n]*<([^<>\r\n]+)>$/)?.[1] || value);
};
export function getEmailDeliveryConfiguration(): { from: string; replyTo: string; siteUrl: string } | null {
  const from = process.env.EMAIL_FROM;
  const replyTo = process.env.EMAIL_REPLY_TO || '';
  if (process.env.EMAIL_PROVIDER !== 'resend' || !process.env.RESEND_API_KEY || /[\r\n]/.test(process.env.RESEND_API_KEY) || !validSender(from) || !validAddress(replyTo)) return null;
  try {
    const site = new URL(process.env.EMAIL_SITE_URL || '');
    if (site.username || site.password || (site.protocol !== 'https:' && !(site.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(site.hostname)))) return null;
    return { from, replyTo, siteUrl: site.origin };
  } catch { return null; }
}
export async function sendTransactionalEmail(email: TransactionalEmail): Promise<EmailDeliveryResult> {
  if (process.env.EMAIL_PROVIDER !== 'resend') return { status: 'PREPARED' };
  const configuration = getEmailDeliveryConfiguration();
  if (!configuration) return { status: 'FAILED', retryable: false, errorCode: 'CONFIGURATION' };
  const key = process.env.RESEND_API_KEY;
  const from = email.from || configuration.from;
  const replyTo = email.replyTo || configuration.replyTo;
  if (!validSender(from) || !validAddress(replyTo) || !validAddress(email.to) || typeof email.subject !== 'string' || !email.subject || email.subject.length > 300 || /[\r\n]/.test(email.subject) || typeof email.html !== 'string' || !email.html || email.html.length > 300000 || typeof email.text !== 'string' || !email.text || email.text.length > 100000 || !/^[a-zA-Z0-9/_:.-]{1,256}$/.test(email.idempotencyKey || '')) return { status: 'FAILED', retryable: false, errorCode: 'VALIDATION' };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', 'Idempotency-Key': email.idempotencyKey },
      body: JSON.stringify({ from, to: [email.to], reply_to: replyTo, subject: email.subject, html: email.html, text: email.text }),
      signal: AbortSignal.timeout(10000),
    });
    let result: { id?: string; name?: string };
    try { result = await response.json(); } catch { return { status: 'FAILED', retryable: true, errorCode: 'INVALID_PROVIDER_RESPONSE' }; }
    if (response.ok && typeof result.id === 'string' && result.id && result.id.length <= 200) return { status: 'ACCEPTED', providerId: result.id };
    const concurrent = response.status === 409 && result.name === 'concurrent_idempotent_requests';
    return { status: 'FAILED', retryable: concurrent || response.status === 408 || response.status === 429 || response.status >= 500, errorCode: 'PROVIDER_' + (response.status || 500) };
  } catch { return { status: 'FAILED', retryable: true, errorCode: 'NETWORK' }; }
}
