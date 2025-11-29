


// import { Request, Response, NextFunction } from "express";
// import { verifyJwt } from "../utils/jwt";

// export interface AuthedUser { userId: string; email?: string }
// declare module "express-serve-static-core" { interface Request { user?: AuthedUser } }

// export function requireAuth(req: Request, res: Response, next: NextFunction) {
//   try {
//     const m = (req.headers.authorization || "").match(/^Bearer\s+(.+)$/i);
//     const token =
//       (m && m[1]) ||
//       (req as any).cookies?.auth_token ||           // cookie fallback
//       (req.query.token as string | undefined);

//     if (!token) return res.status(401).json({ error: "Missing token" });

//     const payload = verifyJwt(token);
//     if (!payload?.userId) return res.status(401).json({ error: "Invalid token" });

//     req.user = { userId: payload.userId, email: payload.email };
//     next();
//   } catch {
//     return res.status(401).json({ error: "Invalid token" });
//   }
// }











// // backend/middleware/auth.middleware.ts
// import { Request, Response, NextFunction } from "express";
// import { verifyJwt } from "../utils/jwt";

// export interface AuthedUser { userId: string; email?: string }
// declare module "express-serve-static-core" { interface Request { user?: AuthedUser } }

// export function requireAuth(req: Request, res: Response, next: NextFunction) {
//   try {
//     const cookieName = process.env.COOKIE_NAME || "auth_token";

//     const m = (req.headers.authorization || "").match(/^Bearer\s+(.+)$/i);
//     const token =
//       (m && m[1]) ||
//       (req as any).cookies?.[cookieName] ||    // ✅ dynamic cookie name
//       (req.query.token as string | undefined);

//     if (!token) return res.status(401).json({ error: "Missing token" });

//     const payload = verifyJwt(token);
//     if (!payload?.userId) return res.status(401).json({ error: "Invalid token" });

//     req.user = { userId: payload.userId, email: payload.email };
//     next();
//   } catch {
//     return res.status(401).json({ error: "Invalid token" });
//   }
// }














// backend/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";

export interface AuthedUser {
  userId: string;
  email?: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthedUser;
  }
}

function extractToken(req: Request): string | null {
  const cookies = (req as any).cookies || {};

  // 1) Authorization header
  const m = (req.headers.authorization || "").match(/^Bearer\s+(.+)$/i);
  if (m && m[1]) return m[1];

  // 2) Cookies – support all names we’ve ever used
  const envCookieName = process.env.COOKIE_NAME || "auth_token";

  if (cookies[envCookieName]) return cookies[envCookieName];
  if (cookies["auth_token"]) return cookies["auth_token"];
  if (cookies["ion7dev_auth"]) return cookies["ion7dev_auth"];

  // 3) Optional token in query (for testing)
  if (typeof req.query.token === "string") return req.query.token;

  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const cookies = (req as any).cookies || {};
    const token = extractToken(req);

    if (!token) {
      console.error(
        "[requireAuth] Missing token. COOKIE_NAME=",
        process.env.COOKIE_NAME,
        "cookies=",
        Object.keys(cookies)
      );
      return res.status(401).json({ error: "Missing token" });
    }

    const payload: any = verifyJwt(token);

    if (!payload?.userId) {
      console.error("[requireAuth] Invalid token payload:", payload);
      return res.status(401).json({ error: "Invalid token" });
    }

    (req as any).user = { userId: payload.userId, email: payload.email };
    return next();
  } catch (err: any) {
    console.error("[requireAuth] Invalid token:", err?.message || err);
    return res.status(401).json({ error: "Invalid token" });
  }
}
