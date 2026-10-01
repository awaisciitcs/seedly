import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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

  try {
    let supabaseResponse = NextResponse.next({
      request,
    });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error('Supabase credentials missing in middleware');
      return handleUnauthorized(request, pathname);
    }

    const supabase = createServerClient(url, key, {
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

    // Protect admin API routes with 401 JSON
    if (pathname.startsWith('/api/admin')) {
      if (userError || !user) {
        return handleUnauthorized(request, pathname);
      }
      return applySecurityHeaders(supabaseResponse);
    }

    // Protect admin page routes
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      if (pathname === '/admin/login') {
        // If already logged in and visiting /admin/login, redirect to /admin dashboard
        if (user && !userError) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = '/admin';
          return applySecurityHeaders(NextResponse.redirect(redirectUrl));
        }
        return applySecurityHeaders(supabaseResponse);
      }

      // Any other /admin route requires a verified user
      if (userError || !user) {
        return handleUnauthorized(request, pathname);
      }
    }

    return applySecurityHeaders(supabaseResponse);
  } catch (err) {
    console.error('Unhandled error in admin auth middleware:', err);
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
