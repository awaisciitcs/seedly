import { boundedSupabaseFetch } from './fetch';
import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getSupabaseUrl } from './config';
import { createClient as createServerClient } from './server';

// Elevated client for approved server operations only.
// Never expose this client or its keys to browser code.
export function createAdminClient() {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error('A private server key is required for privileged database operations.');
  if (!key.startsWith('sb_secret_')) {
    let role: unknown;
    try { role = JSON.parse(Buffer.from(key.split('.')[1] || '', 'base64url').toString()).role; } catch { /* Rejected below. */ }
    if (role !== 'service_role') throw new Error('SUPABASE_SECRET_KEY must be a private service-role key.');
  }

  return createSupabaseClient<Database>(url, key, {
    db: { retry: false },
    global: { fetch: boundedSupabaseFetch },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Administrator operations always carry the authenticated cookie session.
// RLS rechecks active membership and owner privileges inside the database.
export async function getScopedClient() { return createServerClient(); }
