import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { getScopedClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = await getScopedClient();

    const { data: rows, error } = await supabase
      .from('kits')
      .select(`
        *,
        kit_items (
          id, kit_id, product_id, variant_id, product_variant_id, quantity, sort_order,
          products ( id, name, image_url ),
          product_variants ( id, option_value, inventory_quantity )
        )
      `)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch kits: ${error.message}`);
    }

    // Map rows and compute bottleneck stock
    const kits = (rows || []).map((row: any) => {
      const itemsRaw = (row.kit_items || []).sort(
        (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
      );

      let minStock = 999999;
      const items = itemsRaw.map((it: any) => {
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
          variant_id: it.variant_id || it.product_variant_id,
          product_name: it.products?.name || 'Component Botanical',
          product_image: it.products?.image_url,
          variant_name: it.product_variants?.option_value || undefined,
          quantity: it.quantity || 1,
          available_stock: variantStock,
        };
      });

      const computed_stock = items.length > 0 ? (minStock === 999999 ? 0 : Math.max(0, minStock)) : 0;

      return {
        id: row.id,
        category_id: row.category_id || 'cat-kits',
        name: row.name,
        slug: row.slug,
        subtitle: row.subtitle,
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
      };
    });

    return NextResponse.json({ data: kits });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    console.error('Error fetching admin kits:', error);
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const {
      name,
      slug: customSlug,
      package_size,
      price_pkr,
      compare_price_pkr,
      short_description,
      description,
      ingredients,
      usage_instructions,
      storage_instructions,
      image_url,
      badge,
      compliance_status,
      status,
      items,
    } = body;

    if (!name || !price_pkr) {
      return NextResponse.json({ error: { message: 'Kit name and price are required' } }, { status: 400 });
    }

    const supabase = await getScopedClient();
    const id = `kit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const baseSlug = customSlug || name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `kit-${Date.now()}`;

    let slug = baseSlug;
    const { data: existingKit } = await supabase.from('kits').select('id').eq('slug', slug).maybeSingle();
    if (existingKit) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const price_minor = Math.round(Number(price_pkr) * 100);
    const compare_price_minor = compare_price_pkr ? Math.round(Number(compare_price_pkr) * 100) : null;

    const newKit = {
      id,
      category_id: 'cat-kits',
      name,
      slug,
      package_size: package_size || 'Routine Kit',
      short_description: short_description || '',
      description: description || '',
      ingredients: ingredients || '',
      usage_instructions: usage_instructions || '',
      storage_instructions: storage_instructions || '',
      price_minor,
      compare_price_minor,
      currency: 'PKR',
      image_url: image_url || '/images/products/complete-kit.jpg',
      badge: badge || null,
      status: status || 'ACTIVE',
      compliance_status: compliance_status || 'APPROVED',
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: kitErr } = await supabase.from('kits').insert([newKit]);
    if (kitErr) {
      throw new Error(`Failed to create kit: ${kitErr.message}`);
    }

    // Insert kit constituent items if provided
    if (Array.isArray(items) && items.length > 0) {
      const kitItemRecords = await Promise.all(
        items.map(async (it: any, index: number) => {
          let variantId = it.variant_id || it.product_variant_id || null;
          if (!variantId && it.product_id) {
            const { data: defaultVar } = await supabase
              .from('product_variants')
              .select('id')
              .eq('product_id', it.product_id)
              .limit(1)
              .maybeSingle();
            variantId = defaultVar?.id || null;
          }

          return {
            id: `ki-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
            kit_id: id,
            product_id: it.product_id,
            variant_id: variantId,
            product_variant_id: variantId,
            quantity: Number(it.quantity) || 1,
            sort_order: index + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        })
      );

      const { error: itemsErr } = await supabase.from('kit_items').insert(kitItemRecords);
      if (itemsErr) {
        console.error('Error inserting kit_items:', itemsErr);
      }
    }

    return NextResponse.json({ success: true, data: { id, slug } });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    console.error('Error creating kit:', error);
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
      slug,
      package_size,
      price_minor,
      price_pkr,
      compare_price_minor,
      compare_price_pkr,
      short_description,
      description,
      ingredients,
      usage_instructions,
      storage_instructions,
      image_url,
      badge,
      status,
      compliance_status,
      items,
    } = body;

    if (!id) {
      return NextResponse.json({ error: { message: 'Kit ID is required' } }, { status: 400 });
    }

    const supabase = await getScopedClient();
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (package_size !== undefined) updates.package_size = package_size;
    if (short_description !== undefined) updates.short_description = short_description;
    if (description !== undefined) updates.description = description;
    if (ingredients !== undefined) updates.ingredients = ingredients;
    if (usage_instructions !== undefined) updates.usage_instructions = usage_instructions;
    if (storage_instructions !== undefined) updates.storage_instructions = storage_instructions;
    if (image_url !== undefined) updates.image_url = image_url;
    if (badge !== undefined) updates.badge = badge || null;
    if (status !== undefined) updates.status = status;
    if (compliance_status !== undefined) updates.compliance_status = compliance_status;

    if (price_minor !== undefined) {
      updates.price_minor = price_minor;
    } else if (price_pkr !== undefined) {
      updates.price_minor = Math.round(Number(price_pkr) * 100);
    }

    if (compare_price_minor !== undefined) {
      updates.compare_price_minor = compare_price_minor;
    } else if (compare_price_pkr !== undefined) {
      updates.compare_price_minor = compare_price_pkr ? Math.round(Number(compare_price_pkr) * 100) : null;
    }

    const { error: kitUpdateErr } = await supabase
      .from('kits')
      .update(updates as any)
      .eq('id', id);

    if (kitUpdateErr) {
      throw new Error(`Failed to update kit: ${kitUpdateErr.message}`);
    }

    // Synchronize kit_items if items array is provided
    if (Array.isArray(items)) {
      // Delete existing kit_items for this kit
      await supabase.from('kit_items').delete().eq('kit_id', id);

      if (items.length > 0) {
        const kitItemRecords = await Promise.all(
          items.map(async (it: any, index: number) => {
            let variantId = it.variant_id || it.product_variant_id || null;
            if (!variantId && it.product_id) {
              const { data: defaultVar } = await supabase
                .from('product_variants')
                .select('id')
                .eq('product_id', it.product_id)
                .limit(1)
                .maybeSingle();
              variantId = defaultVar?.id || null;
            }

            return {
              id: `ki-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
              kit_id: id,
              product_id: it.product_id,
              variant_id: variantId,
              product_variant_id: variantId,
              quantity: Number(it.quantity) || 1,
              sort_order: index + 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          })
        );

        const { error: itemsErr } = await supabase.from('kit_items').insert(kitItemRecords);
        if (itemsErr) {
          console.error('Error inserting updated kit_items:', itemsErr);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    console.error('Error updating kit:', error);
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: { message: 'Kit ID is required' } }, { status: 400 });
    }

    const supabase = await getScopedClient();

    // 1. Check if this kit has historical customer orders
    const { data: orderRefs } = await supabase
      .from('order_items')
      .select('id')
      .eq('kit_id', id)
      .limit(1);

    if (orderRefs && orderRefs.length > 0) {
      // Archive instead of hard delete to preserve invoices and financial records
      await supabase
        .from('kits')
        .update({ status: 'ARCHIVED', updated_at: new Date().toISOString() })
        .eq('id', id);

      return NextResponse.json({
        success: true,
        message: 'Curated Kit has customer order history. It has been safely ARCHIVED instead of hard-deleted to preserve order invoices.',
      });
    }

    // 2. Delete kit items first, then kit
    await supabase.from('kit_items').delete().eq('kit_id', id);
    const { error } = await supabase.from('kits').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete kit: ${error.message}`);
    }

    return NextResponse.json({ success: true, message: 'Kit permanently removed from catalog.' });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
