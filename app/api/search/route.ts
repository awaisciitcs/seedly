import { NextResponse } from 'next/server';
import { getProducts } from '../../../lib/services/products';
import { getKits } from '../../../lib/services/kits';
import { toSearchResult } from '../../../lib/product-search';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim().slice(0, 100) || '';

  try {
    const options = { search: query || undefined };
    const [products, kits] = await Promise.all([
      getProducts(options),
      getKits(options),
    ]);
    const matches = [...products, ...kits];

    if (query) {
      const term = query.toLowerCase();
      matches.sort((a, b) => Number(b.name.toLowerCase().includes(term)) - Number(a.name.toLowerCase().includes(term)));
    } else {
      matches.sort((a, b) => Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured)));
    }

    return NextResponse.json({
      items: matches.slice(0, 6).map(toSearchResult),
      total: matches.length,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Product search failed:', error);
    return NextResponse.json({ error: 'Search is temporarily unavailable.' }, { status: 500 });
  }
}