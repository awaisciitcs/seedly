import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireAdmin();
    return NextResponse.json({
      data: {
        user: session.user,
        admin: {
          id: session.admin.id,
          email: session.admin.email,
          name: session.admin.name,
          role: session.admin.role,
        },
      },
    });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: { message: error?.message || 'Internal server error' } },
      { status: 500 }
    );
  }
}
