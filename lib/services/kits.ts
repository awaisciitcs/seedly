import { createPublicClient } from '../supabase/public';
import { Kit, KitItem } from '../types';

function mapRowToKit(row: any, reviewStats?: { count: number; avg_rating: number }): Kit {
  const itemsRaw = (row.kit_items || []).sort(
    (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  let minStock = 999999;
  const items: KitItem[] = itemsRaw.map((it: any) => {
    const variantStock = it.product_variants?.inventory_quantity ?? 0;
    const requiredQty = it.quantity || 1;
    const available = Math.floor(variantStock / requiredQty);

    if (available < minStock) {
      minStock = available;
    }

    return {
      id: it.id,
      kit_id: it.kit_id,
      product_id: it.product_id,
      product_name: it.products?.name || 'Component Botanical',
      variant_name: it.product_variants?.option_value || undefined,
      quantity: it.quantity || 1,
      available_stock: variantStock,
    };
  });

  const computed_stock = items.length > 0 ? (minStock === 999999 ? 0 : Math.max(0, minStock)) : 0;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    short_description: row.short_description || '',
    description: row.description || '',
    price_minor: Number(row.price_minor),
    compare_price_minor: row.compare_price_minor ? Number(row.compare_price_minor) : undefined,
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
    seo_title: row.seo_title || undefined,
    seo_description: row.seo_description || undefined,
    items,
    computed_stock,
    rating: reviewStats && reviewStats.count > 0 ? Math.round(reviewStats.avg_rating * 10) / 10 : undefined,
    review_count: reviewStats?.count || 0,
  };
}

export async function getKits(options?: { status?: string; search?: string }): Promise<Kit[]> {
  const supabase = createPublicClient();
  let query = supabase.from('kits').select(`
    *,
    kit_items (
      id, kit_id, product_id, variant_id, product_variant_id, quantity, sort_order,
      products ( name, image_url ),
      product_variants ( option_value, inventory_quantity )
    )
  `);

  if (options?.status !== undefined) {
    if (options.status !== '') {
      query = query.eq('status', options.status);
    }
  } else {
    query = query.eq('status', 'ACTIVE');
  }

  if (options?.search) {
    const s = options.search;
    query = query.or(`name.ilike.%${s}%,short_description.ilike.%${s}%,ingredients.ilike.%${s}%`);
  }

  const { data: rows, error } = await query
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: true });

  if (error || !rows) {
    console.error('Failed to fetch kits:', error);
    return [];
  }

  // Fetch approved non-demo reviews for kits
  const { data: revRows } = await supabase
    .from('reviews')
    .select('kit_id, rating')
    .eq('status', 'APPROVED')
    .eq('is_demo', false)
    .not('kit_id', 'is', null);

  const statsMap: Record<string, { count: number; sum: number }> = {};
  for (const r of revRows || []) {
    if (!r.kit_id) continue;
    if (!statsMap[r.kit_id]) {
      statsMap[r.kit_id] = { count: 0, sum: 0 };
    }
    statsMap[r.kit_id].count++;
    statsMap[r.kit_id].sum += Number(r.rating) || 5;
  }

  return rows.map((row) => {
    const st = statsMap[row.id];
    const reviewStats = st && st.count > 0 ? { count: st.count, avg_rating: st.sum / st.count } : undefined;
    return mapRowToKit(row, reviewStats);
  });
}

export async function getKitBySlug(slug: string): Promise<Kit | null> {
  const supabase = createPublicClient();
  const { data: row, error } = await supabase
    .from('kits')
    .select(`
      *,
      kit_items (
        id, kit_id, product_id, variant_id, product_variant_id, quantity, sort_order,
        products ( name, image_url ),
        product_variants ( option_value, inventory_quantity )
      )
    `)
    .eq('slug', slug)
    .single();

  if (error || !row) {
    return null;
  }

  const { data: revRows } = await supabase
    .from('reviews')
    .select('rating')
    .eq('kit_id', row.id)
    .eq('status', 'APPROVED')
    .eq('is_demo', false);

  let reviewStats: { count: number; avg_rating: number } | undefined = undefined;
  if (revRows && revRows.length > 0) {
    const sum = revRows.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    reviewStats = { count: revRows.length, avg_rating: sum / revRows.length };
  }

  return mapRowToKit(row, reviewStats);
}

export async function getKitById(id: string): Promise<Kit | null> {
  const supabase = createPublicClient();
  const { data: row, error } = await supabase
    .from('kits')
    .select(`
      *,
      kit_items (
        id, kit_id, product_id, variant_id, product_variant_id, quantity, sort_order,
        products ( name, image_url ),
        product_variants ( option_value, inventory_quantity )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !row) {
    return null;
  }

  const { data: revRows } = await supabase
    .from('reviews')
    .select('rating')
    .eq('kit_id', row.id)
    .eq('status', 'APPROVED')
    .eq('is_demo', false);

  let reviewStats: { count: number; avg_rating: number } | undefined = undefined;
  if (revRows && revRows.length > 0) {
    const sum = revRows.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    reviewStats = { count: revRows.length, avg_rating: sum / revRows.length };
  }

  return mapRowToKit(row, reviewStats);
}
