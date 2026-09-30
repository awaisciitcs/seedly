import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { getSiteSettings, updateSiteSettings } from '@/lib/services/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin('OWNER');
    const settings = await getSiteSettings();
    return NextResponse.json({ data: settings });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: error?.message || 'Failed to fetch settings' } }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin('OWNER');
    const body = await request.json();
    await updateSiteSettings(body);
    const updated = await getSiteSettings();
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: error?.message || 'Failed to update settings' } }, { status: 500 });
  }
}
