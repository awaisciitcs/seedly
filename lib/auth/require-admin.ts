import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '../supabase/server';

export interface AdminSession {
  user: {
    id: string;
    email?: string;
  };
  admin: {
    id: string;
    auth_user_id: string | null;
    email: string;
    name: string;
    role: string;
    is_active: boolean | null;
  };
}

export class AdminAuthError extends Error {
  constructor(message: string, public status: number = 401) {
    super(message);
    this.name = 'AdminAuthError';
  }
}

/**
 * Validates the caller's server session and verifies their record in public.admin_users.
 * Never trusts unverified getSession() data.
 */
export async function requireAdmin(requiredRole?: 'OWNER' | 'STAFF'): Promise<AdminSession> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new AdminAuthError('Authentication required. Please log in.', 401);
  }

  const { data: adminRecord, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('auth_user_id', user.id)
    .eq('is_active', true)
    .single();

  // Admin identities must be provisioned explicitly. Matching an email address is
  // not a safe substitute for a linked, verified Auth identity.
  if (adminError || !adminRecord || !['OWNER', 'STAFF'].includes(adminRecord.role)) {
    throw new AdminAuthError('Access denied: not an authorized active administrator.', 403);
  }

  if (requiredRole && requiredRole === 'OWNER' && adminRecord.role !== 'OWNER') {
    throw new AdminAuthError('Owner privileges required for this action.', 403);
  }

  return {
    user: { id: user.id, email: user.email },
    admin: adminRecord,
  };
}

/**
 * Server-side guard for Server Components and Layouts.
 * Throws Next.js redirect to /admin/login if the user is unauthenticated or unauthorized.
 */
export async function requireAdminOrRedirect(
  requiredRole?: 'OWNER' | 'STAFF',
  redirectToPath?: string
): Promise<AdminSession> {
  let session: AdminSession;
  try {
    session = await requireAdmin(requiredRole);
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') {
      throw err;
    }
    const target = redirectToPath
      ? `/admin/login?redirectTo=${encodeURIComponent(redirectToPath)}`
      : '/admin/login';
    redirect(target);
  }
  return session;
}

