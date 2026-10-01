import { NextResponse } from 'next/server';
import { getProducts } from '../../../../lib/services/products';
import { getKits } from '../../../../lib/services/kits';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ updatedItems: [] });
    }

    const [allProducts, allKits] = await Promise.all([
      getProducts({ limit: 100 }),
      getKits(),
    ]);

    const updatedItems = items.map((cartItem: any) => {
      // Check if it's a kit
      const kit = allKits.find((k) => k.id === cartItem.kit_id || k.id === cartItem.product_id || k.slug === cartItem.slug);
      if (kit) {
        return {
          id: cartItem.id,
          price_minor: kit.price_minor, // e.g. 129000 for Luteal Kit!
          max_quantity: kit.computed_stock ?? 20,
          name: kit.name,
        };
      }

      // Check if it's a product
      const product = allProducts.find((p) => p.id === cartItem.product_id || p.slug === cartItem.slug);
      if (product) {
        // Find variant if variant_id was saved
        const variant = product.variants?.find((v) => v.id === cartItem.variant_id && v.status === 'ACTIVE')
          || product.variants?.find((v) => v.status === 'ACTIVE')
          || null;

        const livePriceMinor = variant?.price_minor ?? product.price_minor;
        const liveStock = variant?.inventory_quantity ?? 0;

        return {
          id: cartItem.id,
          price_minor: livePriceMinor,
          max_quantity: liveStock,
          name: product.name,
        };
      }

      return null;
    }).filter(Boolean);

    return NextResponse.json({ updatedItems });
  } catch (error: any) {
    console.error('Cart sync error:', error);
    return NextResponse.json({ error: error.message || 'Cart sync failed' }, { status: 500 });
  }
}
