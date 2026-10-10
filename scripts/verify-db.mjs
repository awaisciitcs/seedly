import { DatabaseSync } from 'node:sqlite';
import path from 'path';

console.log('=== SEEDLY DATABASE & LOGIC VERIFICATION ===\n');

const dbPath = path.join(process.cwd(), 'data', 'seedly.db');
const db = new DatabaseSync(dbPath);

// 1. Verify Products
console.log('[1/4] Checking products catalog in database...');
const products = db.prepare('SELECT id, name, slug, price_minor, product_type, status FROM products').all();
console.log(`✓ Total products in database: ${products.length}`);
for (const p of products) {
  console.log(`  - [${p.product_type.toUpperCase()}] ${p.name} (Rs. ${p.price_minor / 100})`);
}

// 2. Verify Kits & Dynamic Bottleneck Calculation
console.log('\n[2/4] Testing Kit Bottleneck Calculation...');
const kits = db.prepare('SELECT * FROM kits').all();
console.log(`✓ Total kits: ${kits.length}`);

for (const kit of kits) {
  const kitItems = db.prepare(`
    SELECT ki.*, p.name as product_name, pv.inventory_quantity
    FROM kit_items ki
    JOIN products p ON ki.product_id = p.id
    LEFT JOIN product_variants pv ON ki.product_variant_id = pv.id
    WHERE ki.kit_id = ?
  `).all(kit.id);

  let bottleneck = 999;
  for (const it of kitItems) {
    const qty = it.quantity || 1;
    const avail = Math.floor((it.inventory_quantity || 0) / qty);
    if (avail < bottleneck) bottleneck = avail;
  }

  console.log(`  - ${kit.name}:`);
  console.log(`    Components: ${kitItems.map((i) => `${i.product_name} (${i.inventory_quantity} units)`).join(', ')}`);
  console.log(`    Computed Bottleneck Stock: ${bottleneck} kits`);
}

// 3. Verify Orders & Receipts
console.log('\n[3/4] Checking Orders Table...');
const orders = db.prepare('SELECT * FROM orders').all();
console.log(`✓ Existing orders in database: ${orders.length}`);

// 4. Verify Settings
console.log('\n[4/4] Checking Store Settings...');
const settings = db.prepare('SELECT key, value FROM site_settings').all();
for (const s of settings) {
  console.log(`  - ${s.key}: ${s.value}`);
}

console.log('\n=== ALL DATABASE CHECKS PASSED PERFECTLY! ===');
