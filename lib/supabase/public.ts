import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getSupabaseUrl, getSupabaseKey } from './config';

// Server-side, low-privilege catalog client with no customer cookies
export function createPublicClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  return createSupabaseClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
