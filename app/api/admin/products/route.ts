import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { getScopedClient } from '@/lib/supabase/admin';
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
      flavor_profile,
      caffeine_level,
      steep_time,
      water_temp,
      image_url,
      badge,
      initial_stock,
    } = body;

    if (!name || !price_pkr) {
      return NextResponse.json({ error: { message: 'Product name and price are required' } }, { status: 400 });
    }

    const supabase = await getScopedClient();
    const id = `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `prod-${Date.now()}`;

    let slug = baseSlug;
    const { data: existingProd } = await supabase.from('products').select('id').eq('slug', slug).maybeSingle();
    if (existingProd) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }
    const sku = `SED-${slug.slice(0, 8).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const price_minor = Math.round(Number(price_pkr) * 100);
    const compare_price_minor = compare_price_pkr ? Math.round(Number(compare_price_pkr) * 100) : null;
    
    // Resolve category and product type
    let finalCatId = category_id;
    let finalType = product_type;
    if (!finalCatId) {
      finalCatId = finalType === 'tea' ? 'cat-teas' : 'cat-seeds';
    }
    if (!finalType) {
      finalType = finalCatId === 'cat-teas' ? 'tea' : 'seed';
    }

    const newProduct = {
      id,
      category_id: finalCatId,
      name,
      slug,
      sku,
      product_type: finalType,
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
      flavor_profile: flavor_profile || null,
      caffeine_level: caffeine_level || null,
      steep_time: steep_time || null,
      water_temp: water_temp || null,
      image_url:
        image_url ||
        (finalType === 'tea'
          ? '/images/products/chamomile-tea.svg'
          : '/images/products/pumpkin-seeds.svg'),
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
    const {
      id,
      name,
      price_minor,
      price_pkr,
      compare_price_minor,
      compare_price_pkr,
      short_description,
      description,
      image_url,
      category_id,
      product_type,
      badge,
      weight_grams,
      ingredients,
      usage_instructions,
      storage_instructions,
      flavor_profile,
      caffeine_level,
      steep_time,
      water_temp,
      variant_id,
      inventory_quantity,
      status,
    } = body;
    const supabase = await getScopedClient();

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

      const computedPriceMinor =
        price_minor !== undefined
          ? price_minor
          : price_pkr !== undefined
          ? Math.round(Number(price_pkr) * 100)
          : undefined;

      const computedComparePriceMinor =
        compare_price_minor !== undefined
          ? compare_price_minor
          : compare_price_pkr !== undefined
          ? compare_price_pkr
            ? Math.round(Number(compare_price_pkr) * 100)
            : null
          : undefined;

      if (computedPriceMinor !== undefined) updates.price_minor = computedPriceMinor;
      if (computedComparePriceMinor !== undefined) updates.compare_price_minor = computedComparePriceMinor;
      if (name !== undefined) updates.name = name;
      if (short_description !== undefined) updates.short_description = short_description;
      if (description !== undefined) updates.description = description;
      if (image_url !== undefined) updates.image_url = image_url;
      if (category_id !== undefined) updates.category_id = category_id;
      if (product_type !== undefined) updates.product_type = product_type;
      if (badge !== undefined) updates.badge = badge || null;
      if (weight_grams !== undefined) updates.weight_grams = Number(weight_grams);
      if (ingredients !== undefined) updates.ingredients = ingredients;
      if (usage_instructions !== undefined) updates.usage_instructions = usage_instructions;
      if (storage_instructions !== undefined) updates.storage_instructions = storage_instructions;
      if (flavor_profile !== undefined) updates.flavor_profile = flavor_profile || null;
      if (caffeine_level !== undefined) updates.caffeine_level = caffeine_level || null;
      if (steep_time !== undefined) updates.steep_time = steep_time || null;
      if (water_temp !== undefined) updates.water_temp = water_temp || null;
      if (status !== undefined) updates.status = status;

      // Sync category_id and product_type if only one is updated
      if (category_id && !product_type) {
        updates.product_type = category_id === 'cat-teas' ? 'tea' : 'seed';
      } else if (product_type && !category_id) {
        updates.category_id = product_type === 'tea' ? 'cat-teas' : 'cat-seeds';
      }

      const { error: prodUpdateErr } = await supabase
        .from('products')
        .update(updates as any)
        .eq('id', id);

      if (prodUpdateErr) {
        throw new Error(`Failed to update product: ${prodUpdateErr.message}`);
      }

      // Keep default variant aligned if price or weight updated
      if (computedPriceMinor !== undefined || weight_grams !== undefined) {
        const variantUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
        if (computedPriceMinor !== undefined) variantUpdates.price_minor = computedPriceMinor;
        if (computedComparePriceMinor !== undefined) variantUpdates.compare_price_minor = computedComparePriceMinor;
        if (weight_grams !== undefined) {
          variantUpdates.weight_grams = Number(weight_grams);
          variantUpdates.option_value = `${weight_grams}g`;
        }

        await supabase
          .from('product_variants')
          .update(variantUpdates as any)
          .eq('product_id', id);
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

    const supabase = await getScopedClient();

    // 1. Check if this product is part of any Curated Kits
    const { data: kitRefs } = await supabase
      .from('kit_items')
      .select('kit_id, kits(name)')
      .eq('product_id', id);

    if (kitRefs && kitRefs.length > 0) {
      const kitNames = kitRefs
        .map((k: any) => k.kits?.name || k.kit_id)
        .filter(Boolean)
        .join(', ');
      return NextResponse.json(
        {
          error: {
            message: `Cannot delete product: it is a constituent seed in curated kit(s): ${kitNames}. Please remove it from the kit formulation or set its status to ARCHIVED.`,
          },
        },
        { status: 400 }
      );
    }

    // 2. Check if this product has historical customer orders
    const { data: orderRefs } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', id)
      .limit(1);

    if (orderRefs && orderRefs.length > 0) {
      // Archive instead of hard delete to preserve invoices and financial records
      await supabase
        .from('products')
        .update({ status: 'ARCHIVED', updated_at: new Date().toISOString() })
        .eq('id', id);

      return NextResponse.json({
        success: true,
        message: 'Product has customer order history. It has been safely ARCHIVED instead of hard-deleted to preserve order invoices.',
      });
    }

    // 3. Delete variants first, then product
    await supabase.from('product_variants').delete().eq('product_id', id);
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }

    return NextResponse.json({ success: true, message: 'Product permanently removed from catalog.' });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
