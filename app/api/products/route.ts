import { NextResponse } from 'next/server';
import { getProducts } from '../../../lib/services/products';
import { getKits } from '../../../lib/services/kits';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    const typeParam = searchParams.get('type');

    const products = getProducts();
    const kits = getKits();

    let combined: any[] = [...products, ...kits];

    if (idsParam) {
      const ids = idsParam.split(',').map((id) => id.trim()).filter(Boolean);
      combined = combined.filter((item) => ids.includes(item.id));
    }

    if (typeParam) {
      if (typeParam === 'kit') {
        combined = combined.filter((item) => 'package_size' in item);
      } else {
        combined = combined.filter((item) => (item as any).product_type === typeParam);
      }
    }

    return NextResponse.json({
      success: true,
      data: combined,
      count: combined.length,
    });
  } catch (error: any) {
    console.error('API /api/products error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
