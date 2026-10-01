export const DEFAULT_SUPABASE_URL = 'https://fyqmbjzpajmnyyqcrmgc.supabase.co';
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_qu7RVH39xF_KTN9RETEECg_vC3rzb3P';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5cW1ianpwYWptbnl5cWNybWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MzM2NzUsImV4cCI6MjEwNjEwOTY3NX0.dTRmzfklrB4W1lc5OG3YrV-Fa4pY5OJ4oQLmNAMQVE4';

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
}

export function getSupabaseKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY
  );
}
