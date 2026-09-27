import { getDatabase, toPlain } from '../db';
import { Review } from '../types';

function mapRowToReview(row: any): Review {
  return {
    id: row.id,
    product_id: row.product_id,
    product_name: row.product_name,
    customer_name: row.customer_name,
    rating: row.rating,
    title: row.title,
    body: row.body,
    status: row.status,
    verified_purchase: Boolean(row.verified_purchase),
    created_at: row.created_at,
  };
}

export function getApprovedReviews(productId?: string): Review[] {
  const db = getDatabase();
  let query = `SELECT * FROM reviews WHERE status = 'APPROVED'`;
  const params: any[] = [];
  if (productId) {
    query += ` AND product_id = ?`;
    params.push(productId);
  }
  query += ` ORDER BY created_at DESC`;
  const rows = db.prepare(query).all(...params) as any[];
  return toPlain(rows.map(mapRowToReview));
}

export function getAllReviews(options?: { status?: string; productId?: string }): Review[] {
  const db = getDatabase();
  let query = `SELECT * FROM reviews WHERE 1=1`;
  const params: any[] = [];
  if (options?.status && options.status !== 'ALL') {
    query += ` AND status = ?`;
    params.push(options.status);
  }
  if (options?.productId) {
    query += ` AND product_id = ?`;
    params.push(options.productId);
  }
  query += ` ORDER BY created_at DESC`;
  const rows = db.prepare(query).all(...params) as any[];
  return toPlain(rows.map(mapRowToReview));
}

export function createReview(data: {
  product_id: string;
  product_name: string;
  customer_name: string;
  rating: number;
  title: string;
  body: string;
  verified_purchase?: boolean;
}): Review {
  const db = getDatabase();
  const id = `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const status = 'PENDING';
  const verified = data.verified_purchase !== false ? 1 : 0;

  db.prepare(`
    INSERT INTO reviews (
      id, product_id, product_name, customer_name, rating, title, body, status, verified_purchase
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.product_id,
    data.product_name,
    data.customer_name,
    Math.min(5, Math.max(1, Math.round(data.rating))),
    data.title,
    data.body,
    status,
    verified
  );

  const row = db.prepare(`SELECT * FROM reviews WHERE id = ?`).get(id) as any;
  return toPlain(mapRowToReview(row));
}

export function updateReviewStatus(id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING'): boolean {
  const db = getDatabase();
  const result = db.prepare(`
    UPDATE reviews SET status = ? WHERE id = ?
  `).run(status, id);
  return result.changes > 0;
}

export function deleteReview(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare(`
    DELETE FROM reviews WHERE id = ?
  `).run(id);
  return result.changes > 0;
}
