export function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error('The Supabase project URL is not configured.');
  let parsed: URL;
  try { parsed = new URL(value); } catch { throw new Error('The Supabase project URL is invalid.'); }
  if (parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash ||
      parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname))) {
    throw new Error('Use an HTTPS Supabase project origin or a local development project.');
  }
  return parsed.origin;
}

export function getSupabaseKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error('The public Supabase API key is not configured.');
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return key;
  let role: unknown;
  try {
    const payload = key.split('.')[1]?.replaceAll('-', '+').replaceAll('_', '/');
    role = JSON.parse(atob(payload || '')).role;
  } catch { /* Rejected below. */ }
  if (role !== 'anon') throw new Error('Client configuration requires a publishable or anonymous key, never a private key.');
  return key;
}
