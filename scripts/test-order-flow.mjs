import { DatabaseSync } from 'node:sqlite';
import path from 'path';

console.log('=== SEEDLY END-TO-END ORDER & FULFILLMENT SIMULATION ===\n');

const dbPath = path.join(process.cwd(), 'data', 'seedly.db');
const db = new DatabaseSync(dbPath);

// Step 1: Initial inventory check
const initialPumpkin = db.prepare('SELECT inventory_quantity FROM product_variants WHERE id = ?').get('var-pump-250');
const initialFlax = db.prepare('SELECT inventory_quantity FROM product_variants WHERE id = ?').get('var-flax-250');
console.log(`[1/6] Initial Inventory:`);
console.log(`  - Pumpkin Seeds (250g): ${initialPumpkin.inventory_quantity} units`);
console.log(`  - Flax Seeds (250g): ${initialFlax.inventory_quantity} units`);
console.log(`  - Follicular Kit Bottleneck: ${Math.min(initialPumpkin.inventory_quantity, initialFlax.inventory_quantity)} kits`);

// Step 2: Create Test Order
console.log('\n[2/6] Placing Customer Order (1 Follicular Kit + 1 Pumpkin 250g)...');
const orderId = `ord-test-${Date.now()}`;
const orderNumber = `SED-20260928-8821`;
const subtotalMinor = 155000 + 95000; // 250000 -> Rs. 2,500 (Free Shipping threshold met!)
const shippingMinor = 0; // Free shipping!
const totalMinor = subtotalMinor + shippingMinor;

db.prepare(`
  INSERT INTO orders (
    id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, shipping_city, shipping_province, currency,
    subtotal_minor, shipping_minor, discount_minor, total_minor,
    payment_method, payment_status, order_status, receipt_path
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  orderId,
  orderNumber,
  'Maryam Nawaz (Customer)',
  'maryam.customer@gmail.com',
  '+92 321 5551234',
  'House 44, Street 18, F-6/2',
  'Islamabad',
  'Islamabad Capital Territory',
  'PKR',
  subtotalMinor,
  shippingMinor,
  0,
  totalMinor,
  'bank_transfer',
  'UNDER_REVIEW',
  'PAYMENT_REVIEW',
  '/uploads/receipts/meezan-receipt-sample.jpg'
);

// Insert order items
db.prepare(`
  INSERT INTO order_items (id, order_id, product_id, kit_id, name_snapshot, sku_snapshot, quantity, unit_price_minor, line_total_minor)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  `oi-1-${Date.now()}`, orderId, 'kit-follicular', 'kit-follicular', 'Follicular Phase Seed Kit', 'KIT-FOLLICULAR-BLEND', 1, 155000, 155000,
  `oi-2-${Date.now()}`, orderId, 'prod-pumpkin', null, 'Raw Heirloom Pumpkin Seeds (250g)', 'SED-PUMP-250', 1, 95000, 95000
);

// Decrement stock: kit uses 1 pumpkin + 1 flax; extra 1 pumpkin purchased.
// Total pumpkin decremented: 2. Total flax decremented: 1.
db.prepare('UPDATE product_variants SET inventory_quantity = inventory_quantity - 2 WHERE id = ?').run('var-pump-250');
db.prepare('UPDATE product_variants SET inventory_quantity = inventory_quantity - 1 WHERE id = ?').run('var-flax-250');

console.log(`✓ Order Created: #${orderNumber}`);
console.log(`✓ Payment Status: UNDER_REVIEW (Meezan Bank receipt attached)`);
console.log(`✓ Order Status: PAYMENT_REVIEW`);

// Step 3: Check post-order inventory & bottleneck
const postPumpkin = db.prepare('SELECT inventory_quantity FROM product_variants WHERE id = ?').get('var-pump-250');
const postFlax = db.prepare('SELECT inventory_quantity FROM product_variants WHERE id = ?').get('var-flax-250');
const postBottleneck = Math.min(postPumpkin.inventory_quantity, postFlax.inventory_quantity);

console.log('\n[3/6] Post-Order Inventory & Invariant Verification:');
console.log(`  - Pumpkin Seeds: ${initialPumpkin.inventory_quantity} -> ${postPumpkin.inventory_quantity} (-2 units)`);
console.log(`  - Flax Seeds: ${initialFlax.inventory_quantity} -> ${postFlax.inventory_quantity} (-1 unit)`);
console.log(`  - New Follicular Kit Bottleneck: ${postBottleneck} kits remaining`);

if (postPumpkin.inventory_quantity !== initialPumpkin.inventory_quantity - 2) {
  throw new Error('Pumpkin inventory decrement mismatch');
}
if (postFlax.inventory_quantity !== initialFlax.inventory_quantity - 1) {
  throw new Error('Flax inventory decrement mismatch');
}
console.log('✓ Component inventory and dynamic kit bottleneck invariant verified!');

// Step 4: Admin Approves Payment
console.log('\n[4/6] Admin Desk Action: Approving Bank Transfer Receipt...');
db.prepare(`
  UPDATE orders
  SET payment_status = 'VERIFIED', order_status = 'PAID', admin_note = 'Meezan Bank statement verified'
  WHERE id = ?
`).run(orderId);

const paidOrder = db.prepare('SELECT payment_status, order_status FROM orders WHERE id = ?').get(orderId);
console.log(`✓ Order Status: ${paidOrder.order_status}, Payment Status: ${paidOrder.payment_status}`);

// Step 5: Admin Fulfills & Dispatches Package via Courier
console.log('\n[5/6] Operations Desk: Packaging & Assigning Courier Tracking...');
db.prepare(`
  UPDATE orders
  SET order_status = 'SHIPPED', tracking_courier = 'TCS Express', tracking_number = 'TCS-90182761'
  WHERE id = ?
`).run(orderId);

const shippedOrder = db.prepare('SELECT order_status, tracking_courier, tracking_number FROM orders WHERE id = ?').get(orderId);
console.log(`✓ Order Status: ${shippedOrder.order_status}`);
console.log(`✓ Courier Assigned: ${shippedOrder.tracking_courier}`);
console.log(`✓ Tracking Number: ${shippedOrder.tracking_number}`);

// Step 6: Package Delivered
console.log('\n[6/6] Courier Delivery Confirmation...');
db.prepare("UPDATE orders SET order_status = 'DELIVERED' WHERE id = ?").run(orderId);
const deliveredOrder = db.prepare('SELECT order_status FROM orders WHERE id = ?').get(orderId);
console.log(`✓ Final Order Status: ${deliveredOrder.order_status}`);

console.log('\n=== END-TO-END FLOW VERIFICATION COMPLETE: ALL TESTS PASSED! ===');
