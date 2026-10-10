export class CmsApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); this.name = 'CmsApiError'; }
}
export async function requestCms<T>(url: string, init: RequestInit = {}, signal?: AbortSignal): Promise<T> {
  try {
    const response = await fetch(url, {
      ...init, credentials: 'same-origin', cache: 'no-store',
      headers: { Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) throw new CmsApiError(json?.error?.message || (response.status === 401 ? 'Your session has expired. Please sign in again.' : 'Content could not be updated. Please try again.'), response.status);
    if (!json || !('data' in json)) throw new CmsApiError('The content service returned an unexpected response. Please try again.', 502);
    return json.data as T;
  } catch (error) {
    if (error instanceof CmsApiError) throw error;
    if (signal?.aborted) throw error;
    throw new CmsApiError('The content service could not be reached. Check your connection and try again.', 503);
  }
}
export function cmsPublicPath(slug: string): string {
  if (slug === 'home' || slug === 'homepage') return '/';
  if (slug === 'routine' || slug === 'routine-finder') return '/find-your-seed';
  if (slug === 'story') return '/about';
  if (slug === 'wishlist') return '/account/wishlist';
  if (slug === 'order') return '/account';
  if (slug === 'product') return '/shop';
  if (['about', 'faq', 'shipping', 'returns', 'privacy', 'terms', 'contact', 'product-disclaimer', 'shop', 'seeds', 'kits', 'teas', 'cart', 'checkout', 'account', 'wishlist'].includes(slug)) return '/' + slug;
  return '/pages/' + encodeURIComponent(slug);
}
