import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';
import { getSupabaseUrl, getSupabaseKey } from './config';

export function createClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  return createBrowserClient<Database>(url, key);
}
