import { createPublicClient } from '../supabase/public';
import { Product, ProductVariant } from '../types';

function sortVariants(variants: any[]): ProductVariant[] {
  return [...variants].sort((a, b) => {
    const aWeight = a.weight_grams || 0;
    const bWeight = b.weight_grams || 0;
    if (aWeight !== bWeight) return aWeight - bWeight;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
}

function mapRowToProduct(row: any, reviewStats?: { count: number; avg_rating: number }): Product {
  const rawVariants = (row.product_variants || []).filter(
    (v: any) => v.status === 'ACTIVE' || row.status !== 'ACTIVE'
  );
  const variants = sortVariants(rawVariants);

  let nutrition = undefined;
  if (row.nutrition_information) {
    if (typeof row.nutrition_information === 'object') {
      nutrition = row.nutrition_information;
    } else {
      try {
        nutrition = JSON.parse(row.nutrition_information);
      } catch {
        nutrition = undefined;
      }
    }
  }

  let gallery = undefined;
  if (row.gallery_images) {
    if (Array.isArray(row.gallery_images)) {
      gallery = row.gallery_images;
    } else {
      try {
        gallery = JSON.parse(row.gallery_images);
      } catch {
        gallery = undefined;
      }
    }
  }

  return {
    id: row.id,
    category_id: row.category_id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    product_type: row.product_type || 'seed',
    status: row.status,
    short_description: row.short_description || '',
    description: row.description || '',
    price_minor: Number(row.price_minor),
    compare_price_minor: row.compare_price_minor ? Number(row.compare_price_minor) : undefined,
    currency: row.currency || 'PKR',
    weight_grams: row.weight_grams ? Number(row.weight_grams) : undefined,
    ingredients: row.ingredients || '',
    usage_instructions: row.usage_instructions || '',
    storage_instructions: row.storage_instructions || '',
    flavor_profile: row.flavor_profile || undefined,
    caffeine_level: row.caffeine_level || undefined,
    steep_time: row.steep_time || undefined,
    water_temp: row.water_temp || undefined,
    nutrition_information: nutrition,
    seo_title: row.seo_title || undefined,
    seo_description: row.seo_description || undefined,
    image_url: row.image_url,
    gallery_images: gallery,
    badge: row.badge || undefined,
    is_featured: Boolean(row.is_featured),
    variants,
    rating: reviewStats && reviewStats.count > 0 ? Math.round(reviewStats.avg_rating * 10) / 10 : undefined,
    review_count: reviewStats?.count || 0,
  };
}

export async function getProducts(options?: {
  categorySlug?: string;
  productType?: string;
  status?: string;
  search?: string;
  sort?: string; // 'price-asc' | 'price-desc' | 'newest' | 'rating'
  limit?: number;
}): Promise<Product[]> {
  const supabase = createPublicClient();

  let query = supabase.from('products').select(`
    *,
    categories!inner ( slug, name ),
    product_variants ( * )
  `);

  if (options?.status !== undefined) {
    if (options.status !== '') {
      query = query.eq('status', options.status);
    }
  } else {
    query = query.eq('status', 'ACTIVE');
  }

  if (options?.categorySlug && options.categorySlug !== 'all') {
    query = query.eq('categories.slug', options.categorySlug);
  }

  if (options?.productType) {
    query = query.eq('product_type', options.productType);
  }

  if (options?.search) {
    const s = options.search;
    query = query.or(`name.ilike.%${s}%,short_description.ilike.%${s}%,ingredients.ilike.%${s}%`);
  }

  // Sorting
  if (options?.sort === 'price-asc') {
    query = query.order('price_minor', { ascending: true });
  } else if (options?.sort === 'price-desc') {
    query = query.order('price_minor', { ascending: false });
  } else if (options?.sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data: rows, error } = await query;

  if (error || !rows) {
    console.error('Failed to fetch products from Supabase:', error);
    return [];
  }

  // Fetch approved non-demo review statistics
  const { data: revRows } = await supabase
    .from('reviews')
    .select('product_id, rating')
    .eq('status', 'APPROVED')
    .eq('is_demo', false)
    .not('product_id', 'is', null);

  const statsMap: Record<string, { count: number; sum: number }> = {};
  for (const r of revRows || []) {
    if (!r.product_id) continue;
    if (!statsMap[r.product_id]) {
      statsMap[r.product_id] = { count: 0, sum: 0 };
    }
    statsMap[r.product_id].count++;
    statsMap[r.product_id].sum += Number(r.rating) || 5;
  }

  return rows.map((row) => {
    const st = statsMap[row.id];
    const reviewStats = st && st.count > 0 ? { count: st.count, avg_rating: st.sum / st.count } : undefined;
    return mapRowToProduct(row, reviewStats);
  });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createPublicClient();
  const { data: row, error } = await supabase
    .from('products')
    .select(`
      *,
      categories ( slug, name ),
      product_variants ( * )
    `)
    .eq('slug', slug)
    .single();

  if (error || !row) {
    return null;
  }

  const { data: revRows } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', row.id)
    .eq('status', 'APPROVED')
    .eq('is_demo', false);

  let reviewStats: { count: number; avg_rating: number } | undefined = undefined;
  if (revRows && revRows.length > 0) {
    const sum = revRows.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    reviewStats = { count: revRows.length, avg_rating: sum / revRows.length };
  }

  return mapRowToProduct(row, reviewStats);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createPublicClient();
  const { data: row, error } = await supabase
    .from('products')
    .select(`
      *,
      categories ( slug, name ),
      product_variants ( * )
    `)
    .eq('id', id)
    .single();

  if (error || !row) {
    return null;
  }

  const { data: revRows } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', row.id)
    .eq('status', 'APPROVED')
    .eq('is_demo', false);

  let reviewStats: { count: number; avg_rating: number } | undefined = undefined;
  if (revRows && revRows.length > 0) {
    const sum = revRows.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    reviewStats = { count: revRows.length, avg_rating: sum / revRows.length };
  }

  return mapRowToProduct(row, reviewStats);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ limit: 8 });
}
