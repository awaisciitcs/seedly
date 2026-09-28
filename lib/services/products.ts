import { getDatabase, toPlain } from '../db';
import { Product, ProductVariant } from '../types';

export function getProducts(options?: {
  categorySlug?: string;
  productType?: string;
  status?: string;
  search?: string;
  sort?: string; // 'price-asc' | 'price-desc' | 'newest' | 'rating'
  limit?: number;
}): Product[] {
  const db = getDatabase();
  let query = `
    SELECT p.*, c.slug as category_slug, c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (options?.status) {
    query += ` AND p.status = ?`;
    params.push(options.status);
  } else {
    query += ` AND p.status = 'ACTIVE'`;
  }

  if (options?.categorySlug && options.categorySlug !== 'all') {
    query += ` AND c.slug = ?`;
    params.push(options.categorySlug);
  }

  if (options?.productType) {
    query += ` AND p.product_type = ?`;
    params.push(options.productType);
  }

  if (options?.search) {
    query += ` AND (p.name LIKE ? OR p.short_description LIKE ? OR p.ingredients LIKE ?)`;
    const term = `%${options.search}%`;
    params.push(term, term, term);
  }

  // Sorting
  if (options?.sort === 'price-asc') {
    query += ` ORDER BY p.price_minor ASC`;
  } else if (options?.sort === 'price-desc') {
    query += ` ORDER BY p.price_minor DESC`;
  } else if (options?.sort === 'newest') {
    query += ` ORDER BY p.created_at DESC`;
  } else {
    query += ` ORDER BY p.is_featured DESC, p.created_at DESC`;
  }

  if (options?.limit) {
    query += ` LIMIT ?`;
    params.push(options.limit);
  }

  const rows = db.prepare(query).all(...params) as any[];

  return toPlain(rows.map((row) => mapRowToProduct(db, row)));
}

export function getProductBySlug(slug: string): Product | null {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT p.*, c.slug as category_slug, c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ?
  `).get(slug) as any;

  if (!row) return null;
  return toPlain(mapRowToProduct(db, row));
}

export function getProductById(id: string): Product | null {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT p.*, c.slug as category_slug, c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(id) as any;

  if (!row) return null;
  return toPlain(mapRowToProduct(db, row));
}

export function getFeaturedProducts(): Product[] {
  return getProducts({ limit: 8 });
}

function mapRowToProduct(db: any, row: any): Product {
  // Fetch variants with standard 250g pantry size first
  const variants = db.prepare(`
    SELECT * FROM product_variants 
    WHERE product_id = ? 
    ORDER BY CASE WHEN weight_grams = 250 THEN 0 ELSE 1 END, weight_grams ASC
  `).all(row.id) as unknown as ProductVariant[];

  // Fetch reviews stats
  const reviewStats = db.prepare(`
    SELECT COUNT(*) as count, AVG(rating) as avg_rating
    FROM reviews
    WHERE product_id = ? AND status = 'APPROVED'
  `).get(row.id) as any;

  let nutrition = undefined;
  if (row.nutrition_information) {
    try {
      nutrition = JSON.parse(row.nutrition_information);
    } catch {
      nutrition = undefined;
    }
  }

  return {
    id: row.id,
    category_id: row.category_id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    product_type: row.product_type,
    status: row.status,
    short_description: row.short_description || '',
    description: row.description || '',
    price_minor: row.price_minor,
    compare_price_minor: row.compare_price_minor || undefined,
    currency: row.currency || 'PKR',
    weight_grams: row.weight_grams,
    ingredients: row.ingredients || '',
    usage_instructions: row.usage_instructions || '',
    storage_instructions: row.storage_instructions || '',
    flavor_profile: row.flavor_profile || undefined,
    caffeine_level: row.caffeine_level || undefined,
    steep_time: row.steep_time || undefined,
    water_temp: row.water_temp || undefined,
    nutrition_information: nutrition,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    image_url: row.image_url,
    badge: row.badge || undefined,
    is_featured: Boolean(row.is_featured),
    variants,
    rating: reviewStats?.avg_rating ? Math.round(reviewStats.avg_rating * 10) / 10 : 5.0,
    review_count: reviewStats?.count || 0,
  };
}
