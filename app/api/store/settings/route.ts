import { NextResponse } from 'next/server';
import { getCustomerStoreSettings } from '@/lib/services/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ data: await getCustomerStoreSettings() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: { message: 'We could not load delivery and payment details. Please try again.' } }, { status: 503 });
  }
}
