// // dashboard/middleware.js
// import { NextResponse } from 'next/server';

// // Routes that don't require auth
// const PUBLIC_PATHS = ['/', '/login', '/_next', '/favicon', '/images', '/fonts'];

// export function middleware(req) {
//   const { pathname } = req.nextUrl;

//   // Allow public assets and login
//   const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p));

//   // Read JWT from cookie (set by your login API)
//   const token = req.cookies.get('token')?.value || '';

//   // If already logged in and hitting /login, send to dashboard
//   if (token && pathname === '/login') {
//     const url = req.nextUrl.clone();
//     url.pathname = '/dashboard';
//     return NextResponse.redirect(url);
//   }

//   // Public route? allow through
//   if (isPublic) return NextResponse.next();

//   // Everything else requires auth
//   if (!token) {
//     const url = req.nextUrl.clone();
//     url.pathname = '/login';
//     url.searchParams.set('next', pathname);
//     return NextResponse.redirect(url);
//   }

//   return NextResponse.next();
// }

// // Don’t run middleware for /api or Next static assets
// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
// };













// // dashboard/middleware.js
// import { NextResponse } from "next/server";

// // Public auth + marketing routes
// const PUBLIC_PATHS = [
//   "/",
//   "/authentication/signin",
//   "/authentication/signup",
//   "/authentication/forgot-password",
//   "/welcome",
//   "/_next",
//   "/favicon.ico",
//   "/images",
//   "/fonts",
// ];

// // Only these routes require auth
// const PROTECTED_PREFIXES = ["/dashboard", "/editorpages"];

// function isPublic(pathname) {
//   return PUBLIC_PATHS.some(
//     (p) => pathname === p || pathname.startsWith(p + "/")
//   );
// }

// function isProtected(pathname) {
//   return PROTECTED_PREFIXES.some(
//     (p) => pathname === p || pathname.startsWith(p + "/")
//   );
// }

// export function middleware(req) {
//   const { pathname } = req.nextUrl;

//   // If not protected, allow always
//   if (!isProtected(pathname)) return NextResponse.next();

//   // Allow public routes (signin/signup/etc.)
//   if (isPublic(pathname)) return NextResponse.next();

//   // ✅ Read JWT from correct cookies
//   const cookieName =
//     process.env.NEXT_PUBLIC_COOKIE_NAME ||
//     process.env.COOKIE_NAME ||
//     "auth_token";

//   const token =
//     req.cookies.get(cookieName)?.value ||
//     req.cookies.get("auth_token")?.value ||
//     req.cookies.get("ion7dev_auth")?.value ||
//     "";

//   // If logged in and hitting signin, go dashboard
//   if (token && pathname === "/authentication/signin") {
//     const url = req.nextUrl.clone();
//     url.pathname = "/dashboard";
//     return NextResponse.redirect(url);
//   }

//   // No token → force to signin
//   if (!token) {
//     const url = req.nextUrl.clone();
//     url.pathname = "/authentication/signin";
//     url.searchParams.set("next", pathname);
//     return NextResponse.redirect(url);
//   }

//   return NextResponse.next();
// }

// // ✅ Run middleware ONLY for dashboard/editor
// export const config = {
//   matcher: ["/dashboard/:path*", "/editorpages/:path*"],
// };





















// // dashboard/middleware.js
// import { NextResponse } from "next/server";

// // Public pages (no auth required)
// const PUBLIC_PATHS = [
//   "/",                                  // Landing / marketing
//   "/welcome",                           // Post-payment setup screen
//   "/authentication/signin",
//   "/authentication/signup",
//   "/authentication/forgot-password",
//   "/authentication/reset-password",
// ];

// // Helper: is this path public?
// function isPublic(pathname) {
//   return PUBLIC_PATHS.some(
//     (p) => pathname === p || pathname.startsWith(p + "/")
//   );
// }

// export function middleware(req) {
//   const { pathname } = req.nextUrl;

//   // Skip Next.js assets & API routes (handled separately)
//   if (
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/api") ||
//     pathname === "/favicon.ico"
//   ) {
//     return NextResponse.next();
//   }

//   // -----------------------------
//   // Read token from cookies
//   // -----------------------------
//   const cookieName =
//     process.env.NEXT_PUBLIC_COOKIE_NAME ||
//     process.env.COOKIE_NAME ||
//     "auth_token";

//   const token =
//     req.cookies.get(cookieName)?.value ||
//     req.cookies.get("auth_token")?.value ||
//     req.cookies.get("ion7dev_auth")?.value ||
//     "";

//   const isAuthPage =
//     pathname === "/authentication/signin" ||
//     pathname.startsWith("/authentication");

//   // ✅ If logged in and going to signin/signup → send to dashboard
//   if (token && isAuthPage) {
//     const url = req.nextUrl.clone();
//     url.pathname = "/dashboard";
//     return NextResponse.redirect(url);
//   }

//   // ✅ Public routes: always allowed
//   if (isPublic(pathname)) {
//     return NextResponse.next();
//   }

//   // ✅ Everything else MUST have a token
//   if (!token) {
//     const url = req.nextUrl.clone();
//     url.pathname = "/authentication/signin";
//     url.searchParams.set("next", pathname);
//     return NextResponse.redirect(url);
//   }

//   // Authenticated → allow page
//   return NextResponse.next();
// }

// // Run middleware for all non-static, non-API routes
// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
// };




















// dashboard/middleware.js
import { NextResponse } from "next/server";

// Public pages (no auth required)
const PUBLIC_PATHS = [
  "/",                                  // Landing / marketing
  "/welcome",                           // Post-payment setup screen
  "/authentication/signin",
  "/authentication/signup",
  "/authentication/forgot-password",
  "/authentication/reset-password",
];

// Helper: is this path public?
function isPublic(pathname) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // Skip Next.js assets & API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // -----------------------------
  // Read token from cookies
  // -----------------------------
  const cookieName =
    process.env.NEXT_PUBLIC_COOKIE_NAME ||
    process.env.COOKIE_NAME ||
    "auth_token";

  const token =
    req.cookies.get(cookieName)?.value ||
    req.cookies.get("auth_token")?.value ||
    req.cookies.get("ion7dev_auth")?.value ||
    "";

  const isAuthPage =
    pathname === "/authentication/signin" ||
    pathname.startsWith("/authentication");

  // ✅ If logged in and going to signin/signup → send to dashboard
  if (token && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // ✅ Public routes: always allowed
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // -----------------------------
  // ❌ NO TOKEN → redirect to signin
  // -----------------------------
  if (!token) {
    const nextParam = pathname + (search || "");

    // Force production domain redirect
    if (process.env.NODE_ENV === "production") {
      const redirectUrl =
        `https://ion7dashboard.mavsketch.com/authentication/signin` +
        `?next=${encodeURIComponent(nextParam)}`;
      return NextResponse.redirect(redirectUrl);
    }

    // Dev (localhost)
    const url = req.nextUrl.clone();
    url.pathname = "/authentication/signin";
    url.search = `?next=${encodeURIComponent(nextParam)}`;
    return NextResponse.redirect(url);
  }

  // Authenticated → continue
  return NextResponse.next();
}

// Run middleware for all non-static, non-API routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
