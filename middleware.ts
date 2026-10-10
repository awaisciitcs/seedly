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

function handleUnavailable(pathname: string): NextResponse {
  const headers = { 'Retry-After': '30', 'X-Content-Type-Options': 'nosniff' };
  if (pathname.toLowerCase().startsWith('/api/admin')) {
    return applySecurityHeaders(NextResponse.json(
      { error: { message: 'Administrator services are temporarily unavailable. Please try again shortly.' } },
      { status: 503, headers }
    ));
  }

  return applySecurityHeaders(new NextResponse(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Admin dashboard temporarily unavailable</title><style>body{margin:0;background:#f7f8f6;color:#19372a;font-family:Arial,sans-serif;min-height:100vh;display:grid;place-items:center}main{max-width:34rem;margin:1.5rem;padding:2.5rem;background:white;border:1px solid #dde3dc;border-radius:1rem}h1{font-size:1.6rem;line-height:1.3;margin:0 0 1rem}p{color:#55645a;line-height:1.6;margin:0 0 1.5rem}a{display:inline-block;padding:.8rem 1.2rem;background:#19372a;color:white;border-radius:.5rem;text-decoration:none}a:focus-visible{outline:3px solid #799f85;outline-offset:3px}</style></head><body><main><h1>We cannot open the admin dashboard right now.</h1><p>Please wait a moment and try again.</p><a href="">Try again</a></main></body></html>',
    { status: 503, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': "base-uri 'self'; object-src 'none'; frame-ancestors 'none'", 'X-Frame-Options': 'DENY' } }
  ));
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
    return handleUnavailable(pathname);
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
