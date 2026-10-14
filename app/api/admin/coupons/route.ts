import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { readAdminJson } from '@/lib/admin-validation';
import { RequestError } from '@/lib/request-guards';
import { listAdminCoupons, saveCoupon } from '@/lib/services/coupons';
export const dynamic = 'force-dynamic';
const fail = (error: unknown) => NextResponse.json({ error: { message: error instanceof RequestError || error instanceof AdminAuthError ? error.message : 'Coupons are temporarily unavailable.' } }, { status: error instanceof RequestError || error instanceof AdminAuthError ? error.status : 503, headers: { 'Cache-Control': 'no-store' } });
export async function GET() { try { await requireAdmin(); return NextResponse.json({ data: await listAdminCoupons() }, { headers: { 'Cache-Control': 'no-store' } }); } catch (error) { return fail(error); } }
async function save(request: Request, create: boolean) { try { await requireAdmin('OWNER'); return NextResponse.json({ data: await saveCoupon(await readAdminJson(request), create) }, { status: create ? 201 : 200 }); } catch (error) { return fail(error); } }
export async function POST(request: Request) { return save(request, true); }
export async function PATCH(request: Request) { return save(request, false); }
