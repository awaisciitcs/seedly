import {saveBusinessLead} from '@/lib/services/leads';
import {cleanJourney} from '@/lib/tracking/validation';
import { enforcePublicRateLimit, rateLimitHeaders } from '@/lib/public-rate-limit';
import { scheduleOrderEmails } from '@/lib/email/schedule';
import { NextResponse } from 'next/server';
import { createOrder } from '../../../lib/services/orders';
import { parseCheckoutLines } from '@/lib/checkout-validation';
import { readJson, requireSameOrigin, RequestError } from '@/lib/request-guards';
import { couponCode } from '@/lib/coupons';

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

    if ([customer_name, customer_email, customer_phone, shipping_address, shipping_city].some(value => typeof value !== 'string' || !value.trim() || value.length > 500)) {
      return NextResponse.json(
        { error: { message: 'Missing required customer and delivery fields.' } },
        { status: 400 }
      );
    }
    const name = String(customer_name).trim();
    const email = String(customer_email).trim().toLowerCase();
    const phone = String(customer_phone).trim();
    const address = String(shipping_address).trim();
    const city = String(shipping_city).trim();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: { message: 'Please provide a valid email address.' } },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^((\+92)|(0092)|(92)|0)?(3[0-9]{9})$/;
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: { message: 'Please enter a valid Pakistani mobile number (e.g. 0371 9055758).' } },
        { status: 400 }
      );
    }

    if (address.length < 8 || name.length < 2) {
      return NextResponse.json(
        { error: { message: 'Shipping address is too short. Please provide full street/house details.' } },
        { status: 400 }
      );
    }

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
      shipping_province: typeof shipping_province === 'string' ? shipping_province.trim().slice(0, 100) : 'Punjab',
      shipping_postal_code: typeof shipping_postal_code === 'string' ? shipping_postal_code.slice(0, 20) : '',
      shipping_notes: typeof shipping_notes === 'string' ? shipping_notes.slice(0, 1000) : '',
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
