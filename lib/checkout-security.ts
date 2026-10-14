import 'server-only';
import { RequestError } from './request-guards';
import crypto from 'node:crypto';
import { quoteFingerprint } from './checkout-validation';
import type { CheckoutLine } from './types';

function secret() {
  const value = process.env.CHECKOUT_SIGNING_SECRET || process.env.SUPABASE_SECRET_KEY;
  if (!value || value.length < 20) throw new Error('Secure checkout is not configured.');
  return value;
}

function signature(value: string) { return crypto.createHmac('sha256', secret()).update(value).digest('base64url'); }

export function signCheckoutValue(value: Record<string, unknown>): string {
  const encoded = Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encoded}.${signature(encoded)}`;
}

export function readCheckoutValue(token: string): Record<string, unknown> {
  if (typeof token !== 'string' || token.length > 12_000) throw new RequestError('Please refresh your order summary.');
  const [encoded, signed, extra] = token.split('.');
  if (!encoded || !signed || extra) throw new RequestError('Please refresh your order summary.');
  const expected = Buffer.from(signature(encoded));
  const provided = Buffer.from(signed);
  if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) throw new RequestError('Please refresh your order summary.');
  const value = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  if (!value || typeof value !== 'object' || !Number.isFinite(value.expires) || value.expires < Date.now()) throw new RequestError('Your order summary has expired. Please refresh it before continuing.');
  return value;
}

type SignedQuote = { total_minor: number; shipping_minor: number; discount_minor?: number; coupon_code?: string; coupon_id?: string; coupon_version?: string; items: { unit_price_minor: number }[] };
export function createQuoteToken(lines: CheckoutLine[], quote: SignedQuote) {
  const expires = Date.now() + 5 * 60_000;
  return { token: signCheckoutValue({ purpose: 'quote', lines: crypto.createHash("sha256").update(quoteFingerprint(lines)).digest("hex"), total: quote.total_minor, shipping: quote.shipping_minor, discount: quote.discount_minor || 0, coupon: quote.coupon_code || '', coupon_id: quote.coupon_id || '', coupon_version: quote.coupon_version || '', prices: quote.items.map(i => i.unit_price_minor), expires }), expires_at: new Date(expires).toISOString() };
}

export function verifyQuoteToken(token: string, lines: CheckoutLine[], quote: SignedQuote) {
  const value = readCheckoutValue(token);
  if (value.purpose !== 'quote' || value.lines !== crypto.createHash("sha256").update(quoteFingerprint(lines)).digest("hex")) throw new RequestError('Your basket changed. Please refresh the order summary.');
  if (value.total !== quote.total_minor || value.shipping !== quote.shipping_minor || JSON.stringify(value.prices) !== JSON.stringify(quote.items.map(i => i.unit_price_minor))) throw new RequestError('Prices or delivery charges changed. Please review the updated total before ordering.');
  if ((value.discount || 0) !== (quote.discount_minor || 0) || (value.coupon || '') !== (quote.coupon_code || '') || (value.coupon_id || '') !== (quote.coupon_id || '') || (value.coupon_version || '') !== (quote.coupon_version || '')) throw new RequestError('This discount changed. Refresh the order summary before ordering.',409);
}

export function verifyReceiptProof(token: string, checkoutKey: string, path: string) {
  const value = readCheckoutValue(token);
  if (value.purpose !== 'receipt' || value.key !== checkoutKey || value.path !== path) throw new RequestError('Please upload the payment receipt again.');
}

export function createTrackingToken(checkoutKey: string, fingerprint: string) {
  return crypto.createHmac('sha256', secret()).update(`tracking:${checkoutKey}:${fingerprint}`).digest('hex');
}

// Private legacy reference for retry lookup; new sequential display numbers are allocated by PostgreSQL.
export function createCheckoutReference(checkoutKey: string) { return "SED-" + crypto.createHmac("sha256", secret()).update("order:" + checkoutKey).digest("hex").slice(0,24).toUpperCase(); }
