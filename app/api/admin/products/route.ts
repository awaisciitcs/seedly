import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { getProducts } from '@/lib/services/products';
import { handleAvailabilityTransition } from '@/lib/services/stockAlerts';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    const products = await getProducts({ status: '' });
    return NextResponse.json({ data: products });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
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

    const supabase = createAdminClient();
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

    const newProduct = {
      id,
      category_id: catId,
      name,
      slug,
      sku,
      product_type: product_type || 'seed',
      status: 'ACTIVE',
      short_description: short_description || '',
      description: description || '',
      price_minor,
      compare_price_minor,
      currency: 'PKR',
      weight_grams: Number(weight_grams) || 250,
      ingredients: ingredients || '',
      usage_instructions: usage_instructions || '',
      storage_instructions: storage_instructions || '',
      image_url: image_url || '/images/products/pumpkin-seeds.svg',
      badge: badge || null,
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: prodErr } = await supabase.from('products').insert([newProduct]);
    if (prodErr) {
      throw new Error(`Failed to create product: ${prodErr.message}`);
    }

    // Create default variant
    const variantId = `var-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const stockQty = Number(initial_stock) || 50;

    const newVariant = {
      id: variantId,
      product_id: id,
      sku,
      option_name: 'Pack Size',
      option_value: `${weight_grams || 250}g`,
      price_minor,
      compare_price_minor,
      weight_grams: Number(weight_grams) || 250,
      inventory_quantity: stockQty,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: varErr } = await supabase.from('product_variants').insert([newVariant]);
    if (varErr) {
      throw new Error(`Failed to create default variant: ${varErr.message}`);
    }

    return NextResponse.json({ success: true, data: { id, slug, sku } });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    console.error('Error creating product:', error);
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { id, name, price_minor, short_description, description, image_url, variant_id, inventory_quantity, status } = body;
    const supabase = createAdminClient();

    if (variant_id && inventory_quantity !== undefined) {
      const { data: currentVar } = await supabase
        .from('product_variants')
        .select('inventory_quantity')
        .eq('id', variant_id)
        .single();

      const oldQty = currentVar?.inventory_quantity ?? 0;
      const newQty = Number(inventory_quantity);

      const { error: updateVarErr } = await supabase
        .from('product_variants')
        .update({
          inventory_quantity: newQty,
          updated_at: new Date().toISOString(),
        })
        .eq('id', variant_id);

      if (updateVarErr) {
        throw new Error(`Failed to update variant inventory: ${updateVarErr.message}`);
      }

      // Automatically notify active subscribers when moving from OOS (<=0) to In-Stock (>0)
      if (oldQty <= 0 && newQty > 0) {
        await handleAvailabilityTransition({
          variantId: variant_id,
          oldQuantity: oldQty,
          newQuantity: newQty,
        });
      }
    }

    if (id) {
      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (price_minor !== undefined) updates.price_minor = price_minor;
      if (name) updates.name = name;
      if (short_description !== undefined) updates.short_description = short_description;
      if (description !== undefined) updates.description = description;
      if (image_url) updates.image_url = image_url;
      if (status) updates.status = status;

      const { error: prodUpdateErr } = await supabase
        .from('products')
        .update(updates as any)
        .eq('id', id);

      if (prodUpdateErr) {
        throw new Error(`Failed to update product: ${prodUpdateErr.message}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: { message: 'Product ID is required' } }, { status: 400 });
    }

    const supabase = createAdminClient();
    // Delete variants first
    await supabase.from('product_variants').delete().eq('product_id', id);
    // Delete product
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
