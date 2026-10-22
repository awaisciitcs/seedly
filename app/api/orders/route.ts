import {saveBusinessLead} from '@/lib/services/leads';
import {cleanJourney} from '@/lib/tracking/validation';
import { enforcePublicRateLimit, rateLimitHeaders } from '@/lib/public-rate-limit';
import { scheduleOrderEmails } from '@/lib/email/schedule';
import { NextResponse } from 'next/server';
import { createOrder } from '../../../lib/services/orders';
import { parseCheckoutLines } from '@/lib/checkout-validation';
import { readJson, requireSameOrigin, RequestError } from '@/lib/request-guards';
import { couponCode } from '@/lib/coupons';
import { CHECKOUT_FIELD_LIMITS, validateCheckoutFields, type CheckoutFields } from '@/lib/checkout-fields';
import { PROVINCES } from '@/lib/delivery';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readJson(request);
    const idempotencyHeader = request.headers.get('Idempotency-Key');
    if(idempotencyHeader && body.idempotency_key && idempotencyHeader !== body.idempotency_key)throw new RequestError('Checkout identity does not match.');

    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_city,
      shipping_province,
      shipping_postal_code,
      shipping_notes,
      payment_method,
      receipt_path,
      idempotency_key,
      quote_token,
      receipt_proof,
      coupon_code,
      items,
    } = body;

    const fields = {} as CheckoutFields;
    for (const field of Object.keys(CHECKOUT_FIELD_LIMITS) as (keyof CheckoutFields)[]) {
      const value = body[field];
      const optional = field === 'shipping_postal_code' || field === 'shipping_notes';
      if (value === undefined && optional) fields[field] = '';
      else if (typeof value !== 'string') throw new RequestError('Provide valid customer and delivery fields.');
      else fields[field] = value;
    }
    const fieldErrors = validateCheckoutFields(fields);
    if (!PROVINCES.includes(fields.shipping_province.trim())) fieldErrors.shipping_province = 'Select a supported province or region.';
    if (Object.keys(fieldErrors).length) return NextResponse.json(
      { error: { message: Object.values(fieldErrors)[0], fields: fieldErrors } },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
    const name = fields.customer_name.trim();
    const email = fields.customer_email.trim().toLowerCase();
    const cleanPhone = fields.customer_phone.replace(/[\s\-\(\)]/g, '');
    const address = fields.shipping_address.trim();
    const city = fields.shipping_city.trim();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: { message: 'Basket is empty.' } },
        { status: 400 }
      );
    }

    if (items.length > 50) {
      return NextResponse.json(
        { error: { message: 'Basket exceeds maximum allowed items (50).' } },
        { status: 400 }
      );
    }

    const checkoutItems = parseCheckoutLines(items);
    for (const item of checkoutItems) {
      if (!item || typeof item !== 'object') {
        return NextResponse.json(
          { error: { message: 'Invalid item in basket.' } },
          { status: 400 }
        );
      }
      if (!item.product_id && !item.kit_id) {
        return NextResponse.json(
          { error: { message: 'Item must have a valid product or kit identifier.' } },
          { status: 400 }
        );
      }
      const q = Number(item.quantity);
      if (!Number.isInteger(q) || q < 1 || q > 99) {
        return NextResponse.json(
          { error: { message: 'Each item quantity must be an integer between 1 and 99.' } },
          { status: 400 }
        );
      }
    }

    if (typeof payment_method !== 'string' || !['COD', 'bank_transfer', 'wallet_aggregator'].includes(payment_method)) {
      return NextResponse.json({ error: { message: 'Please select a valid payment method.' } }, { status: 400 });
    }

    await enforcePublicRateLimit(request, 'orders');
    const result = await createOrder({
      coupon_code: couponCode(coupon_code),
      customer_name: name, customer_email: email, customer_phone: cleanPhone,
      shipping_address: address, shipping_city: city,
      shipping_province: fields.shipping_province.trim(),
      shipping_postal_code: fields.shipping_postal_code.trim(),
      shipping_notes: fields.shipping_notes.trim(),
      payment_method: payment_method as 'COD' | 'bank_transfer' | 'wallet_aggregator',
      receipt_path: typeof receipt_path === 'string' ? receipt_path : undefined,
      receipt_proof: typeof receipt_proof === 'string' ? receipt_proof : undefined,
      quote_token: typeof quote_token === 'string' ? quote_token : undefined,
      idempotency_key: idempotencyHeader || (typeof idempotency_key === 'string' ? idempotency_key : undefined),
      items: checkoutItems,
    });

    const leadId=await saveBusinessLead({name,email,phone:cleanPhone,city,source:'checkout',marketing_consent:false,journey:cleanJourney(body.journey),order_id:result.order.id});
    scheduleOrderEmails();
    return NextResponse.json({
      data: { lead_id:leadId, order_number: result.order.order_number, total_minor: result.order.total_minor, order_status: result.order.order_status, payment_status: result.order.payment_status },
      tracking_token: result.trackingToken,
      is_idempotent_replay: result.isIdempotentReplay,
    }, {headers: {"Cache-Control":"no-store"}});
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: { message: error instanceof RequestError ? error.message : 'We could not confirm your order. Retry with the same details to recover it safely.' } },
      { status: error instanceof RequestError ? error.status : 500, headers: rateLimitHeaders(error) }
    );
  }
}
