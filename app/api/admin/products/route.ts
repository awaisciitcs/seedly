import { requireSameOrigin } from '@/lib/request-guards';
import { saveAdminCatalog, archiveAdminCatalog } from '@/lib/services/adminCatalog';
import { readAdminJson, AdminInputError, adminId, adminText } from '@/lib/admin-validation';
import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { getScopedClient } from '@/lib/supabase/admin';
import { getProducts } from '@/lib/services/products';
import { handleAvailabilityTransition } from '@/lib/services/stockAlerts';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const search = new URL(request.url).searchParams.get('search')?.slice(0,100);
    const products = await getProducts({ status: '', search, includeReviews: false });
    return NextResponse.json({ data: products });
  } catch (error: any) {
    if (error instanceof AdminAuthError || error instanceof AdminInputError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: 'This operation is temporarily unavailable. Please try again.' } }, { status: 503 });
  }
}

export async function POST(request: Request) { return mutate(request,true); }
export async function PATCH(request: Request) { return mutate(request,false); }
async function mutate(request: Request,create: boolean) {
 try { await requireAdmin(); const data=await saveAdminCatalog('product',await readAdminJson(request),create);return NextResponse.json({success:true,data},{status:create?201:200}); }
 catch(error) { const known=error instanceof AdminAuthError || error instanceof AdminInputError;return NextResponse.json({error:{message:known?error.message:'Catalog save failed. Please try again.'}},{status:known?error.status:503}); }
}
export async function DELETE(request: Request) {
 try { await requireAdmin(); requireSameOrigin(request);const id=adminId(new URL(request.url).searchParams.get('id'));await archiveAdminCatalog('product',id);return NextResponse.json({success:true,message:'Item archived. Existing order and inventory history is preserved.'}); }
 catch(error) { const known=error instanceof AdminAuthError || error instanceof AdminInputError;return NextResponse.json({error:{message:known?error.message:'Catalog archival failed.'}},{status:known?error.status:503}); }
}
