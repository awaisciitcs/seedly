import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/services/products';
import { getKits } from '@/lib/services/kits';
import { toCartItem } from '@/lib/catalog';
import { restoreCart } from '@/lib/cart-state';
import { readJson, requireSameOrigin, RequestError } from '@/lib/request-guards';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    requireSameOrigin(request); const body = await readJson(request);
    if (!Array.isArray(body.items) || body.items.length > 50) throw new RequestError('Invalid basket.');
    const items = restoreCart(body.items);
    if (!items.length) return NextResponse.json({ updatedItems: [] });
    const [products, kits] = await Promise.all([getProducts({ includeReviews: false }), getKits({ includeReviews: false })]);
    const updatedItems = items.map(item => {
      const catalogItem = item.kit_id || item.product_type === 'kit' ? kits.find(k => k.id === item.product_id) : products.find(p => p.id === item.product_id);
      if (!catalogItem) return { ...item, previous_id: item.id, max_quantity: 0 };
      if ('variants' in catalogItem && item.variant_id && !catalogItem.variants?.some(v => v.id === item.variant_id && v.status === 'ACTIVE')) return { ...item, previous_id: item.id, max_quantity: 0 };
      const variant = 'variants' in catalogItem ? catalogItem.variants?.find(v => v.id === item.variant_id && v.status === 'ACTIVE') : undefined;
      return { ...toCartItem(catalogItem, item.quantity, variant), previous_id: item.id };
    });
    return NextResponse.json({ updatedItems }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: { message: 'We could not check current prices and availability.' } }, { status: error instanceof RequestError ? error.status : 503 });
  }
}
