import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Migration script from SQLite data/seedly.db to Supabase PostgreSQL
// Preserves IDs, minor unit prices, timestamps, and fixes schema traps.

function hashToken(token) {
  return crypto.createHash('sha256').update(token || 'default-seed').digest('hex');
}

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val.toString();
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (Array.isArray(val)) {
    const arrayElements = val.map(v => '"' + String(v).replace(/"/g, '\\"') + '"').join(',');
    return `'{${arrayElements}}'`;
  }
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

export function generateMigrationSql() {
  const dbPath = path.join(process.cwd(), 'data', 'seedly.db');
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Authoritative SQLite database not found at ${dbPath}`);
  }

  const db = new DatabaseSync(dbPath);
  const sqlStatements = [];

  sqlStatements.push('-- Migration Dump from SQLite data/seedly.db to Supabase Postgres');
  sqlStatements.push('BEGIN;');

  // 1. Categories
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
  for (const c of categories) {
    sqlStatements.push(`
      INSERT INTO public.categories (id, name, slug, type, description, sort_order, is_active, created_at, updated_at)
      VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.slug)}, ${escapeSql(c.type || 'seed')}, ${escapeSql(c.description)}, ${escapeSql(c.sort_order || 0)}, ${c.is_active ? 'true' : 'false'}, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        type = EXCLUDED.type,
        description = EXCLUDED.description,
        sort_order = EXCLUDED.sort_order,
        is_active = EXCLUDED.is_active;
    `);
  }

  // 2. Products
  const products = db.prepare('SELECT * FROM products ORDER BY id ASC').all();
  for (const p of products) {
    let nutrition = null;
    if (p.nutrition_information) {
      try {
        nutrition = JSON.parse(p.nutrition_information);
      } catch {
        nutrition = null;
      }
    }
    let gallery = null;
    if (p.gallery_images) {
      try {
        gallery = JSON.parse(p.gallery_images);
      } catch {
        gallery = null;
      }
    }

    sqlStatements.push(`
      INSERT INTO public.products (
        id, category_id, name, slug, sku, product_type, status, short_description,
        description, price_minor, compare_price_minor, currency, weight_grams,
        ingredients, usage_instructions, storage_instructions, flavor_profile,
        caffeine_level, steep_time, water_temp, nutrition_information, seo_title,
        seo_description, image_url, gallery_images, badge, is_featured, created_at, updated_at
      ) VALUES (
        ${escapeSql(p.id)}, ${escapeSql(p.category_id)}, ${escapeSql(p.name)}, ${escapeSql(p.slug)},
        ${escapeSql(p.sku)}, ${escapeSql(p.product_type || 'seed')}, ${escapeSql(p.status || 'ACTIVE')},
        ${escapeSql(p.short_description)}, ${escapeSql(p.description)}, ${p.price_minor},
        ${escapeSql(p.compare_price_minor)}, ${escapeSql(p.currency || 'PKR')}, ${escapeSql(p.weight_grams || 250)},
        ${escapeSql(p.ingredients)}, ${escapeSql(p.usage_instructions)}, ${escapeSql(p.storage_instructions)},
        ${escapeSql(p.flavor_profile)}, ${escapeSql(p.caffeine_level)}, ${escapeSql(p.steep_time)},
        ${escapeSql(p.water_temp)}, ${escapeSql(nutrition)}, ${escapeSql(p.seo_title)},
        ${escapeSql(p.seo_description)}, ${escapeSql(p.image_url)}, ${escapeSql(gallery)},
        ${escapeSql(p.badge)}, ${p.is_featured ? 'true' : 'false'},
        ${escapeSql(p.created_at || new Date().toISOString())},
        ${escapeSql(p.updated_at || new Date().toISOString())}
      )
      ON CONFLICT (id) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        sku = EXCLUDED.sku,
        product_type = EXCLUDED.product_type,
        status = EXCLUDED.status,
        short_description = EXCLUDED.short_description,
        description = EXCLUDED.description,
        price_minor = EXCLUDED.price_minor,
        compare_price_minor = EXCLUDED.compare_price_minor,
        currency = EXCLUDED.currency,
        weight_grams = EXCLUDED.weight_grams,
        ingredients = EXCLUDED.ingredients,
        usage_instructions = EXCLUDED.usage_instructions,
        storage_instructions = EXCLUDED.storage_instructions,
        flavor_profile = EXCLUDED.flavor_profile,
        caffeine_level = EXCLUDED.caffeine_level,
        steep_time = EXCLUDED.steep_time,
        water_temp = EXCLUDED.water_temp,
        nutrition_information = EXCLUDED.nutrition_information,
        seo_title = EXCLUDED.seo_title,
        seo_description = EXCLUDED.seo_description,
        image_url = EXCLUDED.image_url,
        gallery_images = EXCLUDED.gallery_images,
        badge = EXCLUDED.badge,
        is_featured = EXCLUDED.is_featured;
    `);
  }

  // 3. Product Variants
  const variants = db.prepare('SELECT * FROM product_variants ORDER BY id ASC').all();
  for (const v of variants) {
    sqlStatements.push(`
      INSERT INTO public.product_variants (
        id, product_id, sku, option_name, option_value, price_minor,
        compare_price_minor, weight_grams, inventory_quantity, status, created_at, updated_at
      ) VALUES (
        ${escapeSql(v.id)}, ${escapeSql(v.product_id)}, ${escapeSql(v.sku)},
        ${escapeSql(v.option_name || 'Pack Size')}, ${escapeSql(v.option_value)},
        ${v.price_minor}, ${escapeSql(v.compare_price_minor)}, ${v.weight_grams},
        ${v.inventory_quantity ?? 0}, ${escapeSql(v.status || 'ACTIVE')},
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        product_id = EXCLUDED.product_id,
        sku = EXCLUDED.sku,
        option_name = EXCLUDED.option_name,
        option_value = EXCLUDED.option_value,
        price_minor = EXCLUDED.price_minor,
        compare_price_minor = EXCLUDED.compare_price_minor,
        weight_grams = EXCLUDED.weight_grams,
        inventory_quantity = EXCLUDED.inventory_quantity,
        status = EXCLUDED.status;
    `);
  }

  // 4. Kits
  const kits = db.prepare('SELECT * FROM kits ORDER BY id ASC').all();
  for (const k of kits) {
    let gallery = null;
    if (k.gallery_images) {
      try {
        gallery = JSON.parse(k.gallery_images);
      } catch {
        gallery = null;
      }
    }

    sqlStatements.push(`
      INSERT INTO public.kits (
        id, name, slug, short_description, description, price_minor,
        compare_price_minor, currency, status, package_size, ingredients,
        usage_instructions, storage_instructions, compliance_status,
        image_url, gallery_images, badge, is_featured, seo_title,
        seo_description, created_at, updated_at
      ) VALUES (
        ${escapeSql(k.id)}, ${escapeSql(k.name)}, ${escapeSql(k.slug)},
        ${escapeSql(k.short_description)}, ${escapeSql(k.description)},
        ${k.price_minor}, ${escapeSql(k.compare_price_minor)},
        ${escapeSql(k.currency || 'PKR')}, ${escapeSql(k.status || 'ACTIVE')},
        ${escapeSql(k.package_size)}, ${escapeSql(k.ingredients)},
        ${escapeSql(k.usage_instructions)}, ${escapeSql(k.storage_instructions)},
        ${escapeSql(k.compliance_status || 'APPROVED')}, ${escapeSql(k.image_url)},
        ${escapeSql(gallery)}, ${escapeSql(k.badge)}, ${k.is_featured ? 'true' : 'false'},
        ${escapeSql(k.seo_title)}, ${escapeSql(k.seo_description)},
        ${escapeSql(k.created_at || new Date().toISOString())}, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        short_description = EXCLUDED.short_description,
        description = EXCLUDED.description,
        price_minor = EXCLUDED.price_minor,
        compare_price_minor = EXCLUDED.compare_price_minor,
        currency = EXCLUDED.currency,
        status = EXCLUDED.status,
        package_size = EXCLUDED.package_size,
        ingredients = EXCLUDED.ingredients,
        usage_instructions = EXCLUDED.usage_instructions,
        storage_instructions = EXCLUDED.storage_instructions,
        compliance_status = EXCLUDED.compliance_status,
        image_url = EXCLUDED.image_url,
        gallery_images = EXCLUDED.gallery_images,
        badge = EXCLUDED.badge,
        is_featured = EXCLUDED.is_featured,
        seo_title = EXCLUDED.seo_title,
        seo_description = EXCLUDED.seo_description;
    `);
  }

  // 5. Kit Items
  const kitItems = db.prepare('SELECT * FROM kit_items ORDER BY id ASC').all();
  for (const ki of kitItems) {
    const varId = ki.product_variant_id || null;
    sqlStatements.push(`
      INSERT INTO public.kit_items (
        id, kit_id, product_id, variant_id, product_variant_id, quantity, sort_order, created_at, updated_at
      ) VALUES (
        ${escapeSql(ki.id)}, ${escapeSql(ki.kit_id)}, ${escapeSql(ki.product_id)},
        ${escapeSql(varId)}, ${escapeSql(varId)}, ${ki.quantity || 1}, ${ki.sort_order || 0},
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        kit_id = EXCLUDED.kit_id,
        product_id = EXCLUDED.product_id,
        variant_id = EXCLUDED.variant_id,
        product_variant_id = EXCLUDED.product_variant_id,
        quantity = EXCLUDED.quantity,
        sort_order = EXCLUDED.sort_order;
    `);
  }

  // 6. Site Settings
  const settings = db.prepare('SELECT * FROM site_settings').all();
  for (const s of settings) {
    sqlStatements.push(`
      INSERT INTO public.site_settings (key, value, updated_at)
      VALUES (${escapeSql(s.key)}, ${escapeSql(s.value)}, NOW())
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW();
    `);
  }

  // 7. Reviews (with demo review handling and kit vs product reference normalization)
  const reviews = db.prepare('SELECT * FROM reviews ORDER BY id ASC').all();
  for (const r of reviews) {
    // Check if target is kit or product
    const isKit = r.product_id && r.product_id.startsWith('kit-');
    const prodId = isKit ? null : r.product_id;
    const kitId = isKit ? r.product_id : null;
    // rev-1 through rev-4 are demo reviews
    const isDemo = ['rev-1', 'rev-2', 'rev-3', 'rev-4'].includes(r.id);

    sqlStatements.push(`
      INSERT INTO public.reviews (
        id, product_id, kit_id, product_name, customer_name, rating,
        title, body, status, verified_purchase, is_demo, created_at, updated_at
      ) VALUES (
        ${escapeSql(r.id)}, ${escapeSql(prodId)}, ${escapeSql(kitId)},
        ${escapeSql(r.product_name)}, ${escapeSql(r.customer_name)}, ${r.rating},
        ${escapeSql(r.title)}, ${escapeSql(r.body)}, ${escapeSql(r.status || 'APPROVED')},
        ${r.verified_purchase ? 'true' : 'false'}, ${isDemo ? 'true' : 'false'},
        ${escapeSql(r.created_at || new Date().toISOString())}, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        product_id = EXCLUDED.product_id,
        kit_id = EXCLUDED.kit_id,
        product_name = EXCLUDED.product_name,
        customer_name = EXCLUDED.customer_name,
        rating = EXCLUDED.rating,
        title = EXCLUDED.title,
        body = EXCLUDED.body,
        status = EXCLUDED.status,
        verified_purchase = EXCLUDED.verified_purchase,
        is_demo = EXCLUDED.is_demo;
    `);
  }

  // 8. Admin Users
  const admins = db.prepare('SELECT * FROM admin_users ORDER BY id ASC').all();
  for (const a of admins) {
    sqlStatements.push(`
      INSERT INTO public.admin_users (
        id, email, name, role, is_active, created_at, updated_at
      ) VALUES (
        ${escapeSql(a.id)}, ${escapeSql(a.email)}, ${escapeSql(a.name)},
        ${escapeSql(a.role ? a.role.toLowerCase() : 'staff')}, true,
        ${escapeSql(a.created_at || new Date().toISOString())}, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active;
    `);
  }

  // 9. Orders
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at ASC').all();
  for (const o of orders) {
    const trackingTokenHash = hashToken(o.order_number + '_salt_' + o.id);
    sqlStatements.push(`
      INSERT INTO public.orders (
        id, order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_address, shipping_city, shipping_province, shipping_postal_code,
        shipping_notes, currency, subtotal_minor, shipping_minor, discount_minor,
        total_minor, payment_method, payment_status, order_status,
        tracking_courier, tracking_number, courier_name, receipt_path,
        admin_note, notes, idempotency_key, request_fingerprint,
        tracking_token_hash, created_at, updated_at
      ) VALUES (
        ${escapeSql(o.id)}, ${escapeSql(o.order_number)}, ${escapeSql(o.user_id)},
        ${escapeSql(o.customer_name)}, ${escapeSql(o.customer_email)}, ${escapeSql(o.customer_phone)},
        ${escapeSql(o.shipping_address)}, ${escapeSql(o.shipping_city)}, ${escapeSql(o.shipping_province)},
        ${escapeSql(o.shipping_postal_code)}, ${escapeSql(o.shipping_notes)}, ${escapeSql(o.currency || 'PKR')},
        ${o.subtotal_minor}, ${o.shipping_minor}, ${o.discount_minor || 0},
        ${o.total_minor}, ${escapeSql(o.payment_method)}, ${escapeSql(o.payment_status)},
        ${escapeSql(o.order_status)}, ${escapeSql(o.tracking_courier)}, ${escapeSql(o.tracking_number)},
        ${escapeSql(o.tracking_courier)}, ${escapeSql(o.receipt_path)}, ${escapeSql(o.admin_note)},
        ${escapeSql(o.admin_note)}, ${escapeSql(o.idempotency_key)}, ${escapeSql(o.idempotency_key ? 'migrated_' + o.idempotency_key : null)},
        ${escapeSql(trackingTokenHash)}, ${escapeSql(o.created_at || new Date().toISOString())},
        ${escapeSql(o.updated_at || new Date().toISOString())}
      )
      ON CONFLICT (id) DO UPDATE SET
        order_number = EXCLUDED.order_number,
        customer_name = EXCLUDED.customer_name,
        customer_email = EXCLUDED.customer_email,
        customer_phone = EXCLUDED.customer_phone,
        shipping_address = EXCLUDED.shipping_address,
        shipping_city = EXCLUDED.shipping_city,
        shipping_province = EXCLUDED.shipping_province,
        shipping_postal_code = EXCLUDED.shipping_postal_code,
        shipping_notes = EXCLUDED.shipping_notes,
        subtotal_minor = EXCLUDED.subtotal_minor,
        shipping_minor = EXCLUDED.shipping_minor,
        discount_minor = EXCLUDED.discount_minor,
        total_minor = EXCLUDED.total_minor,
        payment_method = EXCLUDED.payment_method,
        payment_status = EXCLUDED.payment_status,
        order_status = EXCLUDED.order_status,
        tracking_courier = EXCLUDED.tracking_courier,
        tracking_number = EXCLUDED.tracking_number,
        courier_name = EXCLUDED.courier_name,
        receipt_path = EXCLUDED.receipt_path,
        admin_note = EXCLUDED.admin_note,
        notes = EXCLUDED.notes;
    `);
  }

  // 10. Order Items
  const orderItems = db.prepare('SELECT * FROM order_items ORDER BY id ASC').all();
  for (const oi of orderItems) {
    // Normalization rule: Exactly one of product_id or kit_id must be non-null
    let prodId = oi.product_id;
    let kitId = oi.kit_id;

    if (kitId) {
      prodId = null;
    } else if (prodId && prodId.startsWith('kit-')) {
      kitId = prodId;
      prodId = null;
    }

    sqlStatements.push(`
      INSERT INTO public.order_items (
        id, order_id, product_id, kit_id, variant_id,
        product_name, variant_name, price_minor, quantity, line_total_minor,
        name_snapshot, sku_snapshot, image_url, unit_price_minor, metadata,
        created_at, updated_at
      ) VALUES (
        ${escapeSql(oi.id)}, ${escapeSql(oi.order_id)}, ${escapeSql(prodId)},
        ${escapeSql(kitId)}, ${escapeSql(oi.variant_id)},
        ${escapeSql(oi.name_snapshot)}, ${escapeSql(null)},
        ${oi.unit_price_minor}, ${oi.quantity}, ${oi.line_total_minor},
        ${escapeSql(oi.name_snapshot)}, ${escapeSql(oi.sku_snapshot)},
        ${escapeSql(oi.image_url)}, ${oi.unit_price_minor}, ${escapeSql(oi.metadata)},
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        order_id = EXCLUDED.order_id,
        product_id = EXCLUDED.product_id,
        kit_id = EXCLUDED.kit_id,
        variant_id = EXCLUDED.variant_id,
        product_name = EXCLUDED.product_name,
        price_minor = EXCLUDED.price_minor,
        quantity = EXCLUDED.quantity,
        line_total_minor = EXCLUDED.line_total_minor,
        name_snapshot = EXCLUDED.name_snapshot,
        sku_snapshot = EXCLUDED.sku_snapshot,
        image_url = EXCLUDED.image_url,
        unit_price_minor = EXCLUDED.unit_price_minor;
    `);
  }

  // 11. Stock Alert Subscriptions
  const stockAlerts = db.prepare('SELECT * FROM stock_alert_subscriptions ORDER BY id ASC').all();
  for (const sa of stockAlerts) {
    const unsubsHash = hashToken(sa.unsubscribe_token || sa.id);
    sqlStatements.push(`
      INSERT INTO public.stock_alert_subscriptions (
        id, email, product_id, product_variant_id, variant_id, kit_id,
        sellable_title, user_id, normalized_email, status, unsubscribe_token,
        unsubscribe_token_hash, created_at, notified_at, last_error, updated_at
      ) VALUES (
        ${escapeSql(sa.id)}, ${escapeSql(sa.email)}, ${escapeSql(sa.product_id)},
        ${escapeSql(sa.product_variant_id)}, ${escapeSql(sa.product_variant_id)},
        ${escapeSql(sa.kit_id)}, ${escapeSql(sa.sellable_title)}, ${escapeSql(sa.user_id)},
        ${escapeSql(sa.normalized_email)}, ${escapeSql(sa.status || 'ACTIVE')},
        ${escapeSql(sa.unsubscribe_token)}, ${escapeSql(unsubsHash)},
        ${escapeSql(sa.created_at || new Date().toISOString())},
        ${escapeSql(sa.notified_at)}, ${escapeSql(sa.last_error)}, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        status = EXCLUDED.status,
        notified_at = EXCLUDED.notified_at;
    `);
  }

  // 12. Stock Alert Deliveries
  const deliveries = db.prepare('SELECT * FROM stock_alert_deliveries ORDER BY id ASC').all();
  for (const d of deliveries) {
    sqlStatements.push(`
      INSERT INTO public.stock_alert_deliveries (
        id, subscription_id, channel, notification_type, status,
        attempt_count, sent_at, error_message
      ) VALUES (
        ${escapeSql(d.id)}, ${escapeSql(d.subscription_id)}, ${escapeSql(d.channel || 'EMAIL')},
        ${escapeSql(d.notification_type || 'CONFIRMATION')}, ${escapeSql(d.status || 'SENT')},
        ${d.attempt_count || 1}, ${escapeSql(d.sent_at || new Date().toISOString())},
        ${escapeSql(d.error_message)}
      )
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  sqlStatements.push('COMMIT;');

  return {
    sql: sqlStatements.join('\n'),
    counts: {
      categories: categories.length,
      products: products.length,
      variants: variants.length,
      kits: kits.length,
      kitItems: kitItems.length,
      settings: settings.length,
      reviews: reviews.length,
      admins: admins.length,
      orders: orders.length,
      orderItems: orderItems.length,
      stockAlerts: stockAlerts.length,
      deliveries: deliveries.length,
    }
  };
}

// If run directly:
if (process.argv[1] && process.argv[1].endsWith('migrate-to-supabase.mjs')) {
  console.log('Generating migration SQL dump from SQLite...');
  const { sql, counts } = generateMigrationSql();
  const outputPath = path.join(process.cwd(), 'scripts', 'migration-dump.sql');
  fs.writeFileSync(outputPath, sql, 'utf8');
  console.log('Migration SQL generated successfully at:', outputPath);
  console.log('Row counts to migrate:', counts);
}
