import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getSupabaseUrl, getSupabaseKey } from './config';
import { createClient as createServerClient } from './server';

// Elevated client for approved server operations only.
// Never expose this client or its keys to browser code.
export function createAdminClient() {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SECRET_KEY || getSupabaseKey();

  return createSupabaseClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Scoped client: uses service role if SUPABASE_SECRET_KEY is present,
// or falls back to cookie-authenticated server client in request context.
export async function getScopedClient() {
  if (process.env.SUPABASE_SECRET_KEY) {
    return createAdminClient();
  }
  try {
    return await createServerClient();
  } catch {
    return createAdminClient();
  }
}
