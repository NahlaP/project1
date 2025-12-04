// // og in production
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
//   const { pathname, search } = req.nextUrl;

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
//     url.search = "";
//     return NextResponse.redirect(url); // relative → same origin (local or prod)
//   }

//   // ✅ Public routes: always allowed
//   if (isPublic(pathname)) {
//     return NextResponse.next();
//   }

//   // Figure out host (for prod vs local)
//   const host = req.headers.get("host") || req.nextUrl.host;

//   // -----------------------------
//   // ❌ NO TOKEN → redirect to signin
//   // -----------------------------
//   if (!token) {
//     // ⛳ SPECIAL RULE FOR PRODUCTION:
//     // Always go to fixed URL:
//     // https://ion7dashboard.mavsketch.com/authentication/signin?next=/dashboard
//     if (host === "ion7dashboard.mavsketch.com") {
//       return NextResponse.redirect(
//         "https://ion7dashboard.mavsketch.com/authentication/signin?next=%2Fdashboard"
//       );
//     }

//     // 🖥️ Local / other hosts: keep old dynamic behavior
//     const url = req.nextUrl.clone();
//     url.pathname = "/authentication/signin";

//     const nextParam = pathname + (search || "");
//     if (nextParam && nextParam !== "/") {
//       url.search = `?next=${encodeURIComponent(nextParam)}`;
//     } else {
//       url.search = "";
//     }

//     return NextResponse.redirect(url); // relative → same origin
//   }

//   // ✅ Authenticated → continue
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

  // Skip Next.js assets & API routes (handled separately)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Figure out host (for prod vs local)
  const host = req.headers.get("host") || req.nextUrl.host;

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

  // ✅ If logged in and going to signin/signup:
  //    - In PRODUCTION: redirect to /dashboard
  //    - In LOCALHOST/DEV: allow access (no redirect)
  if (token && isAuthPage) {
    if (host === "ion7dashboard.mavsketch.com") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
    // dev/local → just continue so you can see /authentication/signin
    return NextResponse.next();
  }

  // ✅ Public routes: always allowed
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // -----------------------------
  // ❌ NO TOKEN → redirect to signin
  // -----------------------------
  if (!token) {
    // ⛳ SPECIAL RULE FOR PRODUCTION:
    // Always go to fixed URL:
    // https://ion7dashboard.mavsketch.com/authentication/signin?next=/dashboard
    if (host === "ion7dashboard.mavsketch.com") {
      return NextResponse.redirect(
        "https://ion7dashboard.mavsketch.com/authentication/signin?next=%2Fdashboard"
      );
    }

    // 🖥️ Local / other hosts: keep old dynamic behavior
    const url = req.nextUrl.clone();
    url.pathname = "/authentication/signin";

    const nextParam = pathname + (search || "");
    if (nextParam && nextParam !== "/") {
      url.search = `?next=${encodeURIComponent(nextParam)}`;
    } else {
      url.search = "";
    }

    return NextResponse.redirect(url);
  }

  // ✅ Authenticated → continue
  return NextResponse.next();
}

// Run middleware for all non-static, non-API routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
