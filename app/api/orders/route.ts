import { NextResponse } from 'next/server';
import { createOrder, validateAndQuote } from '../../../lib/services/orders';

export async function POST(request: Request) {
  try {
    const body = await request.json();

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
      items,
    } = body;

    if (!customer_name || !customer_email || !customer_phone || !shipping_address || !shipping_city) {
      return NextResponse.json(
        { error: { message: 'Missing required customer and delivery fields.' } },
        { status: 400 }
      );
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(customer_email.trim())) {
      return NextResponse.json(
        { error: { message: 'Please provide a valid email address.' } },
        { status: 400 }
      );
    }

    const cleanPhone = customer_phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^((\+92)|(0092)|(92)|0)?(3[0-9]{9})$/;
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: { message: 'Please enter a valid Pakistani mobile number (e.g. 0304 1117333).' } },
        { status: 400 }
      );
    }

    if (shipping_address.trim().length < 8) {
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

    if (!['COD', 'bank_transfer', 'wallet_aggregator'].includes(payment_method)) {
      return NextResponse.json({ error: { message: 'Please select a valid payment method.' } }, { status: 400 });
    }

    const order = createOrder({
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_city,
      shipping_province: shipping_province || 'Punjab',
      shipping_postal_code,
      shipping_notes,
      payment_method,
      receipt_path,
      items,
    });

    return NextResponse.json({ data: order });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: { message: error.message || 'Failed to place order.' } },
      { status: 500 }
    );
  }
}
