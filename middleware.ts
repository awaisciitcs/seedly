import { boundedSupabaseFetch } from './lib/supabase/fetch';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseUrl, getSupabaseKey } from './lib/supabase/config';
import { requireSameOrigin, RequestError } from './lib/request-guards';

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');
  return res;
}

function handleUnauthorized(request: NextRequest, pathname: string): NextResponse {
  if (pathname.startsWith('/api/admin')) {
    return applySecurityHeaders(
      NextResponse.json(
        { error: { message: 'Authentication required. Please log in as an administrator.' } },
        { status: 401 }
      )
    );
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = '/admin/login';
  if (pathname !== '/admin') {
    redirectUrl.searchParams.set('redirectTo', pathname);
  }
  return applySecurityHeaders(NextResponse.redirect(redirectUrl));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/api/admin') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    try { requireSameOrigin(request); }
    catch (error) {
      return applySecurityHeaders(NextResponse.json(
        { error: { message: error instanceof RequestError ? error.message : 'Invalid request origin.' } },
        { status: 403 }
      ));
    }
  }

  try {
    let supabaseResponse = NextResponse.next({
      request,
    });

    const url = getSupabaseUrl();
    const key = getSupabaseKey();

    const supabase = createServerClient(url, key, {
      db: { retry: false },
      global: { fetch: boundedSupabaseFetch },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // IMPORTANT: Do not use getSession() for server security checks; always use getUser().
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    const lowerPath = pathname.toLowerCase();

    // Protect admin API routes with 401 JSON
    if (lowerPath.startsWith('/api/admin')) {
      if (userError || !user) {
        return handleUnauthorized(request, pathname);
      }
      return applySecurityHeaders(supabaseResponse);
    }

    // Protect admin page routes
    if (lowerPath === '/admin' || lowerPath.startsWith('/admin/')) {
      if (lowerPath === '/admin/login') {
        // Keep login reachable for expired, disabled and non-admin accounts.
        // The dashboard layout and every API check the active admin membership.
        return applySecurityHeaders(supabaseResponse);
      }

      // Any other /admin route requires a verified user
      if (userError || !user) {
        return handleUnauthorized(request, pathname);
      }
    }

    return applySecurityHeaders(supabaseResponse);
  } catch (err) {
    console.error('Administrator authentication middleware is temporarily unavailable.');
    return handleUnauthorized(request, pathname);
  }
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/admin',
    '/api/admin/:path*',
  ],
};
