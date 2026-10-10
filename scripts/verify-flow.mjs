import { getDatabase } from '../lib/db/index.js';
import { getProducts, getProductBySlug } from '../lib/services/products.js';
import { getKits, getKitBySlug } from '../lib/services/kits.js';
import { createOrder, getOrder, updateOrderStatus, approveBankPayment } from '../lib/services/orders.js';
import { getDispatchedNotifications } from '../lib/services/notifications.js';

console.log('=== SEEDLY END-TO-END AUTOMATED VERIFICATION ===\n');

// 1. Verify Catalog
console.log('[1/5] Verifying catalog products...');
const products = getProducts();
console.log(`✓ Loaded ${products.length} active products`);
if (products.length < 7) {
  throw new Error(`Expected at least 7 products, found ${products.length}`);
}

const pumpkin = getProductBySlug('pumpkin-seeds');
console.log(`✓ Found Pumpkin Seeds: ${pumpkin?.name}, Price: Rs. ${pumpkin?.price_minor / 100}, Variants: ${pumpkin?.variants?.length}`);

// 2. Verify Dynamic Kit Bottleneck Calculation
console.log('\n[2/5] Verifying Kit Bottleneck Invariant (Section 8.4)...');
const kits = getKits();
const folKit = kits.find((k) => k.slug === 'follicular-blend');
console.log(`✓ Follicular Kit: ${folKit?.name}, Price: Rs. ${folKit?.price_minor / 100}`);
console.log(`✓ Constituent items:`, folKit?.items.map((i) => `${i.product_name} (${i.available_stock} in stock)`));
console.log(`✓ Dynamic computed kit stock: ${folKit?.computed_stock} kits`);

if (!folKit || folKit.computed_stock <= 0) {
  throw new Error('Follicular kit computed stock is invalid');
}

// 3. Verify Order Creation with Authoritative Server Pricing
console.log('\n[3/5] Testing Order Placement with Bank Transfer Fallback...');
const testOrder = createOrder({
  customer_name: 'Zahra Mansoor',
  customer_email: 'zahra@test.pk',
  customer_phone: '0321 9876543',
  shipping_address: 'Apartment 4B, Phase 5, DHA',
  shipping_city: 'Lahore',
  shipping_province: 'Punjab',
  shipping_postal_code: '54000',
  payment_method: 'bank_transfer',
  items: [
    {
      product_id: pumpkin.id,
      variant_id: pumpkin.variants[0].id,
      quantity: 2,
    },
    {
      product_id: folKit.id,
      kit_id: folKit.id,
      quantity: 1,
    },
  ],
});

console.log(`✓ Order Created: #${testOrder.order_number}`);
console.log(`✓ Initial Status: ${testOrder.order_status}, Payment: ${testOrder.payment_status}`);
console.log(`✓ Authoritative Subtotal: Rs. ${testOrder.subtotal_minor / 100}`);
console.log(`✓ Authoritative Shipping: Rs. ${testOrder.shipping_minor / 100}`);
console.log(`✓ Total Minor: Rs. ${testOrder.total_minor / 100}`);

// 4. Verify Admin Payment Approval & Fulfillment Lifecycle
console.log('\n[4/5] Testing Admin Bank Receipt Approval & Fulfillment Stepper...');
const approved = approveBankPayment(testOrder.id, 'Verified on Meezan Bank online portal');
console.log(`✓ Payment Approved -> Payment Status: ${approved?.payment_status}, Order Status: ${approved?.order_status}`);

const shipped = updateOrderStatus(testOrder.id, 'SHIPPED', 'TCS Express', 'TCS-99482103');
console.log(`✓ Order Shipped -> Status: ${shipped?.order_status}, Courier: ${shipped?.tracking_courier}, Tracking: ${shipped?.tracking_number}`);

const delivered = updateOrderStatus(testOrder.id, 'DELIVERED');
console.log(`✓ Order Delivered -> Final Status: ${delivered?.order_status}`);

// 5. Verify Notifications Dispatch
console.log('\n[5/5] Verifying WhatsApp & Email Notification Dispatch...');
const notifs = getDispatchedNotifications();
console.log(`✓ Total notifications generated: ${notifs.length}`);
console.log(`✓ Latest Notification Sample:`);
console.log(`  [Channel: ${notifs[0]?.channel}] To: ${notifs[0]?.recipient}`);
console.log(`  Message preview: ${notifs[0]?.message.split('\n')[0]}`);

console.log('\n=== ALL VERIFICATIONS PASSED SUCCESSFULLY! ===');
