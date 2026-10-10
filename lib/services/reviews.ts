import crypto from 'node:crypto';
import { RequestError } from '../request-guards';
import { createPublicClient } from '../supabase/public';
import { createAdminClient, getScopedClient } from '../supabase/admin';
import { Review } from '../types';

function mapRowToReview(row: any): Review {
  return {
    id: row.id,
    product_id: row.product_id || row.kit_id || '',
    product_name: row.product_name || 'Seedly Botanical Harvest',
    customer_name: row.customer_name || 'Valued Customer',
    rating: Number(row.rating) || 5,
    title: row.title || '',
    body: row.body || '',
    status: row.status || 'PENDING',
    verified_purchase: Boolean(row.verified_purchase),
    created_at: row.created_at || new Date().toISOString(),
  };
}

export async function getApprovedReviews(productId?: string): Promise<Review[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from('reviews')
    .select('*')
    .eq('status', 'APPROVED')
    .eq('is_demo', false);

  if (productId) {
    query = query.or(`product_id.eq.${productId},kit_id.eq.${productId}`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error('Approved reviews are unavailable.');
  }

  return (data || []).map(mapRowToReview);
}

export async function getAllReviews(options?: { status?: string; productId?: string }): Promise<Review[]> {
  const supabase = await getScopedClient();
  let query = supabase.from('reviews').select('*');

  if (options?.status && options.status !== 'ALL') {
    query = query.eq('status', options.status);
  }

  if (options?.productId) {
    query = query.or(`product_id.eq.${options.productId},kit_id.eq.${options.productId}`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error('Review moderation is unavailable.');
  }

  return (data || []).map(mapRowToReview);
}

export async function createReview(data: {
  product_id: string;
  product_name: string;
  customer_name: string;
  rating: number;
  title: string;
  body: string;
  verified_purchase?: boolean;
}): Promise<Review> {
  if (!process.env.SUPABASE_SECRET_KEY) throw new RequestError('Review submissions are temporarily unavailable.', 503);
  const supabase = createAdminClient();
  const id = `rev-${crypto.randomUUID()}`;

  const isKit = data.product_id.startsWith('kit-');
  const productId = isKit ? null : data.product_id;
  const kitId = isKit ? data.product_id : null;
  const { data: target, error: targetError } = await supabase.from(isKit ? 'kits' : 'products').select('id,name,status').eq('id',data.product_id).eq('status','ACTIVE').single();
  if (targetError || !target) throw new RequestError('This product is no longer available.');

  const newRow = {
    id,
    product_id: productId,
    kit_id: kitId,
    product_name: target.name,
    customer_name: data.customer_name,
    rating: Math.min(5, Math.max(1, Math.round(data.rating))),
    title: data.title,
    body: data.body,
    status: 'PENDING',
    verified_purchase: false,
    is_demo: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Pending rows are deliberately not publicly readable. Do not request a
  // SELECT projection after insertion or RLS would reject a valid submission.
  const { error } = await supabase.from('reviews').insert([newRow]);

  if (error) {
    throw new Error(`Failed to submit review: ${error.message}`);
  }

  return mapRowToReview(newRow);
}

export async function updateReviewStatus(
  id: string,
  status: 'APPROVED' | 'REJECTED' | 'PENDING'
): Promise<boolean> {
  const supabase = await getScopedClient();
  const { data, error } = await supabase
    .from('reviews')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id');

  if (error) {
    throw new Error('Review moderation is temporarily unavailable.');
  }

  return Boolean(data && data.length > 0);
}

export async function deleteReview(id: string): Promise<boolean> {
  const supabase = await getScopedClient();
  const { data, error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) {
    throw new Error('Review deletion is temporarily unavailable.');
  }

  return Boolean(data && data.length > 0);
}
