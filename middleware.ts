import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin secret from environment variable
const ADMIN_SECRET = process.env.ADMIN_SECRET || '14102004';
const CRON_SECRET = process.env.CRON_SECRET || '14102004';

// Protected routes
const PROTECTED_ROUTES = ['/admin'];
const PROTECTED_API_ROUTES = ['/api/admin', '/api/sync', '/api/sync-igg', '/api/scrape-details', '/api/admin/games'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login/logout pages and APIs without auth
  if (pathname === '/admin/login' || pathname === '/api/admin/login' || pathname === '/api/admin/logout') {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtectedPage = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isProtectedApi = PROTECTED_API_ROUTES.some(route => pathname.startsWith(route));

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  // Check for admin authentication
  // Method 1: Cookie
  const adminCookie = request.cookies.get('admin-auth')?.value;
  // Method 2: Header (for API requests)
  const adminHeader = request.headers.get('x-admin-secret');
  // Method 3: Query param (for initial access)
  const adminParam = request.nextUrl.searchParams.get('secret');
  // Method 4: Authorization header for /api/sync
  const authHeader = request.headers.get('authorization');

  const isAuthenticated = 
    adminCookie === ADMIN_SECRET ||
    adminHeader === ADMIN_SECRET ||
    adminParam === ADMIN_SECRET ||
    (isProtectedApi && authHeader === `Bearer ${CRON_SECRET}`);

  if (!isAuthenticated) {
    // For API routes, return 401
    if (isProtectedApi) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing admin secret' },
        { status: 401 }
      );
    }

    // For pages, redirect to login
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // If authenticated via query param, set cookie for future requests
  const response = NextResponse.next();
  
  if (adminParam === ADMIN_SECRET && !adminCookie) {
    response.cookies.set('admin-auth', ADMIN_SECRET, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/sync', '/api/sync-igg', '/api/scrape-details'],
};
