import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { runSeed } from './seed';

let dbInstance: DatabaseSync | null = null;

export function toPlain<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  return JSON.parse(JSON.stringify(obj));
}

function resolveDbPath(): { dbPath: string; isServerless: boolean } {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    (process.env.NODE_ENV === 'production' && !fs.existsSync(path.join(process.cwd(), 'data')))
  );

  if (isServerless) {
    const tmpDir = os.tmpdir() || '/tmp';
    const tmpDbPath = path.join(tmpDir, 'seedly.db');

    // If tmpDbPath doesn't exist, try to copy the source seedly.db if it exists
    if (!fs.existsSync(tmpDbPath)) {
      const sourceDbPath = path.join(process.cwd(), 'data', 'seedly.db');
      if (fs.existsSync(sourceDbPath)) {
        try {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        } catch (copyErr) {
          console.warn('Could not copy bundled seedly.db to /tmp:', copyErr);
        }
      }
    }
    return { dbPath: tmpDbPath, isServerless: true };
  }

  // Local development
  const localDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(localDir)) {
    try {
      fs.mkdirSync(localDir, { recursive: true });
    } catch {
      // In case localDir cannot be created, fallback to tmp
      const tmpDbPath = path.join(os.tmpdir(), 'seedly.db');
      return { dbPath: tmpDbPath, isServerless: true };
    }
  }

  return { dbPath: path.join(localDir, 'seedly.db'), isServerless: false };
}

export function getDatabase(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const { dbPath, isServerless } = resolveDbPath();
  dbInstance = new DatabaseSync(dbPath);

  if (isServerless) {
    dbInstance.exec(`
      PRAGMA journal_mode = DELETE;
      PRAGMA busy_timeout = 5000;
    `);
  } else {
    // Configure SQLite for high concurrency in local dev (WAL mode + 10s busy timeout)
    dbInstance.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA busy_timeout = 10000;
    `);
  }

  // Initialize schema
  initSchema(dbInstance);

  // Seed default catalog & settings if not present
  try {
    runSeed(dbInstance);
  } catch (err: any) {
    // If another worker thread already seeded, ignore locked error
    if (!err?.message?.includes('locked')) {
      console.error('Error during auto-seed:', err);
    }
  }

  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      product_type TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      short_description TEXT,
      description TEXT,
      price_minor INTEGER NOT NULL,
      compare_price_minor INTEGER,
      currency TEXT DEFAULT 'PKR',
      weight_grams INTEGER DEFAULT 250,
      ingredients TEXT,
      usage_instructions TEXT,
      storage_instructions TEXT,
      flavor_profile TEXT,
      caffeine_level TEXT,
      steep_time TEXT,
      water_temp TEXT,
      nutrition_information TEXT,
      seo_title TEXT,
      seo_description TEXT,
      image_url TEXT NOT NULL,
      gallery_images TEXT,
      badge TEXT,
      is_featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      option_name TEXT DEFAULT 'Pack Size',
      option_value TEXT NOT NULL,
      price_minor INTEGER NOT NULL,
      compare_price_minor INTEGER,
      weight_grams INTEGER NOT NULL,
      inventory_quantity INTEGER DEFAULT 50,
      status TEXT DEFAULT 'ACTIVE',
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS kits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      short_description TEXT,
      description TEXT,
      price_minor INTEGER NOT NULL,
      compare_price_minor INTEGER,
      currency TEXT DEFAULT 'PKR',
      status TEXT DEFAULT 'ACTIVE',
      package_size TEXT,
      ingredients TEXT,
      usage_instructions TEXT,
      storage_instructions TEXT,
      compliance_status TEXT DEFAULT 'APPROVED',
      image_url TEXT NOT NULL,
      gallery_images TEXT,
      badge TEXT,
      is_featured INTEGER DEFAULT 1,
      seo_title TEXT,
      seo_description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS kit_items (
      id TEXT PRIMARY KEY,
      kit_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_variant_id TEXT,
      quantity INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (kit_id) REFERENCES kits(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      shipping_city TEXT NOT NULL,
      shipping_province TEXT NOT NULL,
      shipping_postal_code TEXT,
      shipping_notes TEXT,
      currency TEXT DEFAULT 'PKR',
      subtotal_minor INTEGER NOT NULL,
      shipping_minor INTEGER NOT NULL,
      discount_minor INTEGER DEFAULT 0,
      total_minor INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      order_status TEXT NOT NULL,
      tracking_courier TEXT,
      tracking_number TEXT,
      idempotency_key TEXT,
      receipt_path TEXT,
      admin_note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT,
      kit_id TEXT,
      name_snapshot TEXT NOT NULL,
      sku_snapshot TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price_minor INTEGER NOT NULL,
      line_total_minor INTEGER NOT NULL,
      metadata TEXT,
      image_url TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT DEFAULT 'APPROVED',
      verified_purchase INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      subscribed_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_alert_subscriptions (
      id TEXT PRIMARY KEY,
      product_id TEXT,
      product_variant_id TEXT,
      kit_id TEXT,
      sellable_title TEXT NOT NULL,
      user_id TEXT,
      email TEXT NOT NULL,
      normalized_email TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      unsubscribe_token TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      notified_at TEXT,
      last_error TEXT
    );

    CREATE TABLE IF NOT EXISTS stock_alert_deliveries (
      id TEXT PRIMARY KEY,
      subscription_id TEXT NOT NULL,
      channel TEXT DEFAULT 'EMAIL',
      notification_type TEXT NOT NULL,
      status TEXT NOT NULL,
      attempt_count INTEGER DEFAULT 1,
      sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
      error_message TEXT,
      FOREIGN KEY (subscription_id) REFERENCES stock_alert_subscriptions(id) ON DELETE CASCADE
    );
  `);
}
