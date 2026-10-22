import { RequestError } from '../request-guards';
import crypto from 'node:crypto';
import { createPublicClient } from '../supabase/public';
import { createAdminClient, getScopedClient } from '../supabase/admin';
import { Order, OrderItem, OrderStatus, PaymentMethod } from '../types';
import { getSiteSettings, enabledPaymentMethods } from './settings';
import { sequentialOrderReferencesEnabled, findCheckoutOrderReference, allocateCheckoutOrderReference } from '../order-reference';
import { getKits } from './kits';
import { assertOrderStatusUpdate, getInitialOrderState } from '../order-status';
import { parseCheckoutLines, quoteFingerprint } from '../checkout-validation';
import { createTrackingToken, createCheckoutReference, verifyQuoteToken, verifyReceiptProof } from '../checkout-security';
import { quoteCoupon } from './coupons';
import { couponCode } from '../coupons';

export interface CreateOrderInput {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code?: string;
  shipping_notes?: string;
  payment_method: PaymentMethod;
  receipt_path?: string;
  idempotency_key?: string;
  quote_token?: string;
  receipt_proof?: string;
  coupon_code?: string;
  items: {
    product_id: string;
    variant_id?: string;
    kit_id?: string;
    quantity: number;
    name?: string;
    sku?: string;
    image_url?: string;
  }[];
}

export async function validateAndQuote(
  input: { product_id: string; variant_id?: string; kit_id?: string; quantity: number }[],
  coupon_code?: string, customer_email?: string
) {
  const items = parseCheckoutLines(input);
  const supabase = createPublicClient();
  const productIds = [...new Set(items.filter(item => !item.kit_id).map(item => item.product_id))];
  const variantIds = [...new Set(items.filter(item => !item.kit_id).map(item => item.variant_id!))];
  const kitIds = [...new Set(items.flatMap(item => item.kit_id ? [item.kit_id] : []))];
  // A large basket must not issue two sequential requests for every pack.
  const [settings, productsResult, variantsResult, kits] = await Promise.all([
    getSiteSettings({ requireConfigured: true }),
    productIds.length ? supabase.from('products').select('id,name,status,sku,price_minor,image_url').in('id', productIds).eq('status', 'ACTIVE') : Promise.resolve({ data: [], error: null }),
    variantIds.length ? supabase.from('product_variants').select('id,product_id,status,inventory_quantity,price_minor,option_value,sku').in('id', variantIds).eq('status', 'ACTIVE') : Promise.resolve({ data: [], error: null }),
    kitIds.length ? getKits({ ids: kitIds, includeReviews: false }) : Promise.resolve([]),
  ]);
  if (productsResult.error || variantsResult.error || !productsResult.data || !variantsResult.data) throw new Error('Catalog validation is temporarily unavailable.');
  const products = new Map(productsResult.data.map(product => [product.id, product]));
  const variants = new Map(variantsResult.data.map(variant => [variant.id, variant]));
  const kitMap = new Map(kits.map(kit => [kit.id, kit]));
  const validatedItems = items.map(item => {
    if (item.kit_id) {
      const kit = kitMap.get(item.kit_id);
      if (!kit || kit.status !== 'ACTIVE') throw new RequestError('A kit in your basket is no longer available.');
      if (!Number.isSafeInteger(kit.computed_stock) || kit.computed_stock < item.quantity) {
        throw new RequestError(kit.computed_stock <= 0 ? '"' + kit.name + '" is currently out of stock.' : '"' + kit.name + '" only has ' + kit.computed_stock + ' kits available in stock.');
      }
      if (!Number.isSafeInteger(kit.price_minor) || kit.price_minor < 0) throw new Error('Invalid catalog price.');
      return { product_id: kit.id, kit_id: kit.id, name: kit.name, sku: 'KIT-' + kit.slug.toUpperCase(), quantity: item.quantity, unit_price_minor: kit.price_minor, line_total_minor: kit.price_minor * item.quantity, image_url: kit.image_url };
    }
    const product = products.get(item.product_id);
    if (!product || product.status !== 'ACTIVE') throw new RequestError('A product in your basket is no longer available.');
    const variant = variants.get(item.variant_id!);
    if (!variant || variant.product_id !== item.product_id || variant.status !== 'ACTIVE') throw new RequestError('A selected pack is no longer available. Please choose another size.');
    const available = Number(variant.inventory_quantity ?? 0);
    if (!Number.isSafeInteger(available) || available < item.quantity) {
      throw new RequestError(available <= 0 ? '"' + product.name + ' (' + variant.option_value + ')" is currently out of stock.' : '"' + product.name + ' (' + variant.option_value + ')" only has ' + available + ' available in stock.');
    }
    const price = Number(variant.price_minor);
    if (!Number.isSafeInteger(price) || price < 0) throw new Error('Invalid catalog price.');
    return { product_id: product.id, variant_id: variant.id, name: product.name + ' (' + variant.option_value + ')', sku: variant.sku || product.sku || '', quantity: item.quantity, unit_price_minor: price, line_total_minor: price * item.quantity, image_url: product.image_url || '' };
  });
  const subtotal_minor = validatedItems.reduce((total, item) => total + item.line_total_minor, 0);
  const shipping_minor = subtotal_minor >= settings.free_delivery_threshold_minor ? 0 : settings.delivery_fee_minor;
  if (!Number.isSafeInteger(subtotal_minor + shipping_minor) || subtotal_minor + shipping_minor > 2_000_000_000) throw new RequestError('This basket exceeds the maximum order value. Please reduce the quantity.');
  const coupon = await quoteCoupon(coupon_code, subtotal_minor, customer_email);
  const total_minor = subtotal_minor + shipping_minor - coupon.discount_minor;
  if (!Number.isSafeInteger(total_minor) || total_minor > 2_000_000_000) throw new Error('Invalid basket total.');
  return { subtotal_minor, shipping_minor, total_minor, ...coupon, items: validatedItems };
}

export interface CreateOrderResult {
  order: Order;
  trackingToken: string;
  isIdempotentReplay: boolean;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (!process.env.SUPABASE_SECRET_KEY) throw new RequestError('Ordering is temporarily unavailable. Please contact our team before transferring payment.',503);
  const supabase = createAdminClient();

  if (!input.items || input.items.length === 0) {
    throw new Error('Order items cannot be empty or invalid');
  }
  input.items = parseCheckoutLines(input.items);
  input.coupon_code = couponCode(input.coupon_code);
  if (!input.idempotency_key || !/^[a-zA-Z0-9_-]{20,100}$/.test(input.idempotency_key)) throw new RequestError('Please refresh checkout and try again.');

  const orderId = "ord-" + crypto.randomUUID();
  const checkoutReference = createCheckoutReference(input.idempotency_key);
  let orderNumber = checkoutReference;

  // Generate unguessable capability token for tracking

  // Compute request fingerprint for idempotency conflict detection
  const fingerprintPayload = JSON.stringify({
    items: quoteFingerprint(input.items),
    email: input.customer_email.trim().toLowerCase(),
    phone: input.customer_phone.trim(),
    totalMethod: input.payment_method,
    name: input.customer_name.trim(),
    address: input.shipping_address.trim(), city: input.shipping_city.trim(), province: input.shipping_province.trim(),
    postal: input.shipping_postal_code?.trim() || '', notes: input.shipping_notes?.trim() || '', receipt: input.receipt_path || '',
    ...(input.coupon_code ? { coupon: input.coupon_code } : {}),
  });
  const requestFingerprint = crypto.createHash('sha256').update(fingerprintPayload).digest('hex');
  const trackingToken = createTrackingToken(input.idempotency_key, requestFingerprint);
  const trackingTokenHash = crypto.createHash('sha256').update(trackingToken).digest('hex');

  // Recover an already-committed request before checking stock or quote expiry.
  const replay = await lookupOrderWithCapability(orderNumber, trackingToken);
  if (replay) {
    if (!replay.isAuthorized) throw new RequestError("This checkout attempt has changed. Restore the previous details to recover your order.",409);
    return { order: replay.order, trackingToken, isIdempotentReplay: true };
  }
  const sequential = sequentialOrderReferencesEnabled();
  const assignedNumber = sequential ? await findCheckoutOrderReference(checkoutReference, requestFingerprint) : null;
  if (assignedNumber) {
    const sequentialReplay = await lookupOrderWithCapability(assignedNumber, trackingToken);
    if (sequentialReplay) {
      if (!sequentialReplay.isAuthorized) throw new RequestError('This checkout attempt has changed. Restore the previous details to recover your order.',409);
      return { order: sequentialReplay.order, trackingToken, isIdempotentReplay: true };
    }
  }
  // Existing committed attempts are recovered above even when the store is paused.
  const settings = await getSiteSettings({ requireConfigured: true });
  if (!settings.ordering_enabled) throw new RequestError('Ordering is temporarily paused. Please contact our team.', 503);
  if (!enabledPaymentMethods(settings).includes(input.payment_method)) throw new RequestError('This payment method is currently unavailable. Choose another method.', 409);
  // Recover committed attempts above, but require the same proof as the bank-transfer form for new orders.
  if (input.payment_method === 'bank_transfer' && (!input.receipt_path || !input.receipt_proof)) throw new RequestError('Attach your bank transfer receipt before placing the order.');
  const quote = await validateAndQuote(input.items, input.coupon_code, input.customer_email);
  verifyQuoteToken(input.quote_token || '', input.items, quote);
  if (input.receipt_path) {
    if (input.payment_method === 'COD') throw new RequestError('A receipt is not needed for cash on delivery.');
    verifyReceiptProof(input.receipt_proof || '', input.idempotency_key, input.receipt_path);
  }

  if (sequential) orderNumber = assignedNumber || await allocateCheckoutOrderReference(checkoutReference, requestFingerprint);

  const { data: rpcResult, error: rpcError } = await (supabase.rpc as any)(input.coupon_code ? 'create_order_with_coupon_transactional' : 'create_order_secure_transactional', {
    ...(input.coupon_code ? { p_coupon_code: input.coupon_code } : {}),
    p_order_id: orderId,
    p_order_number: orderNumber,
    p_customer_name: input.customer_name,
    p_customer_email: input.customer_email,
    p_customer_phone: input.customer_phone,
    p_shipping_address: input.shipping_address,
    p_shipping_city: input.shipping_city,
    p_shipping_province: input.shipping_province,
    p_shipping_postal_code: input.shipping_postal_code || '',
    p_shipping_notes: input.shipping_notes || '',
    p_payment_method: input.payment_method,
    p_receipt_path: input.receipt_path || '',
    p_idempotency_key: input.idempotency_key || '',
    p_request_fingerprint: requestFingerprint,
    p_tracking_token_hash: trackingTokenHash,
    p_expected_quote: quote,
    p_items: input.items.map((it) => ({
      product_id: it.product_id,
      variant_id: it.variant_id || null,
      kit_id: it.kit_id || null,
      quantity: it.quantity,
      name: it.name || null,
      sku: it.sku || null,
      image_url: it.image_url || null,
    })),
  });

  if (rpcError) {
    if (rpcError.code === 'P0010') throw new RequestError('This discount code changed, expired, or reached its limit. Refresh your total or remove the code.', 409);
    if (rpcError.code === 'P0001') {
      throw new RequestError('This checkout attempt has changed. Please review your details and start a new attempt.',409);
    }
    if (rpcError.code === 'P0002') {
      throw new RequestError('Some packs no longer have enough stock. Review your basket before retrying.',409);
    }
    if (rpcError.code === 'P0004') throw new RequestError('Prices or delivery charges changed. Please review the refreshed order summary.',409);
    if (rpcError.code === 'P0006') throw new RequestError('Ordering or this payment method is currently unavailable. Please review your payment selection or contact our team.', 409);
    if (rpcError.code === 'P0003') {
      throw new RequestError('A product is no longer available. Please review your basket.',409);
    }
    throw new Error(`Checkout failed: ${rpcError.message}`);
  }

  const effectiveOrderNumber = (rpcResult as any)?.order_number || orderNumber;
  const isReplay = Boolean((rpcResult as any)?.is_idempotent_replay);

  const createdOrder = await getOrder(effectiveOrderNumber, trackingToken);
  if (!createdOrder) {
    throw new Error('Failed to retrieve order after creation');
  }


  return {
    order: createdOrder,
    trackingToken,
    isIdempotentReplay: isReplay,
  };
}

function mapRowToOrder(row: any, items: OrderItem[]): Order {
  return {
    id: row.id,
    order_number: row.order_number,
    user_id: row.user_id || undefined,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    customer_phone: row.customer_phone,
    shipping_address: row.shipping_address,
    shipping_city: row.shipping_city,
    shipping_province: row.shipping_province,
    shipping_postal_code: row.shipping_postal_code || undefined,
    shipping_notes: row.shipping_notes || undefined,
    currency: row.currency || 'PKR',
    subtotal_minor: Number(row.subtotal_minor),
    shipping_minor: Number(row.shipping_minor),
    discount_minor: Number(row.discount_minor || 0),
    coupon_code: row.coupon_code || undefined,
    total_minor: Number(row.total_minor),
    payment_method: row.payment_method,
    payment_status: row.payment_status,
    order_status: row.order_status,
    tracking_courier: row.tracking_courier || row.courier_name || undefined,
    tracking_number: row.tracking_number || undefined,
    idempotency_key: row.idempotency_key || undefined,
    receipt_path: row.receipt_path || undefined,
    admin_note: row.admin_note || row.notes || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    items,
  };
}

export async function lookupOrderWithCapability(
  orderNumber: string,
  token?: string,
  verify?: string
): Promise<{ order: Order; items: OrderItem[]; isAuthorized: boolean } | null> {
  const sequentialReference = /^SED-[0-9]{6,12}$/.test(orderNumber);
  if (sequentialReference && !/^[a-f0-9]{64}$/i.test(token || '')) return null;
  const supabase = process.env.SUPABASE_SECRET_KEY ? createAdminClient() : createPublicClient();
  const { data, error } = await (supabase.rpc as any)('lookup_order_with_capability', {
    p_order_number: orderNumber,
    p_token: token || null,
    p_verify: verify || null,
  });

  if (error) throw new Error('Order lookup is temporarily unavailable.');
  if (!data) return null;
  const res = data as any;
  if (!res.order || (sequentialReference && !res.is_authorized)) return null;

  const items: OrderItem[] = (res.items || []).map((it: any) => ({
    id: it.id,
    order_id: it.order_id,
    product_id: it.product_id || it.kit_id || '',
    variant_id: it.variant_id || undefined,
    kit_id: it.kit_id || undefined,
    name_snapshot: it.name_snapshot || it.product_name || 'Botanical Harvest',
    sku_snapshot: it.sku_snapshot || '',
    quantity: Number(it.quantity),
    unit_price_minor: Number(it.unit_price_minor || it.price_minor || 0),
    line_total_minor: Number(it.line_total_minor || 0),
    image_url: it.image_url || undefined,
  }));

  const order = mapRowToOrder(res.order, items);
  return {
    order,
    items,
    isAuthorized: Boolean(res.is_authorized),
  };
}

export async function getOrder(orderNumber: string, token?: string): Promise<Order | null> {
  if (token) {
    const lookup = await lookupOrderWithCapability(orderNumber, token);
    return lookup?.isAuthorized ? lookup.order : null;
  }

  const supabase = await getScopedClient();
  const { data: row, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (!error && row) {
    const { data: itemRows, error: itemError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', row.id);

    if (itemError) throw new Error('Order items are temporarily unavailable.');
  const items: OrderItem[] = (itemRows || []).map((it: any) => ({
      id: it.id,
      order_id: it.order_id,
      product_id: it.product_id || it.kit_id || '',
      variant_id: it.variant_id || undefined,
      kit_id: it.kit_id || undefined,
      name_snapshot: it.name_snapshot || it.product_name || 'Botanical Harvest',
      sku_snapshot: it.sku_snapshot || '',
      quantity: Number(it.quantity),
      unit_price_minor: Number(it.unit_price_minor || it.price_minor || 0),
      line_total_minor: Number(it.line_total_minor || 0),
      image_url: it.image_url || undefined,
    }));

    return mapRowToOrder(row, items);
  }

  const publicLookup = await lookupOrderWithCapability(orderNumber);
  return publicLookup ? publicLookup.order : null;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await getScopedClient();
  const { data: row, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error('Order details are temporarily unavailable.');
  if (!row) return null;

  const { data: itemRows, error: itemError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', row.id);

  if (itemError) throw new Error('Order items are temporarily unavailable.');
  const items: OrderItem[] = (itemRows || []).map((it: any) => ({
    id: it.id,
    order_id: it.order_id,
    product_id: it.product_id || it.kit_id || '',
    variant_id: it.variant_id || undefined,
    kit_id: it.kit_id || undefined,
    name_snapshot: it.name_snapshot || it.product_name || 'Botanical Harvest',
    sku_snapshot: it.sku_snapshot || '',
    quantity: Number(it.quantity),
    unit_price_minor: Number(it.unit_price_minor || it.price_minor || 0),
    line_total_minor: Number(it.line_total_minor || 0),
    image_url: it.image_url || undefined,
  }));

  return mapRowToOrder(row, items);
}

export async function getOrders(options?: {
  status?: string;
  paymentStatus?: string;
  search?: string;
  limit?: number;
}): Promise<Order[]> {
  const supabase = await getScopedClient();
  let query = supabase.from('orders').select(`
    *,
    order_items ( * )
  `);

  if (options?.status) {
    query = query.eq('order_status', options.status);
  }

  if (options?.paymentStatus) {
    query = query.eq('payment_status', options.paymentStatus);
  }

  if (options?.search) {
    const s = options.search.replace(/[,()%"']/g, ' ').trim().slice(0, 80);
    if (s) {
      query = query.or(
        `order_number.ilike.%${s}%,customer_name.ilike.%${s}%,customer_email.ilike.%${s}%,customer_phone.ilike.%${s}%`
      );
    }
  }

  query = query.order('created_at', { ascending: false }).order('id', { ascending: false });
  // PostgREST caps a single response. Never present a truncated history as all orders.
  const rows: any[] = [];
  const requestedLimit = options?.limit;
  if (requestedLimit !== undefined && (!Number.isSafeInteger(requestedLimit) || requestedLimit < 1)) throw new RequestError('Invalid order limit.');
  const batchSize = 500;
  for (let offset = 0; ; offset += batchSize) {
    const size = requestedLimit ? Math.min(batchSize, requestedLimit - rows.length) : batchSize;
    if (size <= 0) break;
    const { data, error } = await query.range(offset, offset + size - 1);
    if (error || !data) throw new Error('Orders are temporarily unavailable.');
    rows.push(...data);
    if (data.length < size || requestedLimit && rows.length >= requestedLimit) break;
  }

  return rows.map((row: any) => {
    const items: OrderItem[] = (row.order_items || []).map((it: any) => ({
      id: it.id,
      order_id: it.order_id,
      product_id: it.product_id || it.kit_id || '',
      variant_id: it.variant_id || undefined,
      kit_id: it.kit_id || undefined,
      name_snapshot: it.name_snapshot || it.product_name || 'Botanical Harvest',
      sku_snapshot: it.sku_snapshot || '',
      quantity: Number(it.quantity),
      unit_price_minor: Number(it.unit_price_minor || it.price_minor || 0),
      line_total_minor: Number(it.line_total_minor || 0),
      image_url: it.image_url || undefined,
    }));
    return mapRowToOrder(row, items);
  });
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  courier?: string,
  trackingNumber?: string,
  adminNote?: string,
  actorId?: string
): Promise<Order | null> {
  const order = await getOrderById(orderId);
  if (!order) throw new RequestError('Order not found.',404);
  assertOrderStatusUpdate(order, newStatus);
  if (order.order_status === newStatus) return order;
  if (newStatus==='SHIPPED' && (!(courier || order.tracking_courier)?.trim() || !(trackingNumber || order.tracking_number)?.trim())) throw new RequestError('Enter the courier and tracking number before dispatching.');

  const supabase = await getScopedClient();
  const { error: rpcErr } = await supabase.rpc('update_order_fulfillment_transactional', {
    p_order_id: orderId,
    p_order_status: newStatus,
    p_tracking_number: trackingNumber || '',
    p_courier_name: courier || '',
    p_actor_type: 'ADMIN',
    p_actor_id: actorId || '',
    p_notes: adminNote || '',
  });

  if (rpcErr) {
    if (rpcErr.code === 'P0004') throw new RequestError('This status transition is unavailable. Refresh the order; historical kit reservations may need manual reconciliation.',409);
    throw new Error('Failed to update order fulfillment.');
  }


  return getOrderById(orderId);
}

export async function approveBankPayment(
  orderId: string,
  adminNote?: string,
  actorId?: string
): Promise<Order | null> {
  const order = await getOrderById(orderId);
  if (!order) throw new RequestError('Order not found.',404);

  if (order.payment_status === 'VERIFIED') return order;
  if (order.payment_method==='COD' || ['CANCELLED','REFUNDED','SHIPPED','DELIVERED'].includes(order.order_status)) throw new RequestError('Manual payment cannot be changed at this stage.',409);
  const supabase = await getScopedClient();
  const { error: rpcErr } = await supabase.rpc('update_order_payment_transactional', {
    p_order_id: orderId,
    p_payment_status: 'VERIFIED',
    p_order_status: 'PAID',
    p_actor_type: 'ADMIN',
    p_actor_id: actorId || '',
    p_notes: adminNote || 'Bank transfer verified by administrator',
  });

  if (rpcErr) {
    if (rpcErr.code==='P0004') throw new RequestError('The payment state has changed. Refresh this order before retrying.',409);
    throw new Error('Failed to approve payment.');
  }


  return getOrderById(orderId);
}

export async function rejectBankPayment(
  orderId: string,
  reason: string,
  actorId?: string
): Promise<Order | null> {
  const order = await getOrderById(orderId);
  if (!order) throw new RequestError('Order not found.',404);

  if (order.payment_status === 'REJECTED' && order.order_status === 'CANCELLED') return order;
  if (order.payment_method === 'COD' || order.payment_status === 'VERIFIED' || ['CANCELLED','REFUNDED','PROCESSING','PACKED','SHIPPED','DELIVERED'].includes(order.order_status)) throw new RequestError('Manual payment cannot be rejected at this stage.',409);
  const supabase = await getScopedClient();
  const { error: rpcErr } = await supabase.rpc('update_order_payment_transactional', {
    p_order_id: orderId,
    p_payment_status: 'REJECTED',
    p_order_status: 'CANCELLED',
    p_actor_type: 'ADMIN',
    p_actor_id: actorId || '',
    p_notes: reason,
  });

  if (rpcErr) {
    if (rpcErr.code==='P0004') throw new RequestError('The payment state has changed. Refresh this order before retrying.',409);
    throw new Error('Failed to reject payment.');
  }


  return getOrderById(orderId);
}
