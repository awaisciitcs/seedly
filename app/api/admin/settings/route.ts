import { NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings } from '@/lib/services/settings';

export async function GET() {
  const settings = getSiteSettings();
  return NextResponse.json({ data: settings });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    updateSiteSettings(body);
    const updated = getSiteSettings();
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
