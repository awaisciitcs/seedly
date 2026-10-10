import { readAdminJson, AdminInputError, adminId, adminText } from '@/lib/admin-validation';
import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { getSiteSettings, updateSiteSettings } from '@/lib/services/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin('OWNER');
    const settings = await getSiteSettings({ requireConfigured: true });
    return NextResponse.json({ data: settings });
  } catch (error: any) {
    if (error instanceof AdminAuthError || error instanceof AdminInputError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: 'This operation is temporarily unavailable. Please try again.' } }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin('OWNER');
    const body = await readAdminJson(request);
    await updateSiteSettings(body);
    const updated = await getSiteSettings({ requireConfigured: true });
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    if (error instanceof AdminAuthError || error instanceof AdminInputError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: 'This operation is temporarily unavailable. Please try again.' } }, { status: 503 });
  }
}
