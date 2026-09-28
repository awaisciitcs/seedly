import { getDatabase, toPlain } from '../db';
import { Kit, KitItem } from '../types';

export function getKits(options?: { status?: string; search?: string }): Kit[] {
  const db = getDatabase();
  let query = `SELECT * FROM kits WHERE 1=1`;
  const params: any[] = [];

  if (options?.status) {
    query += ` AND status = ?`;
    params.push(options.status);
  } else {
    query += ` AND status = 'ACTIVE'`;
  }

  if (options?.search) {
    query += ` AND (name LIKE ? OR short_description LIKE ? OR ingredients LIKE ?)`;
    const term = `%${options.search}%`;
    params.push(term, term, term);
  }

  query += ` ORDER BY is_featured DESC, created_at ASC`;

  const rows = db.prepare(query).all(...params) as any[];

  return toPlain(rows.map((row) => mapRowToKit(db, row)));
}

export function getKitBySlug(slug: string): Kit | null {
  const db = getDatabase();
  const row = db.prepare(`SELECT * FROM kits WHERE slug = ?`).get(slug) as any;
  if (!row) return null;
  return toPlain(mapRowToKit(db, row));
}

export function getKitById(id: string): Kit | null {
  const db = getDatabase();
  const row = db.prepare(`SELECT * FROM kits WHERE id = ?`).get(id) as any;
  if (!row) return null;
  return toPlain(mapRowToKit(db, row));
}

function mapRowToKit(db: any, row: any): Kit {
  // Fetch component items
  const itemsRaw = db.prepare(`
    SELECT ki.*, p.name as product_name, pv.option_value as variant_name,
           COALESCE(pv.inventory_quantity, 50) as variant_stock
    FROM kit_items ki
    JOIN products p ON ki.product_id = p.id
    LEFT JOIN product_variants pv ON ki.product_variant_id = pv.id
    WHERE ki.kit_id = ?
    ORDER BY ki.sort_order ASC
  `).all(row.id) as any[];

  let minStock = 999;
  const items: KitItem[] = itemsRaw.map((it) => {
    const available = Math.floor(it.variant_stock / (it.quantity || 1));
    if (available < minStock) {
      minStock = available;
    }
    return {
      id: it.id,
      kit_id: it.kit_id,
      product_id: it.product_id,
      product_name: it.product_name,
      variant_name: it.variant_name || undefined,
      quantity: it.quantity,
      available_stock: it.variant_stock,
    };
  });

  const computed_stock = items.length > 0 ? (minStock === 999 ? 0 : minStock) : 0;

  // Fetch reviews stats
  const reviewStats = db.prepare(`
    SELECT COUNT(*) as count, AVG(rating) as avg_rating
    FROM reviews
    WHERE product_id = ? AND status = 'APPROVED'
  `).get(row.id) as any;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    short_description: row.short_description || '',
    description: row.description || '',
    price_minor: row.price_minor,
    compare_price_minor: row.compare_price_minor || undefined,
    currency: row.currency || 'PKR',
    status: row.status,
    package_size: row.package_size || '',
    ingredients: row.ingredients || '',
    usage_instructions: row.usage_instructions || '',
    storage_instructions: row.storage_instructions || '',
    compliance_status: row.compliance_status || 'APPROVED',
    image_url: row.image_url,
    badge: row.badge || undefined,
    is_featured: Boolean(row.is_featured),
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    items,
    computed_stock,
    rating: reviewStats?.count > 0 && reviewStats?.avg_rating ? Math.round(reviewStats.avg_rating * 10) / 10 : 5.0,
    review_count: reviewStats?.count || 0,
  };
}
