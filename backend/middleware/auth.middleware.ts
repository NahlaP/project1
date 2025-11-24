


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











// backend/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";

export interface AuthedUser { userId: string; email?: string }
declare module "express-serve-static-core" { interface Request { user?: AuthedUser } }

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const cookieName = process.env.COOKIE_NAME || "auth_token";

    const m = (req.headers.authorization || "").match(/^Bearer\s+(.+)$/i);
    const token =
      (m && m[1]) ||
      (req as any).cookies?.[cookieName] ||    // ✅ dynamic cookie name
      (req.query.token as string | undefined);

    if (!token) return res.status(401).json({ error: "Missing token" });

    const payload = verifyJwt(token);
    if (!payload?.userId) return res.status(401).json({ error: "Invalid token" });

    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
