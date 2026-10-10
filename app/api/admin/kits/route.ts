import { requireSameOrigin } from '@/lib/request-guards';
import { saveAdminCatalog, archiveAdminCatalog } from '@/lib/services/adminCatalog';
import { readAdminJson, AdminInputError, adminId, adminText } from '@/lib/admin-validation';
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
        updated_at: row.updated_at,
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
    if (error instanceof AdminAuthError || error instanceof AdminInputError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    console.error('Error fetching admin kits:', error);
    return NextResponse.json({ error: { message: 'This operation is temporarily unavailable. Please try again.' } }, { status: 503 });
  }
}

export async function POST(request: Request) { return mutate(request,true); }
export async function PATCH(request: Request) { return mutate(request,false); }
async function mutate(request: Request,create: boolean) {
 try { await requireAdmin(); const data=await saveAdminCatalog('kit',await readAdminJson(request),create);return NextResponse.json({success:true,data},{status:create?201:200}); }
 catch(error) { const known=error instanceof AdminAuthError || error instanceof AdminInputError;return NextResponse.json({error:{message:known?error.message:'Catalog save failed. Please try again.'}},{status:known?error.status:503}); }
}
export async function DELETE(request: Request) {
 try { await requireAdmin(); requireSameOrigin(request);const id=adminId(new URL(request.url).searchParams.get('id'));await archiveAdminCatalog('kit',id);return NextResponse.json({success:true,message:'Item archived. Existing order and inventory history is preserved.'}); }
 catch(error) { const known=error instanceof AdminAuthError || error instanceof AdminInputError;return NextResponse.json({error:{message:known?error.message:'Catalog archival failed.'}},{status:known?error.status:503}); }
}
