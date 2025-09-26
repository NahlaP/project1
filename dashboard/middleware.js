// dashboard/middleware.js
import { NextResponse } from 'next/server';

// Routes that don't require auth
const PUBLIC_PATHS = ['/', '/login', '/_next', '/favicon', '/images', '/fonts'];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow public assets and login
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p));

  // Read JWT from cookie (set by your login API)
  const token = req.cookies.get('token')?.value || '';

  // If already logged in and hitting /login, send to dashboard
  if (token && pathname === '/login') {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Public route? allow through
  if (isPublic) return NextResponse.next();

  // Everything else requires auth
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Don’t run middleware for /api or Next static assets
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
