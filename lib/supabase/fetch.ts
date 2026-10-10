/**
 * Bound database/Auth requests and larger Storage transfers. The caller's abort
 * signal remains effective; retries are intentionally controlled by the app.
 * Kept free of Node-only imports so the same helper can run in Edge middleware.
 */
export const DATABASE_TIMEOUT_MS = 15_000;
export const STORAGE_TIMEOUT_MS = 30_000;
export const boundedSupabaseFetch: typeof fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const timeout = new URL(url).pathname.startsWith('/storage/v1/') ? STORAGE_TIMEOUT_MS : DATABASE_TIMEOUT_MS;
  const upstream = init?.signal || (input instanceof Request ? input.signal : undefined);
  const deadline = AbortSignal.timeout(timeout);
  return fetch(input, { ...init, signal: upstream ? AbortSignal.any([upstream, deadline]) : deadline });
};
