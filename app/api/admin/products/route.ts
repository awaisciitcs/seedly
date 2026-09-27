import { NextResponse } from 'next/server';
import { getDatabase, toPlain } from '@/lib/db';
import { getProducts } from '@/lib/services/products';
import { handleAvailabilityTransition } from '@/lib/services/stockAlerts';

export async function GET() {
  const products = getProducts({ status: '' });
  return NextResponse.json({ data: products });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      category_id,
      product_type,
      short_description,
      description,
      price_pkr,
      compare_price_pkr,
      weight_grams,
      ingredients,
      usage_instructions,
      storage_instructions,
      image_url,
      badge,
      initial_stock,
    } = body;

    if (!name || !price_pkr) {
      return NextResponse.json({ error: { message: 'Product name and price are required' } }, { status: 400 });
    }

    const db = getDatabase();
    const id = `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const sku = `SED-${slug.slice(0, 8).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const price_minor = Math.round(Number(price_pkr) * 100);
    const compare_price_minor = compare_price_pkr ? Math.round(Number(compare_price_pkr) * 100) : null;
    const catId = category_id || (product_type === 'tea' ? 'cat-teas' : 'cat-seeds');

    db.prepare(`
      INSERT INTO products (
        id, category_id, name, slug, sku, product_type, status,
        short_description, description, price_minor, compare_price_minor,
        currency, weight_grams, ingredients, usage_instructions, storage_instructions,
        image_url, badge, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      catId,
      name,
      slug,
      sku,
      product_type || 'seed',
      'ACTIVE',
      short_description || '',
      description || '',
      price_minor,
      compare_price_minor,
      'PKR',
      Number(weight_grams) || 250,
      ingredients || '',
      usage_instructions || '',
      storage_instructions || '',
      image_url || 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?auto=format&fit=crop&q=80&w=800',
      badge || null,
      0
    );

    // Create default variant
    const variantId = `var-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const stockQty = Number(initial_stock) || 50;
    db.prepare(`
      INSERT INTO product_variants (
        id, product_id, sku, option_name, option_value,
        price_minor, compare_price_minor, weight_grams, inventory_quantity, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      variantId,
      id,
      sku,
      'Pack Size',
      `${weight_grams || 250}g`,
      price_minor,
      compare_price_minor,
      Number(weight_grams) || 250,
      stockQty,
      'ACTIVE'
    );

    return NextResponse.json({ success: true, data: { id, slug, sku } });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, price_minor, short_description, description, image_url, variant_id, inventory_quantity, status } = body;
    const db = getDatabase();

    if (variant_id && inventory_quantity !== undefined) {
      const currentVar = db.prepare('SELECT inventory_quantity FROM product_variants WHERE id = ?').get(variant_id) as any;
      const oldQty = currentVar?.inventory_quantity ?? 0;
      const newQty = Number(inventory_quantity);

      db.prepare(`
        UPDATE product_variants
        SET inventory_quantity = ?
        WHERE id = ?
      `).run(newQty, variant_id);

      // Automatically notify active subscribers when moving from OOS (<=0) to In-Stock (>0)
      if (oldQty <= 0 && newQty > 0) {
        handleAvailabilityTransition({
          variantId: variant_id,
          oldQuantity: oldQty,
          newQuantity: newQty,
        });
      }
    }

    if (id) {
      if (price_minor !== undefined) {
        db.prepare('UPDATE products SET price_minor = ? WHERE id = ?').run(price_minor, id);
      }
      if (name) {
        db.prepare('UPDATE products SET name = ? WHERE id = ?').run(name, id);
      }
      if (short_description !== undefined) {
        db.prepare('UPDATE products SET short_description = ? WHERE id = ?').run(short_description, id);
      }
      if (description !== undefined) {
        db.prepare('UPDATE products SET description = ? WHERE id = ?').run(description, id);
      }
      if (image_url) {
        db.prepare('UPDATE products SET image_url = ? WHERE id = ?').run(image_url, id);
      }
      if (status) {
        db.prepare('UPDATE products SET status = ? WHERE id = ?').run(status, id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: { message: 'Product ID is required' } }, { status: 400 });
    }

    const db = getDatabase();
    // Delete variants
    db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(id);
    // Delete product
    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
