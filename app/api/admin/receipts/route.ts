import { readAdminJson, AdminInputError, adminId, adminText } from '@/lib/admin-validation';
import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { getScopedClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Require verified admin session
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const receiptPath = searchParams.get('path');

    if (!receiptPath || typeof receiptPath !== 'string') {
      return NextResponse.json(
        { error: { message: 'Missing receipt path parameter.' } },
        { status: 400 }
      );
    }

    // Sanitize path - prevent path traversal
    const cleanPath = receiptPath.replace(/^\/+/, '');
    if (cleanPath.includes('..') || cleanPath.includes('\\')) {
      return NextResponse.json(
        { error: { message: 'Invalid receipt path.' } },
        { status: 400 }
      );
    }

    const supabase = await getScopedClient();
    const { data, error } = await supabase.storage
      .from('payment-receipts')
      .createSignedUrl(cleanPath, 300); // 5-minute signed URL

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: { message: 'Receipt could not be accessed. Please check its recorded path.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (error: any) {
    if (error instanceof AdminAuthError || error instanceof AdminInputError) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: { message: 'This operation is temporarily unavailable. Please try again.' } }, { status: 503 }
    );
  }
}
